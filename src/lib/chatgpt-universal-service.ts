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
        // Handle PDFs using OpenAI's native file upload and analysis
        const buffer = await file.arrayBuffer();
        analysisResult = await this.analyzePDFWithChatGPT(buffer, file.name, requestId);
        
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
   * Analyze PDF using OpenAI's native file upload and ChatGPT
   */
  private async analyzePDFWithChatGPT(buffer: ArrayBuffer, fileName: string, requestId: string): Promise<AnalysisResponse> {
    const timer = logger.time('PDF ChatGPT Analysis');
    
    try {
      logger.info('Starting PDF analysis with ChatGPT native file upload', { 
        requestId, 
        fileName,
        fileSize: buffer.byteLength 
      });

      // Step 1: Upload file to OpenAI
      // Convert ArrayBuffer to Buffer for Node.js environment
      const fileBuffer = Buffer.from(buffer);
      
      // Create a proper FormData with the file
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: 'application/pdf' });
      formData.append('file', blob, fileName);
      formData.append('purpose', 'assistants');
      
      // Upload using fetch directly to ensure compatibility
      const uploadResponse = await fetch('https://api.openai.com/v1/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`File upload failed: ${uploadResponse.status} - ${errorText}`);
      }
      
      const uploadedFile = await uploadResponse.json();

      logger.info('PDF uploaded to OpenAI', { 
        requestId, 
        fileId: uploadedFile.id 
      });

      // Step 2: Create assistant for medical analysis
      // Use a model that definitely works with Assistants API
      const assistantModel = (this.config.model && this.config.model.includes('gpt-5')) 
        ? 'gpt-4o-2024-11-20' 
        : (this.config.model || 'gpt-4o-2024-11-20');
      
      logger.info('Creating assistant for PDF analysis', {
        requestId,
        originalModel: this.config.model,
        assistantModel,
        fileName
      });
      
      const assistant = await this.openai.beta.assistants.create({
        name: "Lab Results Analyzer",
        instructions: this.getPDFAnalysisSystemPrompt(),
        model: assistantModel,
        tools: [{ type: "file_search" }]
      });

      // Step 3: Create thread and attach file
      const thread = await this.openai.beta.threads.create({
        messages: [
          {
            role: "user",
            content: this.getPDFAnalysisUserPrompt(),
            attachments: [
              {
                file_id: uploadedFile.id,
                tools: [{ type: "file_search" }]
              }
            ]
          }
        ]
      });

      // Step 4: Run the assistant
      const run = await this.openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id
      });

      // Step 5: Wait for completion
      let runResult = await this.openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
      while (runResult.status === 'queued' || runResult.status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        runResult = await this.openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
      }

      if (runResult.status !== 'completed') {
        throw new Error(`Assistant run failed with status: ${runResult.status}`);
      }

      // Step 6: Get the response
      const messages = await this.openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
      
      if (!assistantMessage || !assistantMessage.content[0] || assistantMessage.content[0].type !== 'text') {
        throw new Error('No valid response from PDF analysis');
      }

      const responseText = assistantMessage.content[0].text.value;

      // Step 7: Clean up
      try {
        await this.openai.files.delete(uploadedFile.id);
        await this.openai.beta.assistants.delete(assistant.id);
      } catch (cleanupError) {
        logger.warn('Cleanup warning', { requestId, error: cleanupError });
      }

      // Step 8: Parse and validate response
      const analysis = this.parseAndValidateResponse(responseText);
      
      logger.info('PDF ChatGPT analysis completed', {
        requestId,
        resultsCount: analysis.results.length,
        fileId: uploadedFile.id
      });

      timer.end();
      return analysis;

    } catch (error) {
      timer.end();
      logger.error('PDF ChatGPT analysis failed', error instanceof Error ? error : { error: String(error) });
      throw new Error(
        `PDF analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'Please ensure your PDF contains readable text and try again.'
      );
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

  private getPDFAnalysisSystemPrompt(): string {
    return `You are an expert medical lab results analyzer specializing in interpreting laboratory tests, medical measurements, and health data from PDF documents.

Your task is to:
1. Read and extract ALL medical content from the uploaded PDF document
2. Identify medical measurements, lab values, and health data
3. Interpret each result in plain language
4. Identify any critical or concerning findings
5. Provide actionable health recommendations

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
  "summary": "Overall summary of findings from the PDF",
  "recommendations": ["Actionable health recommendations"]
}

Be thorough in reading the PDF document and accurate in your medical interpretations. Extract ALL medical measurements and lab values found in the document.`;
  }

  private getPDFAnalysisUserPrompt(): string {
    return `Please analyze the uploaded PDF document containing medical/laboratory information:

1. READ ALL CONTENT from the PDF document thoroughly
2. EXTRACT every medical measurement, lab result, vital sign, and health data point
3. INTERPRET findings and provide medical insights
4. IDENTIFY any critical or concerning values

Focus on:
- Laboratory test names and results
- Medical measurements with units (mg/dL, mmol/L, etc.)
- Reference ranges and normal values
- Patient information and test dates
- Any abnormal or critical findings
- Vital signs and health measurements

RETURN ONLY valid JSON in the specified format. No additional text or explanations outside the JSON structure.

If no medical data is found, return:
{
  "results": [],
  "critical_findings": [],
  "summary": "No medical measurements or laboratory results found in the PDF document",
  "recommendations": ["Please ensure the document contains laboratory results or medical measurements"]
}`;
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
