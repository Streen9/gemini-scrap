/**
 * Common constants shared across all scrapers
 */
module.exports = {
    TIMEOUTS: {
        NAVIGATION: 60000,
        ELEMENT: 10000,
        ANIMATION: 2000,
        REQUEST: 30000
    },

    OUTPUT_PATHS: {
        BASE_DIR: 'data',
        LOGS_DIR: 'logs'
    },

    BROWSER_CONFIG: {
        DEFAULT_VIEWPORT: {
            width: 1280,
            height: 720
        },
        DEFAULT_USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },

    HTTP_STATUS: {
        OK: 200,
        NOT_FOUND: 404,
        SERVER_ERROR: 500
    },

    RETRY_CONFIG: {
        MAX_RETRIES: 3,
        INITIAL_DELAY: 1000,
        MAX_DELAY: 8000
    }
};