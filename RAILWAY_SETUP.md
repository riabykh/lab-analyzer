# Railway Deployment Setup

## Environment Variables Required

Set these environment variables in your Railway project:

### Essential Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-5-2025-08-07

# Application URLs  
NEXT_PUBLIC_APP_URL=https://app.labwise.rialys.eu

# Security
JWT_SECRET=your-random-jwt-secret-32-chars-min

# Node Environment
NODE_ENV=production
```

### Optional Variables

```bash
# Email Services (choose one)
SENDGRID_API_KEY=your-sendgrid-key
RESEND_API_KEY=your-resend-key

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## Model Configuration Notes

### GPT Model Selection
- **Text/PDF Analysis**: `gpt-5-2025-08-07` (recommended for best results)
- **Image OCR**: `gpt-4o-2024-11-20` (vision capability required)
- **Fallback**: If GPT-5 is not available, falls back to `gpt-4o-2024-11-20`

### Cost Considerations
- GPT-5 provides better accuracy for medical analysis
- GPT-4o is more cost-effective but slightly less accurate
- Image processing always requires vision-capable models

## Deployment Steps

1. **Set Environment Variables** in Railway dashboard
2. **Connect Repository** to your Railway project
3. **Configure Custom Domain** (app.labwise.rialys.eu)
4. **Deploy** - Railway will automatically build and deploy
5. **Test** the `/api/health` endpoint

## Troubleshooting

### Common Issues
- **API Key not working**: Ensure `OPENAI_API_KEY` is set correctly
- **Model errors**: Verify your OpenAI account has access to GPT-5
- **PDF processing fails**: Check the logs for specific PDF parsing errors
- **Domain issues**: Ensure DNS is properly configured for the custom domain

### Debug Endpoints
- `/api/test-env` - Check environment configuration
- `/api/health` - Basic health check
- `/api/debug-pdf` - Comprehensive PDF processing debug

## Performance

- **Cold starts**: ~2-3 seconds
- **PDF processing**: ~5-15 seconds depending on file size
- **Text analysis**: ~3-10 seconds depending on content length
- **Image OCR**: ~10-20 seconds for complex documents