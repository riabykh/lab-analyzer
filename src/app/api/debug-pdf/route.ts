import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔍 DEBUG PDF PROCESSING');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📎 File details:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      exists: !!file
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Test different processing methods
    const results: any = {
      file_info: {
        name: file.name,
        type: file.type,
        size: file.size
      },
      processing_attempts: []
    };

    // Method 1: Try text extraction for text files
    if (file.type === 'text/plain') {
      try {
        const text = await file.text();
        results.processing_attempts.push({
          method: 'text_plain',
          success: true,
          preview: text.slice(0, 200),
          length: text.length
        });
      } catch (error) {
        results.processing_attempts.push({
          method: 'text_plain',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Method 2: Try PDF processing
    if (file.type === 'application/pdf') {
      console.log('📄 Attempting PDF processing...');
      
      try {
        // Check if pdf2json is available
        const PDFParser = (await import('pdf2json')).default;
        console.log('✅ pdf2json module loaded successfully');
        
        const buffer = await file.arrayBuffer();
        console.log('📊 PDF buffer size:', buffer.byteLength);
        
        const extractedText = await new Promise<string>((resolve, reject) => {
          const pdfParser = new PDFParser();
          
          const timeout = setTimeout(() => {
            reject(new Error('PDF parsing timeout (10s)'));
          }, 10000);
          
          pdfParser.on("pdfParser_dataError", (errData: any) => {
            clearTimeout(timeout);
            console.error('❌ PDF parsing error:', errData);
            reject(new Error(`PDF parsing failed: ${errData.parserError}`));
          });
          
          pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            clearTimeout(timeout);
            console.log('📋 PDF data ready, processing...');
            
            try {
              let text = '';
              let pageCount = 0;
              let textElementCount = 0;
              
              if (pdfData && pdfData.Pages) {
                pageCount = pdfData.Pages.length;
                console.log('📃 Pages found:', pageCount);
                
                pdfData.Pages.forEach((page: any, pageIndex: number) => {
                  if (page.Texts) {
                    page.Texts.forEach((textElement: any) => {
                      textElementCount++;
                      if (textElement.R) {
                        textElement.R.forEach((textRun: any) => {
                          if (textRun.T) {
                            const decodedText = decodeURIComponent(textRun.T);
                            text += decodedText + ' ';
                          }
                        });
                      }
                    });
                  }
                  text += '\n';
                });
              }
              
              console.log('📝 Extracted text stats:', {
                pages: pageCount,
                textElements: textElementCount,
                textLength: text.length,
                preview: text.slice(0, 100)
              });
              
              resolve(text.trim());
            } catch (parseError) {
              console.error('❌ Text extraction error:', parseError);
              reject(parseError);
            }
          });
          
          console.log('🔄 Starting PDF parsing...');
          pdfParser.parseBuffer(Buffer.from(buffer));
        });
        
        results.processing_attempts.push({
          method: 'pdf2json',
          success: true,
          preview: extractedText.slice(0, 200),
          length: extractedText.length,
          has_meaningful_text: extractedText.trim().length > 10
        });
        
      } catch (pdfError) {
        console.error('❌ PDF processing failed:', pdfError);
        results.processing_attempts.push({
          method: 'pdf2json',
          success: false,
          error: pdfError instanceof Error ? pdfError.message : 'Unknown PDF error'
        });
      }
    }

    // Method 3: Try image processing
    if (file.type.startsWith('image/')) {
      try {
        const buffer = await file.arrayBuffer();
        console.log('🖼️ Image buffer size:', buffer.byteLength);
        
        // Check if OpenAI API key is available
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        
        results.processing_attempts.push({
          method: 'image_ocr',
          success: true,
          note: 'Image processing available (requires OpenAI API call)',
          buffer_size: buffer.byteLength
        });
        
      } catch (imageError) {
        results.processing_attempts.push({
          method: 'image_ocr',
          success: false,
          error: imageError instanceof Error ? imageError.message : 'Unknown image error'
        });
      }
    }

    // Environment check
    results.environment = {
      openai_api_key_configured: !!process.env.OPENAI_API_KEY,
      node_version: process.version,
      platform: process.platform
    };

    return NextResponse.json({
      success: true,
      debug_results: results
    });

  } catch (error) {
    console.error('🚨 Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
