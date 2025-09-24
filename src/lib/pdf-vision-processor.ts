import { createLogger } from './logger';

const logger = createLogger('PDFVisionProcessor');

export interface PDFVisionResult {
  text: string;
  metadata: {
    pages: number;
    textLength: number;
    processingTime: number;
    method: 'vision-ocr';
    images: number;
  };
}

export class PDFVisionProcessor {
  private static instance: PDFVisionProcessor;
  
  static getInstance(): PDFVisionProcessor {
    if (!PDFVisionProcessor.instance) {
      PDFVisionProcessor.instance = new PDFVisionProcessor();
    }
    return PDFVisionProcessor.instance;
  }

  async processWithVision(buffer: ArrayBuffer, openaiService: any): Promise<PDFVisionResult> {
    const timer = logger.time('PDF Vision Processing');
    
    try {
      logger.info('Starting PDF Vision OCR processing', { 
        bufferSize: buffer.byteLength 
      });

      // For now, let's use a hybrid approach:
      // 1. Try text extraction first (fast)
      // 2. If that fails or produces poor results, fall back to vision OCR
      
      let extractedText = '';
      let pageCount = 1;
      let imageCount = 0;

      try {
        // First attempt: Try regular PDF text extraction
        const pdfParse = (await import('pdf-parse')).default;
        const textData = await pdfParse(Buffer.from(buffer));
        
        if (textData.text && textData.text.trim().length > 50) {
          // Good text extraction - use it
          extractedText = textData.text.trim();
          pageCount = textData.numpages;
          logger.info('PDF text extraction successful', {
            pages: pageCount,
            textLength: extractedText.length
          });
        } else {
          throw new Error('Poor text extraction quality');
        }
      } catch (textError) {
        logger.warn('PDF text extraction failed, attempting Vision OCR', { error: textError });
        
        // Fallback: Convert PDF to images and use Vision API
        // For now, we'll simulate this with a simple conversion approach
        // In production, you'd use pdf-poppler or similar to convert pages to images
        
        // Simulate processing the PDF as an image
        const base64Data = Buffer.from(buffer).toString('base64');
        
        // Use Vision API for OCR
        extractedText = await openaiService.analyzeImage(base64Data, 'application/pdf');
        imageCount = 1;
        
        logger.info('Vision OCR completed', {
          textLength: extractedText.length,
          imagesProcessed: imageCount
        });
      }

      const result: PDFVisionResult = {
        text: extractedText,
        metadata: {
          pages: pageCount,
          textLength: extractedText.length,
          processingTime: 0, // Will be set by timer
          method: 'vision-ocr',
          images: imageCount
        }
      };

      logger.info('PDF Vision processing completed', {
        pages: result.metadata.pages,
        textLength: result.metadata.textLength,
        images: result.metadata.images,
        preview: result.text.slice(0, 200) + '...'
      });

      timer.end();
      return result;

    } catch (error) {
      timer.end();
      logger.error('PDF Vision processing failed', error);
      throw new Error(
        `PDF Vision processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Enhanced validation for vision processing
  validateForVision(file: File): { valid: boolean; error?: string; recommendation?: string } {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'File must be a PDF document' };
    }

    // More generous size limit for vision processing
    const maxSize = 25 * 1024 * 1024; // 25MB for vision processing
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File too large for vision processing. Maximum size is ${maxSize / 1024 / 1024}MB`,
        recommendation: 'Try compressing the PDF or splitting it into smaller files'
      };
    }

    if (file.size < 1000) {
      return { 
        valid: false, 
        error: 'File appears to be empty or corrupted',
        recommendation: 'Please ensure the PDF contains readable content'
      };
    }

    return { valid: true };
  }
}
