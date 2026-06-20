const { BaseExtractor, Track } = require('discord-player');
const ytdl = require('youtube-dl-exec');
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
                
            const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${apiKey}`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                // Filter out videos that are already in the queue history
                const unplayedVideos = data.items.filter(v => {
                    const videoId = v.id.videoId;
                    return !history.tracks.some(t => t.url.includes(videoId));
                });
                
                const nextVideo = unplayedVideos[0] || data.items[1] || data.items[0];
                
                if (nextVideo) {
                    const videoId = nextVideo.id.videoId;
                    const url = `https://www.youtube.com/watch?v=${videoId}`;
                    
                    const newTrack = new Track(this.context.player, {
                        title: nextVideo.snippet.title,
                        url: url,
                        author: nextVideo.snippet.channelTitle || track.author,
                        thumbnail: nextVideo.snippet.thumbnails?.high?.url || null,
                        duration: '0:00', // We don't have duration from search snippet, but stream() handles it
                        source: 'youtube',
                        queryType: 'youtubeVideo',
                        extractor: this
                    });
                    
                    logger.info(`[YTDLPExtractor] Autoplay selected: ${newTrack.title}`);
                    return this.createResponse(null, [newTrack]);
                }
            }
        } catch (e) {
            logger.warn(`[YTDLPExtractor] Failed to get related tracks: ${e.message}`);
        }
        
        return this.createResponse(null, []);
    }

    async stream(info) {
        logger.info(`[YTDLPExtractor] Spawning yt-dlp to stream: ${info.url}`);
        
        // Use youtube-dl-exec to spawn yt-dlp and pipe the best audio format to stdout
        // Request WebM Opus if available, as Discord natively supports Opus.
        const subprocess = ytdl.exec(info.url, {
            o: '-', // Output to stdout
            f: 'bestaudio[ext=webm][acodec=opus]/bestaudio', // Prioritize Opus, fallback to bestaudio
            'js-runtimes': 'nodejs', // Tell yt-dlp to use nodejs for JS deciphering
            q: '', // Quiet
        }, { 
            stdio: ['ignore', 'pipe', 'ignore'] // We only need stdout
        });

        subprocess.on('error', (err) => {
            logger.error(`[YTDLPExtractor] yt-dlp process error: ${err.message}`);
        });

        // The stream property on our BaseExtractor allows discord-player to consume it directly
        return subprocess.stdout;
    }
}

module.exports = YTDLPExtractor;
