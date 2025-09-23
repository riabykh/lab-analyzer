import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('🔍 Analysis request received');
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured');
      return NextResponse.json(
        { 
          error: 'Service configuration error. Please contact support.',
          details: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.',
          status: 'missing_api_key'
        },
        { status: 500 }
      );
    }
    
    console.log('✅ OpenAI API key configured');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📎 File received:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    });

    // Enhanced logging for debugging
    console.log('🔍 Processing file type:', file.type);
    console.log('🔍 File size:', file.size, 'bytes');

    if (!file) {
      console.error('❌ No file provided in formData');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Extract text from file
    let fileText = '';
    
    if (file.type === 'text/plain') {
      fileText = await file.text();
    } else if (file.type === 'application/pdf') {
      // For PDFs, try text extraction first, fallback to OCR
      const buffer = await file.arrayBuffer();
      
      try {
        // First attempt: Extract text directly from PDF using pdf2json
        console.log('🔄 Loading pdf2json module...');
        const PDFParser = (await import('pdf2json')).default;
        console.log('✅ pdf2json loaded successfully');
        
        const extractedText = await new Promise<string>((resolve, reject) => {
          const pdfParser = new PDFParser();
          
          // Add timeout to prevent hanging
          const timeout = setTimeout(() => {
            console.error('⏰ PDF parsing timeout');
            reject(new Error('PDF parsing timeout'));
          }, 30000); // 30 second timeout
          
          pdfParser.on("pdfParser_dataError", (errData: any) => {
            clearTimeout(timeout);
            console.error('❌ PDF parsing error:', errData);
            reject(new Error(`PDF parsing failed: ${errData.parserError || 'Unknown error'}`));
          });
          
          pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            clearTimeout(timeout);
            console.log('📋 PDF data ready, extracting text...');
            
            try {
              let text = '';
              let pageCount = 0;
              let textElementCount = 0;
              
              if (pdfData && pdfData.Pages) {
                pageCount = pdfData.Pages.length;
                console.log('📄 Processing', pageCount, 'pages');
                
                pdfData.Pages.forEach((page: any, pageIndex: number) => {
                  if (page.Texts) {
                    page.Texts.forEach((textElement: any) => {
                      textElementCount++;
                      if (textElement.R) {
                        textElement.R.forEach((textRun: any) => {
                          if (textRun.T) {
                            try {
                              const decodedText = decodeURIComponent(textRun.T);
                              text += decodedText + ' ';
                            } catch (decodeError) {
                              // If decoding fails, use raw text
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
              
              console.log('📊 Text extraction stats:', {
                pages: pageCount,
                textElements: textElementCount,
                extractedLength: text.length,
                preview: text.slice(0, 100) + '...'
              });
              
              resolve(text.trim());
            } catch (parseError) {
              console.error('❌ Text extraction error:', parseError);
              reject(parseError);
            }
          });
          
          console.log('🚀 Starting PDF parsing...');
          try {
            pdfParser.parseBuffer(Buffer.from(buffer));
          } catch (bufferError) {
            clearTimeout(timeout);
            reject(new Error(`Failed to create PDF buffer: ${bufferError}`));
          }
        });
        
        if (extractedText && extractedText.trim().length > 10) {
          fileText = extractedText;
        } else {
          throw new Error('No meaningful text extracted');
        }
        
      } catch (pdfError) {
        console.error('❌ PDF text extraction failed:', pdfError);
        console.error('❌ PDF error details:', {
          name: pdfError instanceof Error ? pdfError.name : 'Unknown',
          message: pdfError instanceof Error ? pdfError.message : String(pdfError),
          stack: pdfError instanceof Error ? pdfError.stack?.slice(0, 500) : 'No stack'
        });
        
        // Return detailed error for debugging
        return NextResponse.json(
          { 
            error: 'Failed to extract text from PDF', 
            details: pdfError instanceof Error ? pdfError.message : String(pdfError),
            suggestion: 'Try uploading as .txt file or image (PNG/JPG) for OCR processing'
          },
          { status: 400 }
        );
      }
    } else if (file.type.startsWith('image/')) {
      // For images, use ChatGPT Vision API
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      const ocrResponse = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-2024-11-20',
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
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, image, or text file.' },
        { status: 400 }
      );
    }

    if (!fileText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file' },
        { status: 400 }
      );
    }

    // Log extracted text for debugging (first 500 chars)
    console.log('Extracted text preview:', fileText.slice(0, 500));
    console.log('Total text length:', fileText.length);

    // Analyze the extracted text with ChatGPT
    console.log('🤖 Starting GPT-5 analysis...');
    console.log('🤖 Text length to analyze:', fileText.length);
    console.log('🤖 Using model:', process.env.OPENAI_MODEL || 'gpt-5-2025-08-07');
    
    const analysisResponse = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-2025-08-07',
      messages: [
        {
          role: 'system',
          content: 'You are a medical lab results analyzer. You MUST respond with valid JSON only. Look for ANY medical values, lab tests, vital signs, or health measurements. Be very inclusive - look for numbers with units, normal ranges, reference values, test names, or any medical terminology. Do not include any text outside of the JSON structure.'
        },
        {
          role: 'user',
          content: `Analyze this medical document and extract ANY lab results, medical measurements, or health data. Look for:
- Lab test names (CBC, glucose, cholesterol, etc.)
- Medical values with numbers and units (mg/dL, mmol/L, etc.)
- Reference ranges or normal values
- Vital signs (blood pressure, heart rate, temperature)
- Any medical measurements or test results

Be very inclusive - if you see numbers that could be medical measurements, include them. Return ONLY a valid JSON object:

{
  "results": [
    {
      "test_name": "Name or description of the measurement",
      "value": "The measured value",
      "unit": "Unit of measurement (if available)",
      "reference_range": "Normal range (if mentioned)",
      "status": "normal|high|low|unknown",
      "interpretation": "What this measurement means"
    }
  ],
  "critical_findings": ["Any values that seem concerning or out of normal range"],
  "summary": "Summary of what was found in the document",
  "recommendations": ["Health recommendations based on findings"]
}

If truly no medical data is found, return:
{
  "results": [],
  "critical_findings": [],
  "summary": "No medical measurements or lab results found in the document",
  "recommendations": ["Please ensure the document contains lab results or medical measurements"]
}

Document text to analyze:
${fileText.slice(0, 4000)}`,
        },
      ],
      max_completion_tokens: 3000,
      response_format: { type: "json_object" }
    });

    console.log('🤖 GPT-5 response received');
    console.log('🤖 Response metadata:', {
      id: analysisResponse.id,
      model: analysisResponse.model,
      choices: analysisResponse.choices?.length,
      finishReason: analysisResponse.choices?.[0]?.finish_reason
    });

    const analysisContent = analysisResponse.choices[0]?.message?.content;
    
    if (!analysisContent) {
      console.error('❌ No content in AI response');
      console.error('❌ Full response:', JSON.stringify(analysisResponse, null, 2));
      return NextResponse.json(
        { 
          error: 'No analysis received from AI',
          details: `Finish reason: ${analysisResponse.choices?.[0]?.finish_reason}`,
          response_id: analysisResponse.id
        },
        { status: 500 }
      );
    }

    console.log('✅ Analysis content length:', analysisContent.length);

    // Parse the JSON response
    let analysis;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = analysisContent.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from AI', details: analysisContent },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
      extractedText: fileText.slice(0, 1000) + (fileText.length > 1000 ? '...' : ''),
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


