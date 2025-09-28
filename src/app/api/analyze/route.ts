import { NextRequest, NextResponse } from 'next/server';
import { ChatGPTUniversalService } from '@/lib/chatgpt-universal-service';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AnalyzeAPI');

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2) + Date.now().toString(36);
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

    // Initialize ChatGPT Universal Service
    const chatgptService = new ChatGPTUniversalService({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-2024-11-20',
      maxTokens: 8000
    });

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Analysis timeout - please try again')), 120000); // 2 minutes
    });

    logger.info('ChatGPT Universal Service initialized', { requestId });

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

    logger.info('File received for processing', {
      requestId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    // Validate file size (max 25MB for vision processing)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      logger.error('File too large', { requestId, fileSize: file.size, maxSize });
      return NextResponse.json(
        { 
          error: 'File too large', 
          details: `Maximum file size is ${maxSize / 1024 / 1024}MB`,
          requestId 
        },
        { status: 400 }
      );
    }

    // Process file using ChatGPT Universal Service
    const analysis = await Promise.race([
      chatgptService.processFile(file),
      timeoutPromise
    ]) as any;

    // Return successful response
    logger.info('Analysis completed successfully', { 
      requestId,
      resultsCount: analysis.results.length,
      criticalFindings: analysis.critical_findings.length,
      fileName: file.name
    });

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        requestId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        processingTime: new Date().toISOString(),
        processor: 'ChatGPT Universal Service'
      }
    });

  } catch (error) {
    logger.error('Analysis failed with unexpected error', { 
      requestId,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack?.slice(0, 200)
      } : error
    });
    
    // Return a more user-friendly error response
    return NextResponse.json(
      { 
        success: false,
        error: 'Analysis temporarily unavailable', 
        details: 'Please try again in a moment. If the issue persists, contact support.',
        requestId,
        // Include some debug info for development
        debugInfo: process.env.NODE_ENV === 'development' ? {
          errorType: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : String(error)
        } : undefined
      },
      { status: 500 }
    );
  }
}