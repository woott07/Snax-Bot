/**
 * Search Pipeline — Official YouTube Data API v3 search.
 *
 * ARCHITECTURE:
 * 1. User Input: "$play love mera hit hit"
 * 2. Is it a URL?
 *    - YES: Clean URL (strip radio mixes) and pass directly to extractor.
 *    - NO: Perform text search using YouTube Data API v3.
 * 3. YouTube Data API v3 resolves best matching video ID.
 * 4. Construct 'https://www.youtube.com/watch?v=VIDEO_ID'
 * 5. Return clean URL to discord-player-youtubei for extraction.
 */

const logger = require('../utils/logger');

// ─── URL Detection ────────────────────────────────────────────────────────────
const URL_REGEX = /^https?:\/\//i;
const YOUTUBE_URL_REGEX = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|music\.youtube\.com)\//i;
const PLAYLIST_REGEX = /[?&]list=/i;

/**
 * Determine if a query is a URL (direct link).
 */
function isUrl(query) {
    return URL_REGEX.test(query.trim());
}

/**
 * Determine if a URL is a YouTube playlist.
 */
function isPlaylist(query) {
    return PLAYLIST_REGEX.test(query);
}

/**
 * Clean a YouTube URL by extracting only the video ID.
 * Strips radio mix params (&list=RD...), tracking params (&pp=...), etc.
 */
function cleanYouTubeUrl(url) {
    try {
        const parsed = new URL(url);
        const videoId = parsed.searchParams.get('v');
        if (videoId && (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be'))) {
            // Check if there's a real playlist (not a radio mix)
            const list = parsed.searchParams.get('list');
            if (list && !list.startsWith('RD')) {
                // Real playlist — keep both v and list params
                return `https://www.youtube.com/watch?v=${videoId}&list=${list}`;
            }
            // Single video — clean URL
            return `https://www.youtube.com/watch?v=${videoId}`;
        }
    } catch {
        // URL parsing failed — return as-is
    }
    return url;
}

// ─── YouTube Data API v3 Search ───────────────────────────────────────────────
/**
 * Call the official YouTube Data API v3 to search for a video.
 * @param {string} query
 * @returns {Promise<{ url: string, title: string, id: string, apiResponse: any }>}
 */
async function searchWithYouTubeAPI(query) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
        throw new Error('YOUTUBE_API_KEY is missing from .env file.');
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${apiKey}`;

    logger.info(`[YouTube API] Fetching search results for: "${query}"`);
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
        // Handle specific API errors
        if (data.error && data.error.errors) {
            const reason = data.error.errors[0].reason;
            if (reason === 'quotaExceeded') {
                throw new Error('API_QUOTA_EXCEEDED');
            }
        }
        throw new Error(`YouTube API returned status ${response.status}: ${data.error?.message || 'Unknown error'}`);
    }

    if (data.items && data.items.length > 0) {
        const video = data.items[0];
        const videoId = video.id.videoId;
        const title = video.snippet.title;
        const url = `https://www.youtube.com/watch?v=${videoId}`;

        logger.info(`[YouTube API] Found video: "${title}" (${url})`);
        
        return {
            url,
            title,
            id: videoId,
            apiResponse: data // Passed back for debug logging in the command
        };
    }

    // No results found
    return null;
}

/**
 * Call the official YouTube Data API v3 to get metadata for a specific video ID.
 * @param {string} videoId 
 */
async function getYouTubeVideoMetadata(videoId) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return null;

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const video = data.items[0];
            
            // Parse ISO 8601 duration (e.g. PT4M13S)
            let duration = '0:00';
            const match = video.contentDetails?.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (match) {
                const h = parseInt(match[1] || 0);
                const m = parseInt(match[2] || 0);
                const s = parseInt(match[3] || 0);
                if (h > 0) {
                    duration = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                } else {
                    duration = `${m}:${s.toString().padStart(2, '0')}`;
                }
            }

            return {
                title: video.snippet?.title || 'YouTube Audio',
                author: video.snippet?.channelTitle || 'Unknown',
                thumbnail: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url || null,
                duration: duration
            };
        }
    } catch (e) {
        logger.warn(`[YouTube API] Failed to fetch metadata for ID ${videoId}`);
    }
    return null;
}

// ─── Main Search Pipeline ─────────────────────────────────────────────────────

/**
 * Resolve a user query into a playable YouTube URL.
 *
 * @param {string} query - The raw user input (text search or URL)
 * @returns {Promise<{ query: string, isDirectUrl: boolean, isPlaylistUrl: boolean, source: string, apiResponse?: any, videoId?: string }>}
 */
async function resolveQuery(query) {
    query = query.trim();

    // ── Step 1: Direct URL passthrough ────────────────────────────────────────
    if (isUrl(query)) {
        const cleanUrl = cleanYouTubeUrl(query);
        logger.info(`[SearchPipeline] Direct URL detected: ${cleanUrl}`);
        return {
            query: cleanUrl,
            isDirectUrl: true,
            isPlaylistUrl: isPlaylist(cleanUrl),
            source: 'direct-url'
        };
    }

    // ── Step 2: YouTube Data API v3 Text Search ────────────────────────────────
    const apiResult = await searchWithYouTubeAPI(query);
    
    if (apiResult) {
        return {
            query: apiResult.url,
            isDirectUrl: true, // We have converted it to a direct URL now
            isPlaylistUrl: false,
            source: 'youtube-data-api',
            apiResponse: apiResult.apiResponse,
            videoId: apiResult.id
        };
    }

    // ── Step 3: No Results ───────────────────────────────────────────────────
    logger.warn(`[SearchPipeline] YouTube Data API returned 0 results for "${query}".`);
    throw new Error('NO_RESULTS');
}

module.exports = {
    resolveQuery,
    isUrl,
    isPlaylist,
    cleanYouTubeUrl,
    getYouTubeVideoMetadata
};
