/**
 * Export all scraper constants and maintain a registry
 */
const bookmyshow = require('./bookmyshow');

const SCRAPER_TYPES = {
    [bookmyshow.NAME]: bookmyshow.NAME
};

// Registry of all scrapers
const SCRAPERS = {
    [bookmyshow.NAME]: bookmyshow
};

module.exports = {
    SCRAPER_TYPES,
    SCRAPERS,
    // Individual exports for backward compatibility
    bookmyshow
};