const fs = require('fs');
const path = require('path');

// Test PDF2JSON directly
async function testPDF2JSON() {
  console.log('🧪 TESTING PDF2JSON DIRECTLY');
  
  try {
    // Try to import pdf2json
    const PDFParser = require('pdf2json');
    console.log('✅ pdf2json imported successfully');
    
    // Create a test with sample text file first
    const testFilePath = path.join(__dirname, 'test-sample.txt');
    if (fs.existsSync(testFilePath)) {
      console.log('📄 Found test-sample.txt');
      const textContent = fs.readFileSync(testFilePath, 'utf8');
      console.log('📊 Text content length:', textContent.length);
      console.log('📝 Preview:', textContent.slice(0, 200) + '...');
    }
    
    // Test creating PDF parser instance
    const pdfParser = new PDFParser();
    console.log('✅ PDFParser instance created');
    
    // Test event handlers
    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error('❌ PDF Error:', errData);
    });
    
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      console.log('✅ PDF Data received');
      console.log('📊 Pages:', pdfData?.Pages?.length || 0);
    });
    
    console.log('✅ PDF2JSON test completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ PDF2JSON test failed:', error.message);
    return false;
  }
}

// Test OpenAI API configuration
async function testOpenAI() {
  console.log('\n🤖 TESTING OPENAI CONFIGURATION');
  
  try {
    const { OpenAI } = require('openai');
    console.log('✅ OpenAI module imported');
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('❌ OPENAI_API_KEY not set');
      return false;
    }
    
    console.log('✅ OPENAI_API_KEY configured (length:', apiKey.length, ')');
    
    const openai = new OpenAI({ apiKey });
    console.log('✅ OpenAI client created');
    
    // Test a simple completion
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-5-2025-08-07',
        messages: [{ role: 'user', content: 'Say "test successful"' }],
        max_tokens: 10
      });
      
      console.log('✅ OpenAI API test successful');
      console.log('📝 Response:', response.choices[0]?.message?.content);
      return true;
      
    } catch (apiError) {
      console.error('❌ OpenAI API test failed:', apiError.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ OpenAI configuration test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🔍 COMPREHENSIVE PDF PROCESSING TEST\n');
  
  const pdf2jsonOk = await testPDF2JSON();
  const openaiOk = await testOpenAI();
  
  console.log('\n📋 TEST RESULTS:');
  console.log('- PDF2JSON:', pdf2jsonOk ? '✅ OK' : '❌ FAILED');
  console.log('- OpenAI:', openaiOk ? '✅ OK' : '❌ FAILED');
  
  if (pdf2jsonOk && openaiOk) {
    console.log('\n🎯 DIAGNOSIS: Both components working - issue might be in integration');
  } else {
    console.log('\n🎯 DIAGNOSIS: Found component failures - need to fix these first');
  }
}

// Run the tests
runTests().catch(console.error);
