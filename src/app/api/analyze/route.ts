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
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' },
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
        const PDFParser = (await import('pdf2json')).default;
        
        const extractedText = await new Promise<string>((resolve, reject) => {
          const pdfParser = new PDFParser();
          
          pdfParser.on("pdfParser_dataError", (errData: any) => {
            console.error('PDF parsing error:', errData.parserError);
            reject(new Error('PDF parsing failed'));
          });
          
          pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
              let text = '';
              if (pdfData && pdfData.Pages) {
                pdfData.Pages.forEach((page: any) => {
                  if (page.Texts) {
                    page.Texts.forEach((textElement: any) => {
                      if (textElement.R) {
                        textElement.R.forEach((textRun: any) => {
                          if (textRun.T) {
                            text += decodeURIComponent(textRun.T) + ' ';
                          }
                        });
                      }
                    });
                  }
                  text += '\n';
                });
              }
              resolve(text.trim());
            } catch (parseError) {
              reject(parseError);
            }
          });
          
          pdfParser.parseBuffer(Buffer.from(buffer));
        });
        
        if (extractedText && extractedText.trim().length > 10) {
          fileText = extractedText;
        } else {
          throw new Error('No meaningful text extracted');
        }
        
      } catch (pdfError) {
        console.log('PDF text extraction failed, attempting OCR...');
        
        // If PDF text extraction fails, return a helpful error message
        console.error('PDF text extraction failed:', pdfError);
        return NextResponse.json(
          { error: 'Failed to extract text from PDF. The file may be a scanned document or image-based PDF. Please try converting it to a text file or uploading it as an image (PNG/JPG) for OCR processing.' },
          { status: 400 }
        );
      }
    } else if (file.type.startsWith('image/')) {
      // For images, use ChatGPT Vision API
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      const ocrResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
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
        max_tokens: 2000,
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
    const analysisResponse = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
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
      max_tokens: 3000,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const analysisContent = analysisResponse.choices[0]?.message?.content;
    
    if (!analysisContent) {
      return NextResponse.json(
        { error: 'No analysis received from AI' },
        { status: 500 }
      );
    }

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


