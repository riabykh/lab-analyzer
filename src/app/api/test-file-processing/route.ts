import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🧪 TEST FILE PROCESSING');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('📎 File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    let extractedText = '';
    let processingMethod = '';

    // Test text file processing
    if (file.type === 'text/plain') {
      try {
        extractedText = await file.text();
        processingMethod = 'text/plain';
        console.log('✅ Text file processed successfully');
      } catch (error) {
        console.error('❌ Text processing failed:', error);
        return NextResponse.json({ 
          error: 'Text file processing failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }
    
    // Test PDF processing (without AI analysis)
    else if (file.type === 'application/pdf') {
      try {
        console.log('🔄 Testing PDF processing...');
        const PDFParser = (await import('pdf2json')).default;
        console.log('✅ pdf2json loaded');
        
        const buffer = await file.arrayBuffer();
        console.log('📊 PDF buffer size:', buffer.byteLength);
        
        extractedText = await new Promise<string>((resolve, reject) => {
          const pdfParser = new PDFParser();
          
          const timeout = setTimeout(() => {
            reject(new Error('PDF parsing timeout'));
          }, 15000);
          
          pdfParser.on("pdfParser_dataError", (errData: any) => {
            clearTimeout(timeout);
            reject(new Error(`PDF error: ${errData.parserError}`));
          });
          
          pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            clearTimeout(timeout);
            
            let text = '';
            if (pdfData?.Pages) {
              pdfData.Pages.forEach((page: any) => {
                if (page.Texts) {
                  page.Texts.forEach((textElement: any) => {
                    if (textElement.R) {
                      textElement.R.forEach((textRun: any) => {
                        if (textRun.T) {
                          try {
                            text += decodeURIComponent(textRun.T) + ' ';
                          } catch {
                            text += textRun.T + ' ';
                          }
                        }
                      });
                    }
                  });
                }
                text += '\n';
              });
            }
            
            resolve(text.trim());
          });
          
          pdfParser.parseBuffer(Buffer.from(buffer));
        });
        
        processingMethod = 'pdf2json';
        console.log('✅ PDF processed successfully');
        
      } catch (error) {
        console.error('❌ PDF processing failed:', error);
        return NextResponse.json({ 
          error: 'PDF processing failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }
    
    else {
      return NextResponse.json({ 
        error: 'Unsupported file type',
        supported: ['text/plain', 'application/pdf']
      }, { status: 400 });
    }

    // Return test results
    return NextResponse.json({
      success: true,
      file_info: {
        name: file.name,
        type: file.type,
        size: file.size
      },
      processing: {
        method: processingMethod,
        extracted_length: extractedText.length,
        preview: extractedText.slice(0, 300) + (extractedText.length > 300 ? '...' : ''),
        has_content: extractedText.trim().length > 0
      },
      test_passed: extractedText.trim().length > 0
    });

  } catch (error) {
    console.error('🚨 Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
