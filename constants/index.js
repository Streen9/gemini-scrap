module.exports = {
    SCRAPER_TYPES: {
        BOOKMYSHOW: 'bookmyshow',
        // Add more scraper types here as needed
    },

    URLS: {
        BOOKMYSHOW: 'https://in.bookmyshow.com/',
    },

    SELECTORS: {
        BOOKMYSHOW: {
            LOCATION_INPUT: 'input[type="text"]',
            MOVIES_LINK: 'a.bwc__sc-1shzs91-0:has-text("Movies")',
            MOVIES_LIST: '.sc-7o7nez-0'
        }
    },

    TIMEOUTS: {
        NAVIGATION: 60000,
        ELEMENT: 10000,
        ANIMATION: 2000
    },

    OUTPUT_PATHS: {
        MOVIES: 'movies.json'
    }
};