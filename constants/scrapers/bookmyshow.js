const { TIMEOUTS } = require('../common');

/**
 * BookMyShow specific constants
 */
module.exports = {
    NAME: 'bookmyshow',
    
    URL: {
        BASE: 'https://in.bookmyshow.com/',
        MOVIES: '/movies',
        EVENTS: '/events'
    },

    SELECTORS: {
        LOCATION: {
            INPUT: 'input[type="text"]',
            SUGGESTIONS: '.location-suggestions',
            SUBMIT: '.location-submit'
        },
        MOVIES: {
            LINK: 'a.bwc__sc-1shzs91-0:has-text("Movies")',
            LIST: '.sc-7o7nez-0',
            CARD: '.movie-card',
            TITLE: '.movie-title',
            LANGUAGE: '.movie-language',
            GENRE: '.movie-genre'
        },
        PAGINATION: {
            NEXT: '.next-page',
            PREV: '.prev-page',
            PAGE_NUMBERS: '.page-numbers'
        }
    },

    TIMEOUTS: {
        ...TIMEOUTS,
        LOCATION_SEARCH: 5000,
        MOVIE_LOAD: 8000
    },

    OUTPUT: {
        FILENAME: 'bookmyshow_movies.json',
        BACKUP_PATTERN: 'bookmyshow_movies_backup_{date}.json'
    },

    // Validation patterns
    PATTERNS: {
        LOCATION: /^[a-zA-Z\s]{2,50}$/,
        MOVIE_TITLE: /^.{1,200}$/
    },

    // Error messages
    ERRORS: {
        LOCATION_INVALID: 'Invalid location provided',
        LOCATION_NOT_FOUND: 'Location not found',
        MOVIE_FETCH_FAILED: 'Failed to fetch movies',
        PARSE_ERROR: 'Failed to parse movie data'
    }
};