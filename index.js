const playwright = require('playwright');
const fs = require('fs');
const geminiGenerate = require('./gemini').geminiGenerate;
(async () => {
    // Launch the browser (visible window mode)
    const browser = await playwright.chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Go to BookMyShow website
    await page.goto('https://in.bookmyshow.com/');
    await page.waitForTimeout(2000);

    // Locate and fill the location input
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', 'vizianagaram');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000); // Wait for page transition

    // Click on the "Movies" section link
    await page.click('a.bwc__sc-1shzs91-0:has-text("Movies")');
    await page.waitForTimeout(2000);

    // Wait for the movies list to load
    await page.waitForSelector('.sc-7o7nez-0');

    const pageContent = await page.content();
    const movies = await geminiGenerate(`fetch the movies {names}, {languages}, {title} and {links} from this page content: ${pageContent}`);



    fs.writeFileSync('movies.json', (movies)); // Save the data into file

    // console.log(movies);

    // Close the browser
    await browser.close();
})();
