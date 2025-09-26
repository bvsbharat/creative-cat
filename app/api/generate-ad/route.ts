import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateMultipleAdConceptsWithFal } from '../../../lib/fal-ai'

export const maxDuration = 300 // 5-minute timeout for complex image generation

// Zod schemas for validation (like 1Click)
const ProductDataSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.union([z.string(), z.number()]).optional(),
  currency: z.string().optional(),
  images: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
})

const AmazonProductSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.union([z.string(), z.number()]).optional(),
  currency: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
})

const generateAdRequestSchema = z.object({
  productData: z.union([
    ProductDataSchema,
    AmazonProductSchema,
    z.array(AmazonProductSchema)
  ]),
  adType: z.enum(['professional', 'social', 'lifestyle', 'feature']).default('professional'),
  platform: z.string().default('instagram'),
  style: z.string().default('modern'),
  customPrompt: z.string().optional(),
})

interface GenerateAdResponse {
  success: boolean
  imageBase64?: string
  prompt?: string
  error?: string
  adConcepts?: Array<{
    concept: string
    imageBase64?: string
    prompt?: string
  }>
}

// Gemini client is now handled in lib/gemini.ts

export async function POST(request: NextRequest) {
  try {
    if (!process.env.FAL_KEY && !process.env.FAL_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Fal.ai API key not configured (set FAL_KEY environment variable)'
      } as GenerateAdResponse, { status: 400 })
    }

    const body = await request.json()
    const { productData, adType, platform, style, customPrompt } = generateAdRequestSchema.parse(body)

    // Transform input data to standardized format
    const transformedProduct = transformToProductData(productData)

    try {
      // Check if we have a valid product image for real generation
      if (!transformedProduct.image) {
        console.log('No product image provided, using demo content')
        throw new Error('Product image required for AI generation')
      }

      console.log('🎨 Generating real advertisement images with Fal.ai...')
      console.log('Product:', transformedProduct.title)
      console.log('Image URL:', transformedProduct.image)

      // Generate real images using Fal.ai nano-banana/edit model
      const adConcepts = await generateMultipleAdConceptsWithFal(transformedProduct, {
        adType,
        platform,
        style,
        customPrompt
      })

      console.log(`✅ Successfully generated ${adConcepts.length} ad concepts with Fal.ai`)

      return NextResponse.json({
        success: true,
        adConcepts,
        productInfo: {
          title: transformedProduct.title,
          category: transformedProduct.category
        },
        note: `Generated ${adConcepts.length} real AI advertisements using Fal.ai`
      } as GenerateAdResponse)

    } catch (imageError) {
      console.log('❌ Real image generation failed, using structured demo content:', imageError)

      // Fallback to structured demo content
      const demoContent = generateDemoAdConcepts(transformedProduct, {
        adType,
        platform,
        style,
        customPrompt
      })

      return NextResponse.json({
        success: true,
        adConcepts: demoContent,
        productInfo: {
          title: transformedProduct.title,
          category: transformedProduct.category
        },
        note: `Demo content - Fal.ai generation failed: ${imageError instanceof Error ? imageError.message : 'Check FAL_KEY configuration'}`
      } as GenerateAdResponse)
    }

  } catch (error: any) {
    console.error('Generate ad error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate advertisement'
    } as GenerateAdResponse, { status: 500 })
  }
}

function transformToProductData(input: any): any {
  // Handle array input (take first item)
  if (Array.isArray(input)) {
    input = input[0]
  }

  // Standardize the data format
  return {
    title: input.title || 'Premium Product',
    description: input.description || 'High-quality product with premium features',
    price: input.price || undefined,
    currency: input.currency || 'USD',
    image: input.image || input.images?.[0] || '',
    images: input.images || (input.image ? [input.image] : []),
    features: input.features || [],
    category: input.category || 'General',
    brand: input.brand || 'Premium Brand'
  }
}

// Old implementation functions removed - now using lib/gemini.ts

function generateDemoAdConcepts(product: any, options: any) {
  const concepts = [
    {
      concept: 'Professional',
      prompt: JSON.stringify({
        concept: 'Professional',
        headline: `${product.brand} ${product.title.split(' ')[0]} Excellence`,
        subtext: 'Premium Quality Guaranteed',
        visualDescription: `Clean studio setup with ${product.title} as hero product on premium white surface with soft directional lighting`,
        colorPalette: ['white', 'silver', 'brand-blue'],
        composition: 'Center-focused with rule of thirds text placement',
        style: 'Professional product photography',
        backgroundContext: `Premium ${product.category} studio environment`,
        ctaText: 'Shop Now',
        productPlacement: 'Hero position with 45-degree angle'
      }, null, 2),
      imageBase64: `data:text/plain;base64,${Buffer.from(`Professional ad concept for ${product.title} - Clean studio photography`).toString('base64')}`,
      metadata: { platform: options.platform, style: 'professional', type: 'demo' }
    },
    {
      concept: 'Lifestyle',
      prompt: JSON.stringify({
        concept: 'Lifestyle',
        headline: 'Your Daily Game Changer',
        subtext: 'Life Made Better',
        visualDescription: `${options.platform} lifestyle shot showing ${product.title} in natural daily use with authentic lighting`,
        colorPalette: ['natural-tones', 'earth-brown', 'soft-green'],
        composition: 'Environmental portrait with natural integration',
        style: 'Lifestyle photography',
        backgroundContext: 'Modern home or outdoor setting',
        ctaText: 'Discover More',
        productPlacement: 'Naturally integrated in lifestyle scene'
      }, null, 2),
      imageBase64: `data:text/plain;base64,${Buffer.from(`Lifestyle ad concept for ${product.title} - Natural daily usage scenario`).toString('base64')}`,
      metadata: { platform: options.platform, style: 'lifestyle', type: 'demo' }
    },
    {
      concept: 'Feature Highlight',
      prompt: JSON.stringify({
        concept: 'Feature Highlight',
        headline: 'Innovation Meets Performance',
        subtext: product.features.slice(0, 2).join(' • ') || 'Advanced Features',
        visualDescription: `Technical showcase of ${product.title} with feature callouts and specification overlays`,
        colorPalette: ['tech-blue', 'electric-green', 'carbon-black'],
        composition: 'Multi-angle view with technical annotations',
        style: 'Technical feature photography',
        backgroundContext: 'High-tech laboratory or clean workspace',
        ctaText: 'Learn More',
        productPlacement: 'Multiple angles showing key features'
      }, null, 2),
      imageBase64: `data:text/plain;base64,${Buffer.from(`Feature highlight ad for ${product.title} - Technical specifications focus`).toString('base64')}`,
      metadata: { platform: options.platform, style: 'technical', type: 'demo' }
    },
    {
      concept: 'Social Proof',
      prompt: JSON.stringify({
        concept: 'Social Proof',
        headline: 'Join Thousands Who Love It',
        subtext: '★★★★★ 4.9/5 Rating',
        visualDescription: `User-generated content style showing community satisfaction with ${product.title}`,
        colorPalette: ['vibrant-colors', 'community-orange', 'trust-blue'],
        composition: 'Collage of user scenarios and testimonials',
        style: 'Social media aesthetic',
        backgroundContext: 'Diverse community usage scenarios',
        ctaText: 'Join Community',
        productPlacement: 'Featured in authentic user scenarios'
      }, null, 2),
      imageBase64: `data:text/plain;base64,${Buffer.from(`Social proof ad for ${product.title} - Community testimonials and ratings`).toString('base64')}`,
      metadata: { platform: options.platform, style: 'social', type: 'demo' }
    }
  ]

  return concepts
}