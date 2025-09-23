import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('🟢 SIMPLE ANALYZE - Starting...');
  
  try {
    // 1. Basic validation
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ No OpenAI API key');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // 2. Get file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('📁 File:', file.name, file.type, file.size, 'bytes');

    // 3. Extract text (only support text files for now)
    let fileText = '';
    
    if (file.type === 'text/plain') {
      fileText = await file.text();
      console.log('📝 Text extracted:', fileText.length, 'characters');
    } else {
      console.error('❌ Unsupported file type:', file.type);
      return NextResponse.json({ 
        error: 'Only .txt files supported in simple mode',
        received_type: file.type 
      }, { status: 400 });
    }

    if (!fileText.trim()) {
      console.error('❌ Empty file');
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    // 4. Simple OpenAI call
    console.log('🤖 Calling OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-2024-11-20', // Use reliable model
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Analyze the provided text and return a simple JSON response.'
        },
        {
          role: 'user',
          content: `Analyze this text and return JSON with a "summary" field:\n\n${fileText.slice(0, 2000)}`
        }
      ],
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    console.log('✅ OpenAI response received');
    
    const analysisContent = response.choices[0]?.message?.content;
    
    if (!analysisContent) {
      console.error('❌ Empty OpenAI response');
      return NextResponse.json({ 
        error: 'No content in OpenAI response',
        response_data: {
          id: response.id,
          choices: response.choices?.length,
          finish_reason: response.choices?.[0]?.finish_reason
        }
      }, { status: 500 });
    }

    // 5. Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisContent);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON from OpenAI',
        raw_content: analysisContent.slice(0, 200)
      }, { status: 500 });
    }

    // 6. Return success
    console.log('🎉 Analysis complete!');
    
    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        file_name: file.name,
        file_size: file.size,
        text_length: fileText.length,
        model_used: 'gpt-4o-2024-11-20'
      }
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Unexpected server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
