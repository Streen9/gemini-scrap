const scraperManager = require('../index');
const { SCRAPER_TYPES } = require('../constants/scrapers');

// Mock the bookmyshow scraper
jest.mock('../scrapers/bookmyshow');

describe('Scraper Manager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should run BookMyShow scraper successfully', async () => {
        const mockData = { movies: ['movie1', 'movie2'] };
        const BookMyShowScraper = require('../scrapers/bookmyshow');
        
        // Mock the constructor and scrape method
        BookMyShowScraper.mockImplementation(function() {
            this.scrape = jest.fn().mockResolvedValue(mockData);
            return this;
        });

        const result = await scraperManager.runScraper(SCRAPER_TYPES.bookmyshow, {
            location: 'testCity'
        });

        expect(result).toEqual(mockData);
        expect(BookMyShowScraper).toHaveBeenCalledWith('testCity');
    });

    it('should throw error for invalid scraper type', async () => {
        await expect(
            scraperManager.runScraper('invalid-type')
        ).rejects.toThrow('Unsupported scraper type');
    });

    it('should handle scraper errors', async () => {
        const BookMyShowScraper = require('../scrapers/bookmyshow');
        
        // Mock the constructor and scrape method to throw an error
        BookMyShowScraper.mockImplementation(function() {
            this.scrape = jest.fn().mockRejectedValue(new Error('Scraping failed'));
            return this;
        });

        await expect(
            scraperManager.runScraper(SCRAPER_TYPES.bookmyshow)
        ).rejects.toThrow('Scraping failed');
    });
});