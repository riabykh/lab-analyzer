import OpenAI from 'openai';
import { z } from 'zod';
import { createLogger } from './logger';

const logger = createLogger('OpenAIService');

// Modern Zod schema for validation
const AnalysisResultSchema = z.object({
  results: z.array(z.object({
    test_name: z.string(),
    value: z.string(),
    unit: z.string().optional(),
    reference_range: z.string().optional(),
    status: z.enum(['normal', 'high', 'low', 'unknown']),
    interpretation: z.string()
  })),
  critical_findings: z.array(z.string()),
  summary: z.string(),
  recommendations: z.array(z.string())
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export interface OpenAIServiceConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature?: number;
}

export class ModernOpenAIService {
  private openai: OpenAI;
  private config: OpenAIServiceConfig;

  constructor(config: OpenAIServiceConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
    });

    logger.info('OpenAI Service initialized', {
      model: config.model,
      maxTokens: config.maxTokens
    });
  }

  async analyzeLabResults(text: string): Promise<AnalysisResult> {
    const timer = logger.time('OpenAI Analysis');
    
    try {
      logger.info('Starting lab results analysis', {
        textLength: text.length,
        model: this.config.model
      });

      // Modern streaming approach with error handling
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: this.getUserPrompt(text)
          }
        ],
        max_completion_tokens: this.config.maxTokens,
        response_format: { type: "json_object" },
        // Remove temperature for GPT-5 compatibility
        ...(this.config.temperature && !this.config.model.includes('gpt-5') && {
          temperature: this.config.temperature
        })
      });

      logger.debug('OpenAI response metadata', {
        id: completion.id,
        model: completion.model,
        finishReason: completion.choices[0]?.finish_reason,
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens
      });

      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error(`No content in OpenAI response. Finish reason: ${completion.choices[0]?.finish_reason}`);
      }

      // Parse and validate with Zod
      const analysis = this.parseAndValidateResponse(content);
      
      logger.info('Analysis completed successfully', {
        resultsCount: analysis.results.length,
        criticalFindings: analysis.critical_findings.length,
        recommendations: analysis.recommendations.length
      });

      timer.end();
      return analysis;

    } catch (error) {
      timer.end();
      logger.error('OpenAI analysis failed', error);
      throw error;
    }
  }

  async analyzeImage(imageData: string, mimeType: string): Promise<string> {
    const timer = logger.time('OpenAI Image OCR');
    
    try {
      logger.info('Starting image OCR analysis', {
        mimeType,
        dataLength: imageData.length
      });

      const ocrResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o-2024-11-20', // Use vision-capable model
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this image, especially lab test results. Return only the extracted text.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageData}`,
                },
              },
            ],
          },
        ],
        max_completion_tokens: 2000,
      });

      const extractedText = ocrResponse.choices[0]?.message?.content || '';
      
      logger.info('Image OCR completed', {
        extractedLength: extractedText.length
      });

      timer.end();
      return extractedText;

    } catch (error) {
      timer.end();
      logger.error('Image OCR failed', error);
      throw error;
    }
  }

  private parseAndValidateResponse(content: string): AnalysisResult {
    try {
      // Clean the response (remove markdown code blocks)
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanContent);
      
      // Validate with Zod schema
      const result = AnalysisResultSchema.parse(parsed);
      
      logger.debug('Response validation successful');
      return result;

    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Response validation failed', {
          errors: error.errors,
          rawContent: content.slice(0, 500)
        });
        throw new Error(`Invalid response format: ${error.errors.map(e => e.message).join(', ')}`);
      }
      
      if (error instanceof SyntaxError) {
        logger.error('JSON parsing failed', {
          error: error.message,
          rawContent: content.slice(0, 500)
        });
        throw new Error(`Invalid JSON response from AI: ${error.message}`);
      }
      
      throw error;
    }
  }

  private getSystemPrompt(): string {
    return `You are a medical lab results analyzer with expertise in interpreting clinical laboratory data. 

CRITICAL REQUIREMENTS:
- You MUST respond with valid JSON only
- Look for ANY medical values, lab tests, vital signs, or health measurements
- Be inclusive - include numbers with units, reference ranges, test names, medical terminology
- Do not include any text outside the JSON structure

Your analysis should be thorough, accurate, and clinically relevant.`;
  }

  private getUserPrompt(text: string): string {
    // Truncate text if too long to avoid token limits
    const maxTextLength = 4000;
    const truncatedText = text.length > maxTextLength 
      ? text.slice(0, maxTextLength) + '\n[Text truncated...]'
      : text;

    return `Analyze this medical document and extract ALL lab results, medical measurements, or health data:

RETURN ONLY this JSON structure:
{
  "results": [
    {
      "test_name": "Name of the test or measurement",
      "value": "The measured value",
      "unit": "Unit of measurement (if available)",
      "reference_range": "Normal range (if mentioned)",
      "status": "normal|high|low|unknown",
      "interpretation": "Clinical interpretation of this result"
    }
  ],
  "critical_findings": ["Any concerning values or abnormal results"],
  "summary": "Professional summary of the laboratory findings",
  "recommendations": ["Evidence-based recommendations for follow-up or lifestyle modifications"]
}

If no medical data is found, return:
{
  "results": [],
  "critical_findings": [],
  "summary": "No medical measurements or laboratory results identified in the document",
  "recommendations": ["Please ensure the document contains laboratory results or medical measurements"]
}

Document to analyze:
${truncatedText}`;
  }
}
