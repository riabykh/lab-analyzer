import pdfParse from 'pdf-parse';
import { createLogger } from './logger';

const logger = createLogger('PDFProcessor');

export interface PDFProcessingResult {
  text: string;
  metadata: {
    pages: number;
    textLength: number;
    processingTime: number;
    method: 'pdf-parse' | 'fallback';
  };
}

export class ModernPDFProcessor {
  private static instance: ModernPDFProcessor;
  
  static getInstance(): ModernPDFProcessor {
    if (!ModernPDFProcessor.instance) {
      ModernPDFProcessor.instance = new ModernPDFProcessor();
    }
    return ModernPDFProcessor.instance;
  }

  async extractText(buffer: ArrayBuffer): Promise<PDFProcessingResult> {
    const timer = logger.time('PDF Text Extraction');
    
    try {
      logger.info('Starting modern PDF text extraction', { 
        bufferSize: buffer.byteLength 
      });

      // Use modern pdf-parse library (more reliable than pdf2json)
      const data = await pdfParse(Buffer.from(buffer), {
        // Optimized options for better text extraction
        max: 0, // No page limit
        version: 'v2.0.550', // Use latest PDF.js version
        normalize: true, // Normalize whitespace
      });

      const result: PDFProcessingResult = {
        text: data.text.trim(),
        metadata: {
          pages: data.numpages,
          textLength: data.text.length,
          processingTime: 0, // Will be set by timer
          method: 'pdf-parse'
        }
      };

      logger.info('PDF extraction successful', {
        pages: result.metadata.pages,
        textLength: result.metadata.textLength,
        preview: result.text.slice(0, 100) + '...'
      });

      timer.end();
      return result;

    } catch (error) {
      timer.end();
      logger.error('PDF extraction failed', error instanceof Error ? error : { error: String(error) });
      
      // Fallback: Return error with suggestion
      throw new Error(
        `PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'Try converting the PDF to text format or uploading as an image for OCR processing.'
      );
    }
  }

  // Validate PDF file before processing
  validatePDF(file: File): { valid: boolean; error?: string } {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'File must be a PDF document' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` 
      };
    }

    // Check for minimum size (avoid empty files)
    if (file.size < 100) {
      return { valid: false, error: 'File appears to be empty or corrupted' };
    }

    return { valid: true };
  }
}
