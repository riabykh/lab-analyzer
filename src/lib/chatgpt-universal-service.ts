import OpenAI from 'openai';
import { z } from 'zod';
import { createLogger } from './logger';

const logger = createLogger('ChatGPTUniversalService');

// Define the schema for the expected analysis response
const AnalysisResultSchema = z.object({
  test_name: z.string(),
  value: z.string(),
  unit: z.string().optional(),
  reference_range: z.string().optional(),
  status: z.enum(['normal', 'high', 'low', 'unknown']),
  interpretation: z.string(),
});

const AnalysisResponseSchema = z.object({
  results: z.array(AnalysisResultSchema),
  critical_findings: z.array(z.string()),
  summary: z.string(),
  recommendations: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;

export interface ChatGPTConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export class ChatGPTUniversalService {
  private openai: OpenAI;
  private config: ChatGPTConfig;

  constructor(config: ChatGPTConfig) {
    this.config = {
      model: 'gpt-4o-2024-11-20', // Default to vision-capable model
      maxTokens: 8000,
      ...config
    };
    
    this.openai = new OpenAI({ apiKey: this.config.apiKey });
    logger.info('ChatGPT Universal Service initialized', { 
      model: this.config.model, 
      maxTokens: this.config.maxTokens 
    });
  }

  /**
   * Universal file processor using ChatGPT Vision API
   * Handles ALL file types: PDF, images, text files
   */
  async processFile(file: File): Promise<AnalysisResponse> {
    const timer = logger.time('Universal File Processing');
    const requestId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    try {
      logger.info('Starting universal file processing', {
        requestId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });

      let analysisResult: AnalysisResponse;

      if (file.type === 'text/plain') {
        // Handle text files directly
        const text = await file.text();
        analysisResult = await this.analyzeTextContent(text, requestId);
        
      } else if (file.type === 'application/pdf') {
        // Note: ChatGPT Vision API doesn't directly support PDFs
        // For best results with PDFs containing lab results:
        throw new Error(
          'For PDF analysis, please either:\n' +
          '1. Convert your PDF to an image (PNG/JPG) for our AI Vision analysis, or\n' +
          '2. Copy the text from your PDF and upload as a text file (.txt)\n\n' +
          'This ensures the most accurate analysis of your lab results!'
        );
        
      } else if (file.type.startsWith('image/')) {
        // Handle images using Vision API
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        const mimeType = file.type;
        
        analysisResult = await this.analyzeFileWithVision(base64Data, mimeType, requestId);
        
      } else {
        throw new Error(`Unsupported file type: ${file.type}. Please upload an image (PNG, JPG) or text file.`);
      }

      logger.info('Universal file processing completed', {
        requestId,
        resultsCount: analysisResult.results.length,
        criticalFindings: analysisResult.critical_findings.length,
        processingTime: timer.end()
      });

      return analysisResult;

    } catch (error) {
      timer.end();
      logger.error('Universal file processing failed', error instanceof Error ? error : { error: String(error) });
      throw error;
    }
  }


  /**
   * Analyze text content directly
   */
  private async analyzeTextContent(text: string, requestId: string): Promise<AnalysisResponse> {
    const timer = logger.time('Text Analysis');
    
    try {
      logger.info('Analyzing text content', { requestId, textLength: text.length });

      const completion = await this.openai.chat.completions.create({
        model: this.config.model!,
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
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No content in ChatGPT response. Finish reason: ${completion.choices[0]?.finish_reason}`);
      }

      const analysis = this.parseAndValidateResponse(content);
      
      logger.info('Text analysis completed', {
        requestId,
        resultsCount: analysis.results.length,
        finishReason: completion.choices[0]?.finish_reason
      });

      timer.end();
      return analysis;

    } catch (error) {
      timer.end();
      logger.error('Text analysis failed', error instanceof Error ? error : { error: String(error) });
      throw error;
    }
  }

  /**
   * Analyze files using ChatGPT Vision API (PDFs and images)
   */
  private async analyzeFileWithVision(base64Data: string, mimeType: string, requestId: string): Promise<AnalysisResponse> {
    const timer = logger.time('Vision Analysis');
    
    try {
      logger.info('Analyzing file with Vision API', { 
        requestId, 
        mimeType, 
        dataLength: base64Data.length 
      });

      const completion = await this.openai.chat.completions.create({
        model: this.config.model!,
        messages: [
          {
            role: 'system',
            content: this.getVisionSystemPrompt()
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: this.getVisionUserPrompt(mimeType)
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        max_completion_tokens: this.config.maxTokens,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No content in ChatGPT Vision response. Finish reason: ${completion.choices[0]?.finish_reason}`);
      }

      const analysis = this.parseAndValidateResponse(content);
      
      logger.info('Vision analysis completed', {
        requestId,
        resultsCount: analysis.results.length,
        finishReason: completion.choices[0]?.finish_reason
      });

      timer.end();
      return analysis;

    } catch (error) {
      timer.end();
      logger.error('Vision analysis failed', error instanceof Error ? error : { error: String(error) });
      throw error;
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert medical lab results analyzer specializing in interpreting laboratory tests, medical measurements, and health data.

Your task is to:
1. Extract ALL medical measurements, lab values, and health data
2. Interpret each result in plain language
3. Identify any critical or concerning findings
4. Provide actionable health recommendations

IMPORTANT: You MUST respond with valid JSON only. No additional text, explanations, or markdown formatting.

Output format:
{
  "results": [
    {
      "test_name": "Name of the test or measurement",
      "value": "The measured value",
      "unit": "Unit of measurement (if available)",
      "reference_range": "Normal range (if mentioned)",
      "status": "normal|high|low|unknown",
      "interpretation": "Plain language explanation"
    }
  ],
  "critical_findings": ["Any concerning values or urgent attention needed"],
  "summary": "Overall summary of findings",
  "recommendations": ["Actionable health recommendations"]
}

Be thorough, accurate, and clinically relevant in your analysis.`;
  }

  private getUserPrompt(text: string): string {
    // Intelligent truncation for text content
    const maxLength = 6000;
    let processedText = text;
    
    if (text.length > maxLength) {
      processedText = this.intelligentTruncate(text, maxLength);
    }

    return `Analyze this medical document and extract ALL lab results, medical measurements, or health data:

RETURN ONLY valid JSON in the specified format.

Document content:
${processedText}`;
  }

  private getVisionSystemPrompt(): string {
    return `You are an expert medical document analyzer with advanced OCR capabilities. You can read and interpret medical documents, lab reports, and health records from images and PDFs.

Your task is to:
1. Read and extract ALL text and data from the document
2. Identify medical measurements, lab values, and health data
3. Interpret findings in plain language
4. Provide medical insights and recommendations

IMPORTANT: You MUST respond with valid JSON only. No additional text, explanations, or markdown formatting.

Output format:
{
  "results": [
    {
      "test_name": "Name of the test or measurement",
      "value": "The measured value",
      "unit": "Unit of measurement (if available)",
      "reference_range": "Normal range (if mentioned)",
      "status": "normal|high|low|unknown",
      "interpretation": "Plain language explanation"
    }
  ],
  "critical_findings": ["Any concerning values or urgent attention needed"],
  "summary": "Overall summary of findings",
  "recommendations": ["Actionable health recommendations"]
}

Be thorough in reading the document and accurate in your medical interpretations.`;
  }

  private getVisionUserPrompt(mimeType: string): string {
    const fileType = mimeType.includes('pdf') ? 'PDF document' : 'image';
    
    return `Please analyze this ${fileType} containing medical/laboratory information:

1. READ ALL TEXT AND DATA from the document
2. EXTRACT medical measurements, lab results, vital signs, and health data
3. INTERPRET findings and provide insights
4. IDENTIFY any critical or concerning values

Focus on:
- Lab test names and results
- Medical measurements with units (mg/dL, mmol/L, etc.)
- Reference ranges and normal values
- Patient information and test dates
- Any abnormal or critical findings

RETURN ONLY valid JSON in the specified format. No additional text or explanations.`;
  }

  private intelligentTruncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    // Medical keywords to prioritize
    const medicalKeywords = [
      'lab', 'test', 'result', 'blood', 'glucose', 'cholesterol', 'hemoglobin',
      'CBC', 'metabolic', 'panel', 'mg/dL', 'mmol/L', 'normal', 'high', 'low',
      'reference', 'range', 'abnormal', 'critical', 'value', 'patient'
    ];
    
    const sentences = text.split(/[.!?]\s+/);
    let result = '';
    let length = 0;
    
    // First pass: prioritize sentences with medical keywords
    for (const sentence of sentences) {
      const hasKeyword = medicalKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasKeyword && length + sentence.length < maxLength - 100) {
        result += sentence + '. ';
        length += sentence.length + 2;
      }
    }
    
    // Second pass: fill remaining space
    for (const sentence of sentences) {
      if (!result.includes(sentence) && length + sentence.length < maxLength - 50) {
        result += sentence + '. ';
        length += sentence.length + 2;
      }
    }
    
    return result + '\n[Content truncated to preserve medical information...]';
  }

  private parseAndValidateResponse(content: string): AnalysisResponse {
    try {
      // Clean potential markdown formatting
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const parsed = JSON.parse(cleanContent);
      return AnalysisResponseSchema.parse(parsed);
      
    } catch (error) {
      logger.error('JSON parsing or validation failed', error instanceof Error ? error : { error: String(error) });
      throw new Error(`Invalid ChatGPT response format: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
