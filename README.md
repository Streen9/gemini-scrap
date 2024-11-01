# Web Scraper Framework

A modular, production-ready web scraping framework built with Node.js, Playwright, and Google's Gemini AI. This framework provides a robust foundation for creating and managing multiple web scrapers with proper error handling, logging, and configuration management.

## Features

- 🤖 Multiple scraper support with modular architecture
- 🎭 Powered by Playwright for reliable web automation
- 🧠 AI-enhanced data extraction using Google's Gemini
- 📝 Comprehensive logging with Winston
- ⚙️ Environment-based configuration
- 🔄 GitHub Actions integration for automated scraping
- 🚀 Production-ready error handling and retries
- 📦 Easy to extend and maintain

## Project Structure

``` markdown
└── scraper/
    ├── config/
    │   └── logger.js
    ├── constants/
    │   ├── common.js
    │   ├── index.js
    │   └── scrapers/
    │       ├── bookmyshow.js
    │       └── index.js
    ├── lib/
    │   └── browser.js
    ├── scrapers/
    │   ├── bookmyshow.js
    │   └── moviedb.js
    ├── utils/
    │   └── gemini.js
    ├── logs/
    │   ├── error.log
    │   └── combined.log
    ├── data/
    │   └── movies.json
    ├── index.js
    ├── package.json
    └── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Streen9/gemini-scrap.git
cd gemini-scrap
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
# Gemini API Configuration
API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.9

# Scraper Configuration
HEADLESS=true
LOG_LEVEL=info
```

## Usage

### Running a Scraper

```javascript
const scraperManager = require('./index');
const { SCRAPER_TYPES } = require('./constants');

// Run BookMyShow scraper
scraperManager.runScraper(SCRAPER_TYPES.BOOKMYSHOW, {
    location: 'vizianagaram'
})
    .then(result => console.log('Scraping completed:', result))
    .catch(error => console.error('Scraping failed:', error));
```

### Adding a New Scraper

1. Create constants for your scraper in `constants/scrapers/your-scraper.js`:

```javascript
const { TIMEOUTS } = require('../common');

module.exports = {
    NAME: 'your-scraper-name',
    URL: {
        BASE: 'https://example.com',
        // ... other URLs
    },
    SELECTORS: {
        // ... your selectors
    }
};
```

2. Create your scraper class in `scrapers/your-scraper.js`:

```javascript
const logger = require('../config/logger');
const browserManager = require('../lib/browser');

class YourScraper {
    constructor(options) {
        this.options = options;
    }

    async scrape() {
        // Implementation
    }
}

module.exports = YourScraper;
```

3. Register your scraper in `constants/scrapers/index.js`

## GitHub Actions Integration

The project includes GitHub Actions workflow for automated scraping. The workflow:

- Runs on a schedule (every once a day)
- Can be triggered manually
- Commits and pushes any changes to the repository

To use GitHub Actions:

1. Add your Gemini API key as a repository secret named `API_KEY`
2. Customize the schedule in `.github/workflows/cron.workflow.yml`

## Available Scrapers

### BookMyShow Scraper

Scrapes movie information from BookMyShow:

- Movie names
- Languages
- Show times
- Booking links

```javascript
scraperManager.runScraper(SCRAPER_TYPES.BOOKMYSHOW, {
    location: 'vizianagaram'
});
```

## Logging

Logs are stored in the `logs` directory:

- `error.log`: Contains error-level logs
- `combined.log`: Contains all logs

Configure log level in `.env`:

```env
LOG_LEVEL=info  # debug, info, warn, or error
```

## Error Handling

The framework includes comprehensive error handling:

- Automatic retries with exponential backoff
- Detailed error logging
- Graceful cleanup of resources
- Error notifications (configurable)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

## Support

For support, please:

1. Check existing issues
2. Open a new issue with:
   - Detailed description of the problem
   - Steps to reproduce
   - Relevant logs
   - Environment details

## Roadmap

- [ ] Add support for proxy rotation
- [ ] Implement rate limiting
- [ ] Add data validation schemas
- [ ] Create a CLI interface
- [ ] Add more scrapers
- [ ] Implement data export formats (CSV, Excel, JSON)
- [ ] Complete the test suite with unit and integration tests