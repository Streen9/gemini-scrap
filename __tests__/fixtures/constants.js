// __tests__/fixtures/constants.js

const MOCK_CONSTANTS = {
    SCRAPER_TYPES: {
        bookmyshow: 'bookmyshow'
    },
    
    OUTPUT_PATHS: {
        BASE_DIR: '/mock/output'
    },

    BOOKMYSHOW_CONSTANTS: {
        PATTERNS: {
            LOCATION: /^[a-zA-Z]+$/
        },
        ERRORS: {
            LOCATION_INVALID: 'Invalid location',
            LOCATION_NOT_FOUND: 'Location not found',
            NAVIGATION_FAILED: 'Navigation failed',
            MOVIES_NOT_FOUND: 'Movies not found'
        },
        URL: {
            BASE: 'https://bookmyshow.com',
            MOVIES: 'https://bookmyshow.com/movies'
        },
        TIMEOUTS: {
            NAVIGATION: 30000,
            ELEMENT: 5000,
            ANIMATION: 1000,
            LOCATION_SEARCH: 1000
        },
        SELECTORS: {
            LOCATION: {
                INPUT: '#location-input',
                SUBMIT: '#location-submit'
            },
            MOVIES: {
                LINK: '#movies-link',
                LIST: '#movies-list',
                TITLE: '.movie-title',
                LANGUAGE: '.movie-language'
            }
        },
        OUTPUT: {
            FILENAME: 'movies.json',
            BACKUP_PATTERN: 'movies-{date}.json'
        }
    }
};

const getScraperConstants = (type) => {
    switch (type) {
        case MOCK_CONSTANTS.SCRAPER_TYPES.bookmyshow:
            return MOCK_CONSTANTS.BOOKMYSHOW_CONSTANTS;
        default:
            throw new Error('Invalid scraper type');
    }
};

module.exports = {
    ...MOCK_CONSTANTS,
    getScraperConstants
};