import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dbConnect from '@/lib/mongodb'
import Product from '@/lib/models/Product'

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    if (!process.env.VITE_GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured'
      }, { status: 400 })
    }

    const body = await request.json()
    const {
      productId,
      productData,
      adType,
      targetAudience,
      adStyle,
      platform,
      customPrompt,
      newsContext,
      marketingHooks
    } = body

    let product = null

    // Try to fetch product from database first
    try {
      await dbConnect()
      product = await Product.findById(productId)
    } catch (dbError) {
      console.log('Database unavailable, checking for productData fallback')
    }

    // If no product from DB and no productData provided, check if productData is embedded
    if (!product && !productData) {
      return NextResponse.json({
        success: false,
        error: 'Product not found and no product data provided'
      }, { status: 404 })
    }

    // Use provided productData as fallback or fetched product
    const productInfo = product || productData

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    let generatedAd

    switch (adType) {
      case 'image-description':
        generatedAd = await generateImageAdDescription(model, productInfo, {
          targetAudience,
          adStyle,
          platform,
          customPrompt,
          newsContext,
          marketingHooks
        })
        break
      case 'video-script':
        generatedAd = await generateVideoScript(model, productInfo, {
          targetAudience,
          adStyle,
          platform,
          customPrompt,
          newsContext,
          marketingHooks
        })
        break
      case 'social-media':
        generatedAd = await generateSocialMediaAd(model, productInfo, {
          targetAudience,
          adStyle,
          platform,
          customPrompt,
          newsContext,
          marketingHooks
        })
        break
      case 'banner-ad':
        generatedAd = await generateBannerAd(model, productInfo, {
          targetAudience,
          adStyle,
          platform,
          customPrompt,
          newsContext,
          marketingHooks
        })
        break
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid ad type'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      ad: generatedAd,
      product: {
        id: productInfo._id || productId,
        title: productInfo.title,
        category: productInfo.category
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating ad:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate ad'
    }, { status: 500 })
  }
}

async function generateImageAdDescription(model: any, product: any, options: any) {
  const systemPrompt = `
You are a professional advertising creative director and AI image generation specialist. Create detailed image ad descriptions for AI image generators.

Product Information:
- Title: ${product.title}
- Description: ${product.description}
- Category: ${product.category}
- Brand: ${product.brand || 'Generic'}
- Key Features: ${product.features.join(', ')}
- Target Audience: ${options.targetAudience || product.targetAudience?.join(', ') || 'General consumers'}

Market Context:
- Latest News Hooks: ${options.marketingHooks?.join(', ') || 'innovative, trending, premium quality'}
- Platform: ${options.platform || 'Multiple platforms'}
- Ad Style: ${options.adStyle || 'Modern and professional'}

Generate 4 different image ad concepts with:

For each concept provide:
1. **Visual Description**: Detailed scene description for AI image generation
2. **Composition**: Layout, angles, lighting details
3. **Color Palette**: Specific colors that match the brand/product
4. **Text Overlay**: Headlines and call-to-action text (max 8 words each)
5. **Style Notes**: Photography/illustration style, mood, atmosphere
6. **Technical Specs**: Aspect ratio recommendations, resolution notes
7. **Variation Theme**: Professional, Social Media, E-commerce, or Lifestyle focused

Make each concept unique and optimized for high engagement and conversion.
Include current market trends and hooks in the visual storytelling.
Ensure each ad has a distinct approach and target different customer motivations.

${options.customPrompt ? `Additional Requirements: ${options.customPrompt}` : ''}
`

  try {
    const result = await model.generateContent(systemPrompt)
    const response = result.response
    return {
      type: 'image-description',
      content: response.text(),
      metadata: {
        platform: options.platform,
        style: options.adStyle,
        audience: options.targetAudience
      }
    }
  } catch (error) {
    console.log('Gemini API unavailable, using demo ad content')
    // Return demo ad content as fallback
    return {
      type: 'image-description',
      content: generateDemoImageAd(product, options),
      metadata: {
        platform: options.platform,
        style: options.adStyle,
        audience: options.targetAudience,
        fallback: true
      }
    }
  }
}

async function generateVideoScript(model: any, product: any, options: any) {
  const systemPrompt = `
You are a professional video advertising script writer specializing in high-converting video ads.

Product Information:
- Title: ${product.title}
- Description: ${product.description}
- Category: ${product.category}
- Key Features: ${product.features.join(', ')}
- Target Audience: ${options.targetAudience || product.targetAudience?.join(', ')}

Market Trends: ${options.marketingHooks?.join(', ') || 'engaging, viral, authentic'}
Platform: ${options.platform || 'Social Media'}
Video Style: ${options.adStyle || 'Engaging and dynamic'}

Create a compelling video ad script with:

**HOOK (0-3 seconds)**
- Attention-grabbing opening
- Pattern interrupt or curiosity gap

**PROBLEM/DESIRE (3-8 seconds)**
- Identify target audience pain point
- Create emotional connection

**SOLUTION/PRODUCT (8-20 seconds)**
- Introduce product as solution
- Highlight key benefits and features
- Show product in action

**PROOF/CREDIBILITY (20-25 seconds)**
- Social proof, testimonials, or stats
- Build trust and credibility

**CALL TO ACTION (25-30 seconds)**
- Clear, compelling CTA
- Create urgency or exclusivity

Include:
- Scene descriptions and visual cues
- Voiceover/dialogue text
- Music and sound effect suggestions
- Pacing and timing notes
- Platform-specific optimization tips

${options.customPrompt ? `Additional Requirements: ${options.customPrompt}` : ''}
`

  const result = await model.generateContent(systemPrompt)
  const response = result.response
  return {
    type: 'video-script',
    content: response.text(),
    metadata: {
      platform: options.platform,
      duration: '30 seconds',
      audience: options.targetAudience
    }
  }
}

async function generateSocialMediaAd(model: any, product: any, options: any) {
  const systemPrompt = `
You are a social media advertising expert specializing in platform-specific ad creation.

Product Information:
- Title: ${product.title}
- Description: ${product.description}
- Category: ${product.category}
- Key Features: ${product.features.join(', ')}
- Target Audience: ${options.targetAudience || product.targetAudience?.join(', ')}

Platform: ${options.platform || 'Instagram'}
Current Trends: ${options.marketingHooks?.join(', ') || 'authentic, relatable, engaging'}

Create platform-optimized social media ads:

**PRIMARY AD**
- Caption (platform-appropriate length)
- Hashtag strategy (relevant and trending)
- Visual concept description
- CTA integration

**CAROUSEL VERSION** (if applicable)
- Multi-slide concept
- Each slide content and purpose
- Swipe-worthy progression

**STORY VERSION**
- Story-specific format
- Interactive elements (polls, stickers, etc.)
- Urgency and FOMO tactics

**PLATFORM OPTIMIZATIONS**
- ${options.platform || 'Instagram'}-specific best practices
- Audience targeting suggestions
- Posting time recommendations
- Engagement strategies

Include:
- Hook mechanisms for each format
- Social proof integration
- User-generated content ideas
- Community building elements

${options.customPrompt ? `Additional Requirements: ${options.customPrompt}` : ''}
`

  const result = await model.generateContent(systemPrompt)
  const response = result.response
  return {
    type: 'social-media',
    content: response.text(),
    metadata: {
      platform: options.platform,
      audience: options.targetAudience,
      formats: ['feed', 'story', 'carousel']
    }
  }
}

async function generateBannerAd(model: any, product: any, options: any) {
  const systemPrompt = `
You are a display advertising specialist creating high-converting banner ads.

Product Information:
- Title: ${product.title}
- Description: ${product.description}
- Category: ${product.category}
- Key Features: ${product.features.join(', ')}
- Target Audience: ${options.targetAudience || product.targetAudience?.join(', ')}

Platform: ${options.platform || 'Google Display Network'}
Market Hooks: ${options.marketingHooks?.join(', ') || 'compelling, click-worthy, professional'}

Create banner ad designs for multiple sizes:

**LEADERBOARD (728x90)**
- Horizontal layout optimization
- Text hierarchy and readability
- CTA button placement
- Visual element positioning

**MEDIUM RECTANGLE (300x250)**
- Square format design
- Balance of text and visuals
- Compact messaging strategy
- Eye-catching elements

**SKYSCRAPER (160x600)**
- Vertical layout design
- Progressive information flow
- Visual storytelling approach
- Bottom CTA placement

**MOBILE BANNER (320x50)**
- Mobile-first design
- Thumb-friendly CTA
- Minimal text approach
- High contrast elements

For each size include:
- Layout specifications
- Color scheme
- Typography recommendations
- Image/graphic requirements
- CTA text and styling
- Animation suggestions (if applicable)

Design Principles:
- F-pattern reading flow
- 5-second rule compliance
- Brand consistency
- A/B testing variations

${options.customPrompt ? `Additional Requirements: ${options.customPrompt}` : ''}
`

  const result = await model.generateContent(systemPrompt)
  const response = result.response
  return {
    type: 'banner-ad',
    content: response.text(),
    metadata: {
      platform: options.platform,
      sizes: ['728x90', '300x250', '160x600', '320x50'],
      audience: options.targetAudience
    }
  }
}

function generateDemoImageAd(product: any, options: any) {
  const platform = options.platform || 'Instagram'
  const style = options.adStyle || 'modern'
  const audience = options.targetAudience || 'General consumers'

  return `## 4 Professional Ad Concepts for ${product.title}

### Ad Concept 1: Premium Professional
**Visual Description**: Clean studio setup with ${product.title} as hero product. Soft directional lighting, 45-degree angle placement on premium white surface.

**Text Overlay**: "${product.features?.[0] || 'Premium Quality'} Redefined" | CTA: "Shop Now"

**Style**: Professional product photography, high-end commercial aesthetic

---

### Ad Concept 2: Lifestyle Integration
**Visual Description**: ${platform} lifestyle shot showing natural product usage in modern setting with authentic lighting.

**Text Overlay**: "Your Daily Game Changer" | CTA: "Discover More"

**Style**: ${style} lifestyle photography appealing to ${audience}

---

### Ad Concept 3: Feature Showcase
**Visual Description**: Dynamic multi-angle composition highlighting key features with technical overlays.

**Text Overlay**: "Innovation Meets Performance" | Features: "${product.features?.slice(0, 2).join(' • ') || 'Premium • Advanced'}"

**Style**: Technical feature-focused with clean graphics

---

### Ad Concept 4: Social Proof
**Visual Description**: User-generated content style showing community satisfaction across scenarios.

**Text Overlay**: "Join Thousands Who Love It" | "★★★★★ 4.9/5 Rating" | CTA: "Join Community"

**Style**: Authentic social media aesthetic

---

**Campaign Strategy**: 4 concepts targeting different motivations - quality seekers, lifestyle integrators, feature enthusiasts, and community-driven buyers. Perfect for A/B testing on ${platform} with ${audience} audience.

**Demo Mode**: AI generation temporarily unavailable - using structured demo content.`
}