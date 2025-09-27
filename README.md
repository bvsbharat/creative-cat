# SnowOptima.ai 🎨

**AI-Powered Advertisement Intelligence Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Fal.ai](https://img.shields.io/badge/Fal.ai-Powered-FF6B6B?style=for-the-badge)](https://fal.ai/)

## 🚀 Overview

SnowOptima.ai is a comprehensive, AI-powered advertising intelligence platform designed to streamline the entire creative process, from market research to ad generation and performance analytics. It empowers marketing teams to create data-driven, high-impact advertising campaigns with greater efficiency. Built with a modern tech stack including Next.js 15, TypeScript, and a suite of powerful AI integrations, SnowOptima.ai is the ultimate tool for advertisers looking to stay ahead of the curve.

### ✨ Key Features

- **📊 Analytics Dashboard**: Real-time performance tracking with interactive charts and KPI monitoring
- **🧠 AI Content Generation**: Automated ad copy, social posts, and campaign strategies using Gemini AI
- **🎬 Professional Ad Studio**: Generate both static and video advertisements with Fal.ai integration
- **🛍️ Product Management**: Smart product scraping from Amazon URLs using Apify API
- **📰 Market Intelligence**: Real-time news analysis with marketing trend identification
- **🎯 Multi-Platform Optimization**: Tailored content for Instagram, Facebook, LinkedIn, and more

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - The React framework for building full-stack web applications.
- **TypeScript** - For static type-checking, ensuring code quality and maintainability.
- **TailwindCSS** - A utility-first CSS framework for rapid UI development.
- **Shadcn/UI** - A collection of beautifully designed, accessible UI components.
- **Framer Motion** - For creating fluid animations and interactive UIs.
- **Radix UI** - Provides a set of unstyled, accessible components for building design systems.
- **Recharts** - A composable charting library built on React components.
- **Zod** - For schema validation and type safety.

### AI & APIs

- **Fal.ai** - Image and video generation (nano-banana/edit, Veo 3)
- **Google Gemini** - Content generation and analysis
- **Apify** - Web scraping for product data
- **News API** - Real-time market intelligence

### Database & Backend

- **MongoDB** - A NoSQL database for storing and managing application data.
- **Mongoose** - An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Next.js API Routes** - For creating serverless backend endpoints.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB database
- API keys for services (see Environment Variables)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/bvsbharat/creative-cat.git
   cd creative-cat
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

4. **Configure your `.env.local`**

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # AI Services
   FAL_KEY=your_fal_ai_api_key
   GEMINI_API_KEY=your_google_gemini_api_key

   # Web Scraping
   APIFY_TOKEN=your_apify_api_token

   # News API
   NEWS_API_KEY=your_news_api_key
   ```

5. **Run the development server**

   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
creative-cat/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ads-generate/  # Ad generation endpoints
│   │   ├── analytics/     # Analytics data
│   │   ├── generate/      # Content generation
│   │   └── products/      # Product management
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── product/          # Product-specific components
│   └── creative.tsx      # Main dashboard component
├── lib/                  # Utility libraries
│   ├── models/           # Database models
│   ├── utils/            # Helper functions
│   ├── fal-ai.ts        # Fal.ai integration
│   └── gemini.ts        # Gemini AI integration
└── types/               # TypeScript definitions
```

## 🎯 Core Features

### Analytics Dashboard

- **Performance Metrics**: Track impressions, clicks, CTR, and ROAS
- **Interactive Charts**: Visualize trends with Recharts
- **Top Performing Ads**: Identify best-performing campaigns

### AI Content Generation

- **Ad Copy Creation**: Generate compelling marketing copy
- **Social Media Posts**: Create platform-optimized content
- **Campaign Strategies**: Develop comprehensive marketing plans
- **Visual Concepts**: Design specifications for creative assets

### Professional Ad Studio

- **Image Generation**: Create professional advertisements with Fal.ai
- **Video Advertisements**: Generate dynamic video ads using Veo 3
- **Multiple Concepts**: Professional, Lifestyle, Feature Highlight, Social Proof
- **Platform Optimization**: Tailored for different social media platforms

### Product Management

- **URL Scraping**: Extract product data from Amazon URLs
- **Database Storage**: Manage product catalog with MongoDB
- **Smart Analysis**: AI-powered product feature extraction

## 🔧 API Endpoints

### Products

- `GET /api/products` - Fetch all products
- `POST /api/products` - Add new product
- `POST /api/scrape-product` - Scrape product from URL

### Content Generation

- `POST /api/generate` - Generate marketing content
- `POST /api/ads-generate` - Create advertisement concepts
- `POST /api/generate-ad` - Generate image advertisements
- `POST /api/generate-video-ad` - Create video advertisements

### Analytics

- `GET /api/analytics` - Fetch performance data
- `GET /api/news` - Get market intelligence

## 🌐 Environment Variables

| Variable         | Description                               | Required |
| ---------------- | ----------------------------------------- | -------- |
| `MONGODB_URI`    | MongoDB connection string                 | ✅       |
| `FAL_KEY`        | Fal.ai API key for image/video generation | ✅       |
| `GEMINI_API_KEY` | Google Gemini API key                     | ✅       |
| `APIFY_TOKEN`    | Apify API token for web scraping          | ✅       |
| `NEWS_API_KEY`   | News API key for market intelligence      | ✅       |

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Manual Deployment

```bash
pnpm build
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Fal.ai** for advanced image and video generation
- **Google Gemini** for intelligent content creation
- **Vercel** for seamless deployment platform
- **Radix UI** for accessible component primitives

---

**Built with ❤️ by [bvsbharat](https://github.com/bvsbharat)**
