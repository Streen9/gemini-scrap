const BookMyShowScraper = require('./scrapers/bookmyshow');

async function test() {
    const scraper = new BookMyShowScraper('vizianagaram');
    try {
        await scraper.scrape();
    } catch (error) {
        console.log('Detailed error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
}

test();