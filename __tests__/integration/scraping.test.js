const scraperManager = require('../../index');
const { SCRAPER_TYPES } = require('../../constants');
const fs = require('fs').promises;
const path = require('path');

describe('Scraping Integration Tests', () => {
    jest.setTimeout(30000); // Increase timeout for real scraping

    beforeEach(async () => {
        // Clean up test output directory
        try {
            await fs.rm(path.join(__dirname, '../../data'), { recursive: true });
        } catch (error) {
            // Directory might not exist
        }
    });

    describe('BookMyShow Scraper', () => {
        it('should scrape and save movie data', async () => {
            // Only run in CI environment to avoid hitting real websites locally
            if (process.env.CI) {
                const result = await scraperManager.runScraper(SCRAPER_TYPES.BOOKMYSHOW, {
                    location: 'Mumbai'
                });

                expect(result).toBeDefined();
                expect(Array.isArray(result.movies)).toBe(true);
                
                // Verify file was created
                const fileExists = await fs.access(path.join(__dirname, '../../data/bookmyshow_movies.json'))
                    .then(() => true)
                    .catch(() => false);
                expect(fileExists).toBe(true);
            } else {
                console.log('Skipping integration test in local environment');
            }
        });
    });
});