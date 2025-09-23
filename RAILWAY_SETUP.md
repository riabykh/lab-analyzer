# 🚀 Railway Environment Setup

## Required Environment Variables

Your LabWise app needs these environment variables to work:

### 1. OpenAI API Key (REQUIRED)
```
OPENAI_API_KEY=your_openai_api_key_here
```

**How to get it:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-proj-...`)

### 2. Optional Variables
```
OPENAI_MODEL=gpt-4o
JWT_SECRET=your_jwt_secret_here
PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret
```

## 🔧 Setting Up in Railway

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Find your `lab-analyzer` project

2. **Add Environment Variables**
   - Click on your project
   - Go to "Variables" tab
   - Click "Add Variable"
   - Add each variable name and value

3. **Required Variables:**
   ```
   Variable Name: OPENAI_API_KEY
   Variable Value: sk-proj-your-actual-key-here
   ```

4. **Redeploy**
   - Railway will automatically redeploy with new variables
   - Wait for deployment to complete

## 🧪 Testing

After setting up environment variables:

1. Visit your Railway URL
2. Click "Start Free Analysis"
3. Upload a PDF lab report
4. Check browser console (F12) for detailed logs
5. Should work without "nothing happens" issue

## 🔍 Debugging

If still not working, check browser console for:
- `OpenAI API key not configured` → Set OPENAI_API_KEY
- `Authentication required` → Click "Start Free Analysis" first
- `PDF parsing failed` → Try uploading as image (PNG/JPG)

## 📱 User Flow

**Correct Flow:**
1. Landing page → Click "Start Free Analysis" 
2. Gets redirected to /free with session
3. Upload file → Should work with authentication!

**Wrong Flow:**
1. Going directly to Railway URL and trying to upload
2. Will get "Authentication required" error
