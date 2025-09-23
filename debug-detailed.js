const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testRealPDFProcessing() {
  console.log('🧪 TESTING REAL PDF PROCESSING PIPELINE');
  console.log('');
  
  try {
    // Test with text file first
    console.log('📄 STEP 1: Testing with text file...');
    const textContent = `Lab Results - Test Report
Patient: Debug Test
Date: 2024-01-15

COMPLETE BLOOD COUNT (CBC)
White Blood Cells: 7.2 K/uL (Normal: 4.0-11.0)
Red Blood Cells: 4.8 M/uL (Normal: 4.2-5.4)
Hemoglobin: 14.2 g/dL (Normal: 13.5-17.5)

BASIC METABOLIC PANEL
Glucose: 95 mg/dL (Normal: 70-100)
Sodium: 142 mEq/L (Normal: 136-145)`;

    const formData = new FormData();
    formData.append('file', Buffer.from(textContent), {
      filename: 'test-lab-results.txt',
      contentType: 'text/plain'
    });

    console.log('🔄 Making request to analyze API...');
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });

    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('✅ API Response received');
    console.log('📝 Success:', result.success);
    
    if (result.success && result.analysis) {
      console.log('🎯 Analysis results found:');
      console.log('- Results count:', result.analysis.results?.length || 0);
      console.log('- Summary:', result.analysis.summary?.slice(0, 100) + '...');
      console.log('- Critical findings:', result.analysis.critical_findings?.length || 0);
      return true;
    } else {
      console.log('❌ No analysis in response:', result);
      return false;
    }

  } catch (error) {
    console.error('🚨 Test failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Check if dev server is running first
async function checkDevServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    console.log('✅ Dev server is running');
    return true;
  } catch (error) {
    console.log('❌ Dev server not responding:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 COMPREHENSIVE PDF PROCESSING DEBUG');
  console.log('');
  
  const serverRunning = await checkDevServer();
  if (!serverRunning) {
    console.log('🚨 Start dev server first: npm run dev');
    return;
  }
  
  const testPassed = await testRealPDFProcessing();
  
  console.log('');
  console.log('📋 DEBUG RESULTS:');
  console.log('- Dev server:', serverRunning ? '✅ Running' : '❌ Down');
  console.log('- API test:', testPassed ? '✅ Passed' : '❌ Failed');
  
  if (!testPassed) {
    console.log('');
    console.log('🎯 TROUBLESHOOTING:');
    console.log('1. Check dev server logs');
    console.log('2. Verify OPENAI_API_KEY is set');
    console.log('3. Check browser network tab for API calls');
    console.log('4. Look for console errors in browser');
  }
}

main().catch(console.error);
