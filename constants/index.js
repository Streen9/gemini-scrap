/**
 * Main constants entry point
 */
const common = require('./common');
const scrapers = require('./scrapers');

module.exports = {
    ...common,
    ...scrapers,
    
    // Helper function to get scraper constants
    getScraperConstants: (scraperType) => {
        const constants = scrapers.SCRAPERS[scraperType];
        if (!constants) {
            throw new Error(`No constants found for scraper type: ${scraperType}`);
        }
        return constants;
    }
};