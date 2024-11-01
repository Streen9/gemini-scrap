const playwright = require('playwright');
const geminiGenerate = require('./gemini').geminiGenerate;
const fs = require('fs');

(async () => {
    // Launch the browser (visible window mode)
    const browser = await playwright.chromium.launch({ headless: process.env.HEADLESS !== 'false' });

    // Create a new browser context with a custom User-Agent
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        viewport: { width: 1280, height: 720 } // Set viewport size
    });

    const page = await context.newPage();

    // Go to BookMyShow website
    await page.goto('https://in.bookmyshow.com/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Locate and fill the location input
    await page.waitForSelector('input[type="text"]', { timeout: 60000 });
    await page.fill('input[type="text"]', 'vizianagaram');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Click on the "Movies" section link
    await page.click('a.bwc__sc-1shzs91-0:has-text("Movies")');
    await page.waitForTimeout(2000);

    // Wait for the movies list to load
    await page.waitForSelector('.sc-7o7nez-0');

    const pageContent = await page.content();
    const moviesString = await geminiGenerate(`fetch the movies {names}, {languages}, {title} and {links} from this page content: ${pageContent}`);

    // Remove unwanted formatting
    const cleanedMoviesString = moviesString.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse the cleaned string to JSON
    let movies;
    try {
        movies = JSON.parse(cleanedMoviesString); // Ensure it's a valid JSON object
    } catch (error) {
        console.error('Error parsing movies data:', error);
        return; // Exit if parsing fails
    }

    // Write the JSON data to the file without any extra formatting
    fs.writeFileSync('movies.json', JSON.stringify(movies, null, 0)); // No indentation

    // Close the browser
    await browser.close();
})();