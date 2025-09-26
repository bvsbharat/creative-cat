# AI-Powered Ads Intelligence Platform - Setup Guide

## 🚀 Quick Start

This app has been transformed into a comprehensive AI-powered advertising analytics and content generation platform with three main tabs:

1. **Analytics Dashboard** - Real-time ad performance and market insights
2. **Content Generator** - AI-powered marketing content creation
3. **Ads Studio** - Visual ad generation and creative assets

## 🔧 Environment Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your API keys to `.env.local`:**

   ### Required APIs:
   - **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **NewsAPI Key**: Get from [NewsAPI.org](https://newsapi.org/)

   ### Optional APIs (for enhanced features):
   - **Bright Data**: For advanced news crawling
   - **Google Analytics**: For real analytics data
   - **Social Media APIs**: For content posting

## 🏃 Running the App

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000` (or `http://localhost:3001` if 3000 is in use).

## 📊 Features Overview

### Tab 1: Analytics Dashboard
- Real-time performance metrics (Impressions, CTR, ROAS)
- Interactive charts showing trends over time
- Live marketing news feed with sentiment analysis
- Top performing ads ranking
- Market hooks and trending keywords extraction

### Tab 2: Content Generator
- AI-powered ad copy generation
- Social media post creation
- Campaign strategy development
- Visual concept descriptions
- Custom prompt support
- Integration with latest market trends and news

### Tab 3: Ads Studio
- Visual ad generation (coming soon)
- Multi-format support (Image, Video, Social Media, Stories)
- Creative asset management
- Template gallery
- Platform-specific optimization

## 🔗 API Endpoints

The app includes several backend services:

- `/api/news` - Fetches latest marketing news and trends
- `/api/generate` - AI content generation using Gemini Flash
- `/api/analytics` - Performance analytics and metrics

## 🛠 Architecture

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI with shadcn/ui
- **Charts**: Recharts for analytics visualization
- **AI Integration**: Google Gemini Flash model
- **News API**: NewsAPI.org with fallback demo data
- **Styling**: Tailwind CSS with custom animations

## 📈 Development

The app automatically fetches demo data if API keys are not configured, so you can explore all features immediately.

For production use:
1. Configure all required API keys
2. Set up proper analytics tracking
3. Configure social media integrations
4. Enable real-time data updates

## 🔒 Security Notes

- All API keys should be stored in `.env.local` (never commit to git)
- The app includes CORS handling and request validation
- Demo mode is used when API credentials are missing

## 📝 Next Steps

1. Configure your API keys for full functionality
2. Customize the analytics integration for your needs
3. Add your own visual ad generation logic
4. Integrate with your preferred social media platforms
5. Set up real-time data sync for live analytics