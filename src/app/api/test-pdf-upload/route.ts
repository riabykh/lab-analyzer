import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🧪 TESTING PDF UPLOAD FLOW');
  
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

    // Test file reading
    if (file.type === 'text/plain') {
      const text = await file.text();
      console.log('✅ Text file read successfully');
      
      return NextResponse.json({
        success: true,
        file_info: { name: file.name, type: file.type, size: file.size },
        extracted_text: text.slice(0, 500),
        test_status: 'text_processing_ok'
      });
    }
    
    if (file.type === 'application/pdf') {
      console.log('📄 Testing PDF processing...');
      
      try {
        const PDFParser = (await import('pdf2json')).default;
        const buffer = await file.arrayBuffer();
        
        const extractedText = await new Promise<string>((resolve, reject) => {
          const pdfParser = new PDFParser();
          
          const timeout = setTimeout(() => {
            reject(new Error('PDF parsing timeout'));
          }, 10000);
          
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
        
        console.log('✅ PDF processed successfully');
        
        // Simulate AI analysis without actually calling OpenAI
        const mockAnalysis = {
          results: [
            {
              test_name: "Sample Analysis",
              value: "Text extracted successfully",
              unit: "chars",
              reference_range: "N/A",
              status: "normal",
              interpretation: "PDF processing is working correctly"
            }
          ],
          critical_findings: [],
          summary: `Successfully extracted ${extractedText.length} characters from PDF. PDF processing pipeline is functional.`,
          recommendations: ["PDF text extraction is working", "OpenAI API key needed for full analysis"]
        };
        
        return NextResponse.json({
          success: true,
          file_info: { name: file.name, type: file.type, size: file.size },
          extracted_text: extractedText.slice(0, 500),
          analysis: mockAnalysis,
          test_status: 'pdf_processing_ok_mock_analysis',
          openai_configured: !!process.env.OPENAI_API_KEY
        });
        
      } catch (pdfError) {
        console.error('❌ PDF processing failed:', pdfError);
        return NextResponse.json({
          error: 'PDF processing failed',
          details: pdfError instanceof Error ? pdfError.message : 'Unknown error',
          test_status: 'pdf_processing_failed'
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({
      error: 'Unsupported file type',
      supported: ['text/plain', 'application/pdf']
    }, { status: 400 });

  } catch (error) {
    console.error('🚨 Test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      test_status: 'general_failure'
    }, { status: 500 });
  }
}
