import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('🔍 NO-AUTH Analysis request received');
  
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
      console.log('✅ Text file processed');
    } else {
      return NextResponse.json(
        { error: 'Only text files supported in this test endpoint. Use .txt files.' },
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
    console.log('🤖 Sending to GPT-5 for analysis...');
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

Return ONLY a valid JSON object:

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

Document text to analyze:
${fileText.slice(0, 4000)}`,
        },
      ],
      max_completion_tokens: 3000,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    console.log('✅ GPT-5 response received');
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
      console.log('✅ Analysis parsed successfully');
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
      note: 'No authentication required for this test endpoint'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
