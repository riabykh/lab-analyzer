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

      // Check if text is too long and chunk if necessary
      const maxTextLength = 8000; // Conservative limit for context
      let processedText = text;
      
      if (text.length > maxTextLength) {
        logger.warn('Text too long, truncating for analysis', {
          originalLength: text.length,
          truncatedLength: maxTextLength
        });
        
        // Intelligent truncation - try to keep medical terms at the beginning
        processedText = this.intelligentTruncate(text, maxTextLength);
      }

      // Increase token limit for better results
      const adaptiveTokenLimit = Math.min(8000, Math.max(3000, Math.floor(processedText.length / 2)));

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
            content: this.getUserPrompt(processedText)
          }
        ],
        max_completion_tokens: adaptiveTokenLimit,
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
            role: 'system',
            content: 'You are an expert OCR system specialized in medical documents and lab results. Extract all text accurately, preserving medical terminology, numbers, units, and structure.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please extract ALL text from this ${mimeType.includes('pdf') ? 'PDF document' : 'image'}, especially focusing on:
- Lab test names and results
- Medical measurements with units (mg/dL, mmol/L, etc.)
- Reference ranges and normal values
- Patient information and test dates
- Any medical terminology or clinical notes

Preserve the original structure and formatting. Return the complete extracted text.`
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
        max_completion_tokens: 4000, // Increased for better OCR results
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

  private intelligentTruncate(text: string, maxLength: number): string {
    // Try to preserve medical terms and lab values at the beginning
    const medicalKeywords = [
      'lab', 'test', 'result', 'blood', 'glucose', 'cholesterol', 'hemoglobin',
      'CBC', 'metabolic', 'panel', 'mg/dL', 'mmol/L', 'normal', 'high', 'low',
      'reference', 'range', 'abnormal', 'critical', 'value'
    ];
    
    if (text.length <= maxLength) return text;
    
    // Look for sections that contain medical keywords
    const sentences = text.split(/[.!?]\s+/);
    let result = '';
    let length = 0;
    
    // First pass: add sentences with medical keywords
    for (const sentence of sentences) {
      const hasKeyword = medicalKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasKeyword && length + sentence.length < maxLength - 100) {
        result += sentence + '. ';
        length += sentence.length + 2;
      }
    }
    
    // Second pass: fill remaining space with other sentences
    for (const sentence of sentences) {
      if (!result.includes(sentence) && length + sentence.length < maxLength - 50) {
        result += sentence + '. ';
        length += sentence.length + 2;
      }
    }
    
    return result + '\n[Text intelligently truncated to preserve medical content...]';
  }

  private getUserPrompt(text: string): string {
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
