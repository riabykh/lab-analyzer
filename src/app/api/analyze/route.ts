import { NextRequest, NextResponse } from 'next/server';
import { ModernPDFProcessor } from '@/lib/pdf-processor';
import { ModernOpenAIService } from '@/lib/openai-service';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AnalyzeAPI');

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  logger.info('Analysis request received', { 
    requestId,
    userAgent: request.headers.get('user-agent'),
    contentType: request.headers.get('content-type')
  });
  
  try {
    // Environment validation
    if (!process.env.OPENAI_API_KEY) {
      logger.error('OpenAI API key not configured');
      return NextResponse.json(
        { 
          error: 'Service configuration error',
          details: 'OpenAI API key not configured',
          requestId
        },
        { status: 500 }
      );
    }

    // Initialize modern services
    const pdfProcessor = ModernPDFProcessor.getInstance();
    const openaiService = new ModernOpenAIService({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-2024-11-20',
      maxTokens: 3000
    });

    logger.info('Services initialized', { requestId });

    // Extract file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      logger.error('No file provided in form data', { requestId });
      return NextResponse.json(
        { error: 'No file provided', requestId },
        { status: 400 }
      );
    }

    logger.fileProcessing(file.name, file.size, 'received');

    // Validate file
    if (file.type === 'application/pdf') {
      const validation = pdfProcessor.validatePDF(file);
      if (!validation.valid) {
        logger.error('PDF validation failed', { 
          requestId, 
          fileName: file.name, 
          error: validation.error 
        });
        return NextResponse.json(
          { error: validation.error, requestId },
          { status: 400 }
        );
      }
    }

    // Extract text from file using modern services
    let fileText = '';
    
    if (file.type === 'text/plain') {
      fileText = await file.text();
      logger.fileProcessing(file.name, file.size, 'text-extracted');
    } else if (file.type === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const pdfResult = await pdfProcessor.extractText(buffer);
      fileText = pdfResult.text;
      
      logger.info('PDF processing completed', {
        requestId,
        fileName: file.name,
        pages: pdfResult.metadata.pages,
        textLength: pdfResult.metadata.textLength,
        method: pdfResult.metadata.method
      });
    } else if (file.type.startsWith('image/')) {
      // Use OpenAI Vision API for image OCR
      logger.fileProcessing(file.name, file.size, 'image-ocr-started');
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      try {
        const ocrResponse = await openaiService.openai.chat.completions.create({
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
                    url: `data:${file.type};base64,${base64}`,
                  },
                },
              ],
            },
          ],
          max_completion_tokens: 2000,
        });
        
        fileText = ocrResponse.choices[0]?.message?.content || '';
        logger.fileProcessing(file.name, file.size, 'image-ocr-completed');
      } catch (ocrError) {
        logger.error('Image OCR failed', { requestId, error: ocrError });
        return NextResponse.json(
          { 
            error: 'Failed to process image', 
            details: ocrError instanceof Error ? ocrError.message : 'Unknown OCR error',
            requestId 
          },
          { status: 400 }
        );
      }
    } else {
      logger.error('Unsupported file type', { 
        requestId, 
        fileName: file.name, 
        fileType: file.type 
      });
      return NextResponse.json(
        { 
          error: 'Unsupported file type', 
          details: 'Please upload PDF, image, or text file',
          requestId 
        },
        { status: 400 }
      );
    }

    if (!fileText.trim()) {
      logger.error('No text extracted from file', { requestId, fileName: file.name });
      return NextResponse.json(
        { 
          error: 'No text could be extracted from the file',
          requestId 
        },
        { status: 400 }
      );
    }

    logger.info('Text extraction completed', {
      requestId,
      textLength: fileText.length,
      preview: fileText.slice(0, 200) + '...'
    });

    // Perform AI analysis using modern service
    const analysis = await openaiService.analyzeLabResults(fileText);

    // Return successful response
    logger.info('Analysis completed successfully', { 
      requestId,
      resultsCount: analysis.results.length,
      fileName: file.name
    });

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        requestId,
        fileName: file.name,
        fileSize: file.size,
        textLength: fileText.length,
        processingTime: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Analysis failed with unexpected error', { 
      requestId,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack?.slice(0, 1000)
      } : error
    });
    
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        requestId
      },
      { status: 500 }
    );
  }
}