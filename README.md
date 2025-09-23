# Lab Results Analyzer

A clean, efficient AI-powered lab results analysis tool built with Next.js 14 and ChatGPT.

## 🚀 Features

- **AI-Powered Analysis**: Uses ChatGPT (GPT-4o) for comprehensive lab result interpretation
- **Multi-Format Support**: Upload PDF, images (PNG/JPG), or text files
- **Server-Side Processing**: Reliable file processing and AI integration
- **Clean UI**: Modern, responsive design with Tailwind CSS
- **Secure**: Your data is processed securely and never stored

## 🔧 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key
Create a `.env.local` file in the project root:
```bash
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o
```

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/analyze/route.ts    # ChatGPT integration API
│   ├── page.tsx                # Main upload page
│   └── layout.tsx              # App layout
├── components/
│   ├── FileUpload.tsx          # Drag & drop file upload
│   └── ResultsDisplay.tsx      # Analysis results display
└── ...
```

## 🧠 How It Works

1. **Upload**: Drag & drop or select your lab results file
2. **Extract**: Server extracts text using ChatGPT Vision API (for PDFs/images)
3. **Analyze**: ChatGPT analyzes the extracted text and provides structured results
4. **Display**: Results are shown in a clean, organized table with status indicators

## 🔒 Privacy & Security

- Files are processed on the server and immediately discarded
- No data is stored or logged
- Direct communication with OpenAI API
- Your API key stays in your environment

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add `OPENAI_API_KEY` to environment variables
4. Deploy!

### Other Platforms
Works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS/GCP/Azure

## 📋 Supported File Types

- **PDF**: Lab reports, medical documents
- **Images**: PNG, JPG, JPEG screenshots of lab results
- **Text**: Plain text lab data

## ⚠️ Medical Disclaimer

This tool is for educational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding your health concerns.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o
- **Icons**: Lucide React
- **File Upload**: React Dropzone

## 📝 License

MIT License - feel free to use for personal or commercial projects.