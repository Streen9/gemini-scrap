const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../config/logger");

class GeminiService {
    constructor() {
        this.validateConfig();
        this.initialize();
    }

    validateConfig() {
        if (!process.env.API_KEY) {
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

            logger.info('Gemini service initialized', {
                model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
                config: this.config
            });
        } catch (error) {
            logger.error('Gemini initialization failed', {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                }
            });
            throw error;
        }
    }

    async generateContent(prompt, retryCount = 3) {
        if (!prompt) {
            const error = new Error('Prompt is required');
            logger.error('Empty prompt provided', { error });
            throw error;
        }

        // Validate prompt length
        if (prompt.length > 1000000) {
            const error = new Error('Prompt too long');
            logger.error('Prompt exceeds maximum length', {
                promptLength: prompt.length
            });
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

                if (!result || !result.response) {
                    throw new Error('Invalid response from Gemini API');
                }

                const response = result.response;
                const text = response.text();

                if (!text) {
                    throw new Error('Empty response from Gemini API');
                }

                logger.info('Successfully generated content', {
                    responseLength: text.length,
                    attempt
                });

                // Verify the response looks like JSON
                if (prompt.includes('fetch') && !text.includes('{')) {
                    throw new Error('Response does not appear to be JSON formatted');
                }

                return text;

            } catch (error) {
                lastError = error;
                logger.warn('Failed to generate content', {
                    error: {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    },
                    attempt,
                    remainingAttempts: retryCount - attempt
                });

                if (attempt < retryCount) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        logger.error('All Gemini generation attempts failed', {
            error: {
                name: lastError.name,
                message: lastError.message,
                stack: lastError.stack
            },
            totalAttempts: retryCount
        });
        throw lastError;
    }
}

// Create and export a singleton instance
const geminiService = new GeminiService();

module.exports = {
    geminiGenerate: (prompt) => geminiService.generateContent(prompt),
    geminiService
};