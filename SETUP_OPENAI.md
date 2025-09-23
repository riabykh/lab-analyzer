# 🔧 OpenAI API Setup Guide

## Quick Setup Instructions

### 1. Get Your OpenAI API Key
- Visit: https://platform.openai.com/api-keys
- Create a new API key
- Copy the key (format: `sk-proj-...`)

### 2. Local Development
```bash
export OPENAI_API_KEY="[PASTE_YOUR_KEY_HERE]"
export OPENAI_MODEL="gpt-5-2025-08-07"
npm run dev
```

### 3. Railway Production
1. Go to Railway dashboard
2. Select your lab-analyzer project  
3. Variables tab → Add:
   - Name: `OPENAI_API_KEY`
   - Value: [PASTE_YOUR_KEY_HERE]
   - Name: `OPENAI_MODEL` 
   - Value: `gpt-5-2025-08-07`

### 4. Test PDF Processing
- Local: http://localhost:3000/test-pdf-simple.html
- Production: https://app.labwise.rialys.eu

## Verification
```bash
# Check if key is set
curl http://localhost:3000/api/test-env
```

Should show `"openai_api_key_configured": true`

## That's it! 
PDF processing will work once the API key is configured.

The PDF extraction infrastructure is already working perfectly - you just need the OpenAI API key for the AI analysis step.
