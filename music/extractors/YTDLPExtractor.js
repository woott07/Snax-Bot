const { BaseExtractor, Track } = require('discord-player');
const ytdl = require('youtube-dl-exec');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const logger = require('../../utils/logger');

class YTDLPExtractor extends BaseExtractor {
    static identifier = 'YTDLPExtractor';

    async validate(query, type) {
        // We only want to handle direct YouTube URLs (or queries that our search pipeline has resolved into URLs)
        if (typeof query !== 'string') return false;
        return query.includes('youtube.com/watch') || query.includes('youtu.be/');
    }

    async handle(query, context) {
        let title = 'YouTube Audio';
        let author = 'Unknown';
        let duration = '0:00';
        let thumbnail = null;

        try {
            // Extract Video ID from URL
            const urlObj = new URL(query);
            const videoId = urlObj.searchParams.get('v');
            if (videoId) {
                const { getYouTubeVideoMetadata } = require('../searchPipeline');
                const metadata = await getYouTubeVideoMetadata(videoId);
                if (metadata) {
                    title = metadata.title;
                    author = metadata.author;
                    duration = metadata.duration;
                    thumbnail = metadata.thumbnail;
                }
            }
        } catch (e) {
            logger.warn(`[YTDLPExtractor] Failed to extract metadata for URL: ${query}`);
        }
        
        return {
            playlist: null,
            tracks: [
                new Track(this.context.player, {
                    title,
                    url: query,
                    author,
                    description: title,
                    thumbnail,
                    duration,
                    views: 0,
                    requestedBy: context.requestedBy,
                    source: 'youtube',
                    queryType: 'youtubeVideo',
                    extractor: this
                })
            ]
        };
    }

    async getRelatedTracks(track, history) {
        try {
            logger.info(`[YTDLPExtractor] Fetching related tracks for: ${track.title}`);
            
            const apiKey = process.env.YOUTUBE_API_KEY;
            if (!apiKey) return this.createResponse(null, []);

            // Search for other songs by the same author
            const query = track.author && track.author !== 'Unknown' 
                ? `${track.author} music` 
                : `${track.title} music`;
                
            const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${apiKey}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) return this.createResponse(null, []);

            // ── Fetch durations in one batch to filter out Shorts (≤60s) ──────────
            const videoIds = data.items.map(v => v.id.videoId).join(',');
            const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
            const detailsRes = await fetch(detailsUrl);
            const detailsData = await detailsRes.json();

            const durationMap = {};
            if (detailsData.items) {
                for (const item of detailsData.items) {
                    const iso = item.contentDetails?.duration || '';
                    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                    if (m) {
                        durationMap[item.id] = (parseInt(m[1] || 0) * 3600)
                                             + (parseInt(m[2] || 0) * 60)
                                             +  parseInt(m[3] || 0);
                    }
                }
            }

            // Filter: not in history AND not a Short
            const candidates = data.items.filter(v => {
                const vid = v.id.videoId;
                const dur = durationMap[vid] ?? 999;
                const alreadyPlayed = history.tracks.some(t => t.url.includes(vid));
                if (alreadyPlayed) return false;
                if (dur > 0 && dur <= 60) {
                    logger.info(`[YTDLPExtractor] Autoplay skipping Short: "${v.snippet.title}" (${dur}s)`);
                    return false;
                }
                return true;
            });

            const nextVideo = candidates[0];
            if (nextVideo) {
                const videoId = nextVideo.id.videoId;
                const url = `https://www.youtube.com/watch?v=${videoId}`;
                
                const newTrack = new Track(this.context.player, {
                    title: nextVideo.snippet.title,
                    url,
                    author: nextVideo.snippet.channelTitle || track.author,
                    thumbnail: nextVideo.snippet.thumbnails?.high?.url || null,
                    duration: '0:00',
                    source: 'youtube',
                    queryType: 'youtubeVideo',
                    extractor: this
                });
                
                logger.info(`[YTDLPExtractor] Autoplay selected: ${newTrack.title} (${durationMap[videoId]}s)`);
                return this.createResponse(null, [newTrack]);
            }
        } catch (e) {
            logger.warn(`[YTDLPExtractor] Failed to get related tracks: ${e.message}`);
        }
        
        return this.createResponse(null, []);
    }

    async stream(info) {
        logger.info(`[YTDLPExtractor] Spawning yt-dlp → FFmpeg (loudnorm) pipeline for: ${info.url}`);

        // ── Step 1: yt-dlp — fetch best audio, pipe raw bytes to stdout ──────────
        const ytdlpProcess = ytdl.exec(info.url, {
            o: '-',                                          // stdout
            f: 'bestaudio[ext=webm][acodec=opus]/bestaudio/best',
            'js-runtimes': 'nodejs',
            q: '',                                           // quiet
        }, {
            stdio: ['ignore', 'pipe', 'ignore']
        });

        // ── Step 2: FFmpeg — loudnorm → OGG/Opus ─────────────────────────────────
        //
        //   Output format: OGG/Opus (not WAV/PCM)
        //   WHY: @discordjs/voice detects OGG/Opus via its built-in OggOpusDemuxer
        //        and sends Opus frames directly to Discord — zero double-encoding.
        //        WAV piped streams have a 0-byte RIFF size header that causes
        //        @discordjs/voice FFmpeg to stop reading immediately.
        //
        //   loudnorm=I=-14        Target integrated loudness: -14 LUFS
        //           :TP=-1.5      True Peak ceiling: -1.5 dBTP (prevents clipping)
        //           :LRA=11       Loudness Range: 11 LU (preserves natural dynamics)
        //           :linear=true  Single-pass linear gain — no pumping or breathing
        //           :print_format=none  Suppress JSON loudness report from stderr
        //
        const ffmpegProcess = spawn(ffmpegPath, [
            '-loglevel', 'error',
            '-i', 'pipe:0',
            '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:print_format=none',
            '-c:a', 'libopus',             // encode to Opus
            '-b:a', '128k',               // 128 kbps (Discord sweet spot)
            '-vbr', 'on',                  // variable bitrate — better quality
            '-application', 'audio',       // optimize encoder for music (vs speech)
            '-ar', '48000',               // 48kHz (Discord requirement)
            '-ac', '2',                    // stereo
            '-f', 'ogg',                   // OGG container — streamable, no size header issue
            'pipe:1'
        ], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // ── Pipe yt-dlp → FFmpeg ─────────────────────────────────────────────────
        ytdlpProcess.stdout.pipe(ffmpegProcess.stdin);

        // Suppress tinyspawn's SIGTERM rejection — it fires when we kill yt-dlp
        // during cleanup (expected behavior, not a real error).
        if (typeof ytdlpProcess.catch === 'function') {
            ytdlpProcess.catch(() => {});
        }

        // ── Error handling ────────────────────────────────────────────────────────
        ytdlpProcess.on('error', (err) => {
            logger.error(`[YTDLPExtractor] yt-dlp error: ${err.message}`);
            ffmpegProcess.stdin.destroy();
        });

        ffmpegProcess.stderr.on('data', (data) => {
            const msg = data.toString().trim();
            if (msg) logger.warn(`[FFmpeg] ${msg}`);
        });

        ffmpegProcess.on('error', (err) => {
            logger.error(`[YTDLPExtractor] FFmpeg error: ${err.message}`);
        });

        // Clean up FFmpeg if yt-dlp closes early
        ytdlpProcess.on('close', (code) => {
            if (code !== 0 && code !== null) {
                logger.warn(`[YTDLPExtractor] yt-dlp exited with code ${code}`);
            }
            ffmpegProcess.stdin.end();
        });

        // Clean up yt-dlp if FFmpeg closes early
        ffmpegProcess.on('close', (code) => {
            if (code !== 0 && code !== null) {
                logger.warn(`[YTDLPExtractor] FFmpeg exited with code ${code}`);
            }
            ytdlpProcess.kill();
        });

        // Return the normalized WAV stream — discord-player's internal FFmpeg transcodes this to Opus
        return ffmpegProcess.stdout;
    }
}

module.exports = YTDLPExtractor;
