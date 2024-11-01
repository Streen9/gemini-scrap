// Mock the Google Generative AI library
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockResolvedValue({
                    response: {
                        text: () => 'test response'
                    }
                })
            })
        }))
    };
});

const { geminiGenerate, geminiService } = require('../../utils/gemini');

describe('Gemini Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize successfully', () => {
            expect(geminiService).toBeDefined();
        });

        it('should handle missing API key', () => {
            const originalKey = process.env.API_KEY;
            delete process.env.API_KEY;

            expect(() => {
                const GeminiService = require('../../utils/gemini').GeminiService;
                new GeminiService();
            }).toThrow('Gemini API key is not configured');

            process.env.API_KEY = originalKey;
        });
    });

    describe('content generation', () => {
        it('should generate content successfully', async () => {
            const response = await geminiGenerate('test prompt');
            expect(response).toBe('test response');
        });

        it('should handle empty prompts', async () => {
            await expect(geminiGenerate('')).rejects.toThrow('Prompt is required');
        });

        it('should handle null prompts', async () => {
            await expect(geminiGenerate(null)).rejects.toThrow('Prompt is required');
        });

        it('should handle API errors', async () => {
            const GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
            GoogleGenerativeAI.mockImplementationOnce(() => ({
                getGenerativeModel: () => ({
                    generateContent: jest.fn().mockRejectedValue(new Error('API Error'))
                })
            }));

            await expect(geminiGenerate('test')).rejects.toThrow('API Error');
        });

        it('should handle invalid responses', async () => {
            const GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
            GoogleGenerativeAI.mockImplementationOnce(() => ({
                getGenerativeModel: () => ({
                    generateContent: jest.fn().mockResolvedValue({
                        response: { text: () => null }
                    })
                })
            }));

            await expect(geminiGenerate('test')).rejects.toThrow('Empty response from Gemini API');
        });
    });
});