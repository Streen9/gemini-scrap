const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../config/logger");

class GeminiService {
    constructor() {
        this.validateConfig();
        this.initialize();
    }

    validateConfig() {
        if (!process.env.API_KEY) {
            console.log(process.env)
            const error = new Error('Gemini API key is not configured');
            logger.error('Missing API key configuration', { error });
            throw error;
        }
    }

    initialize() {
        try {
            this.googleAI = new GoogleGenerativeAI(process.env.API_KEY);
            this.config = {
                temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.9'),
                topP: parseInt(process.env.GEMINI_TOP_P || '1'),
                topK: parseInt(process.env.GEMINI_TOP_K || '1'),
                maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '4096'),
            };

            this.model = this.googleAI.getGenerativeModel({
                model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
                ...this.config,
            });

            logger.info('Gemini service initialized successfully', {
                model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
                config: this.config
            });
        } catch (error) {
            logger.error('Failed to initialize Gemini service', { error });
            throw error;
        }
    }

    async generateContent(prompt, retryCount = 3) {
        if (!prompt) {
            const error = new Error('Prompt is required');
            logger.error('Empty prompt provided', { error });
            throw error;
        }

        let lastError;
        for (let attempt = 1; attempt <= retryCount; attempt++) {
            try {
                logger.info('Generating content with Gemini', { 
                    promptLength: prompt.length,
                    attempt 
                });

                const result = await this.model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                logger.info('Successfully generated content', { 
                    responseLength: text.length,
                    attempt 
                });

                return text;

            } catch (error) {
                lastError = error;
                logger.warn('Failed to generate content', { 
                    error,
                    attempt,
                    remainingAttempts: retryCount - attempt 
                });

                // If this is not the last attempt, wait before retrying
                if (attempt < retryCount) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000); // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // If we've exhausted all retries, log and throw the error
        logger.error('Failed to generate content after all retry attempts', { 
            error: lastError,
            totalAttempts: retryCount 
        });
        throw lastError;
    }
}

// Create and export a singleton instance
const geminiService = new GeminiService();

module.exports = {
    geminiGenerate: (prompt) => geminiService.generateContent(prompt),
    geminiService, // Export the service instance for direct access if needed
};