import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateMultipleAdConceptsWithFal, generateVideoAdConceptsWithFal } from '../../../lib/fal-ai'

export const maxDuration = 600 // 10-minute timeout for video generation

// Zod schemas for validation
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

const generateVideoAdRequestSchema = z.object({
  productData: z.union([
    ProductDataSchema,
    AmazonProductSchema,
    z.array(AmazonProductSchema)
  ]),
  adType: z.enum(['professional', 'social', 'lifestyle', 'feature']).default('professional'),
  platform: z.string().default('instagram'),
  style: z.string().default('modern'),
  customPrompt: z.string().optional(),
  videoOptions: z.object({
    resolution: z.enum(['720p', '1080p']).default('720p'),
    generateAudio: z.boolean().default(true),
    aspectRatio: z.enum(['auto', '16:9', '9:16']).default('16:9')
  }).optional()
})

interface GenerateVideoAdResponse {
  success: boolean
  staticAdConcepts?: Array<{
    concept: string
    imageBase64?: string
    imageUrl?: string
    prompt?: string
  }>
  videoAdConcepts?: Array<{
    concept: string
    staticImage?: string
    videoUrl?: string
    animationPrompt?: string
    prompt?: string
  }>
  error?: string
  note?: string
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.FAL_KEY && !process.env.FAL_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Fal.ai API key not configured (set FAL_KEY environment variable)'
      } as GenerateVideoAdResponse, { status: 400 })
    }

    const body = await request.json()
    const { productData, adType, platform, style, customPrompt, videoOptions } = generateVideoAdRequestSchema.parse(body)

    // Transform input data to standardized format
    const transformedProduct = transformToProductData(productData)

    try {
      // Check if we have a valid product image for real generation
      if (!transformedProduct.image) {
        console.log('No product image provided for video generation')
        throw new Error('Product image required for AI video generation')
      }

      console.log('🎬 Starting video ad generation workflow with Fal.ai...')
      console.log('Step 1: Generating static images...')
      console.log('Product:', transformedProduct.title)
      console.log('Image URL:', transformedProduct.image)

      // Step 1: Generate static ad concepts first
      const staticAdConcepts = await generateMultipleAdConceptsWithFal(transformedProduct, {
        adType,
        platform,
        style,
        customPrompt
      })

      console.log(`✅ Generated ${staticAdConcepts.length} static ad concepts`)
      console.log('Step 2: Converting to videos with Veo 3...')

      // Step 2: Convert static images to videos
      const videoAdConcepts = await generateVideoAdConceptsWithFal(
        staticAdConcepts,
        transformedProduct,
        {
          ...videoOptions,
          platform,
          style
        }
      )

      console.log(`✅ Successfully generated ${videoAdConcepts.length} video ad concepts`)

      return NextResponse.json({
        success: true,
        staticAdConcepts,
        videoAdConcepts,
        productInfo: {
          title: transformedProduct.title,
          category: transformedProduct.category
        },
        note: `Generated ${staticAdConcepts.length} static + ${videoAdConcepts.length} video advertisements using Fal.ai + Veo 3`
      } as GenerateVideoAdResponse)

    } catch (videoError) {
      console.log('❌ Video generation failed, returning static ads only:', videoError)

      // Try to generate at least static ads as fallback
      try {
        const staticAdConcepts = await generateMultipleAdConceptsWithFal(transformedProduct, {
          adType,
          platform,
          style,
          customPrompt
        })

        return NextResponse.json({
          success: true,
          staticAdConcepts,
          videoAdConcepts: [], // Empty video concepts
          productInfo: {
            title: transformedProduct.title,
            category: transformedProduct.category
          },
          note: `Static ads generated successfully - Video generation failed: ${videoError instanceof Error ? videoError.message : 'Unknown error'}`
        } as GenerateVideoAdResponse)

      } catch (staticError) {
        // Fallback to demo content
        const demoContent = generateDemoVideoAdConcepts(transformedProduct, {
          adType,
          platform,
          style,
          customPrompt
        })

        return NextResponse.json({
          success: true,
          staticAdConcepts: demoContent.static,
          videoAdConcepts: demoContent.video,
          productInfo: {
            title: transformedProduct.title,
            category: transformedProduct.category
          },
          note: `Demo content - Video generation failed: ${videoError instanceof Error ? videoError.message : 'Check FAL_KEY configuration'}`
        } as GenerateVideoAdResponse)
      }
    }

  } catch (error: any) {
    console.error('Generate video ad error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate video advertisement'
    } as GenerateVideoAdResponse, { status: 500 })
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

function generateDemoVideoAdConcepts(product: any, options: any) {
  const staticConcepts = [
    {
      concept: 'Professional',
      prompt: JSON.stringify({
        concept: 'Professional',
        headline: `${product.brand} ${product.title.split(' ')[0]} Excellence`,
        subtext: 'Premium Quality Guaranteed',
        visualDescription: `Clean studio setup with ${product.title} as hero product on premium white surface`,
        animationStyle: 'Smooth 360-degree rotation with elegant lighting effects'
      }, null, 2),
      imageBase64: `data:text/plain;base64,${Buffer.from(`Professional static ad for ${product.title}`).toString('base64')}`,
      metadata: { platform: options.platform, style: 'professional', type: 'demo' }
    },
    {
      concept: 'Lifestyle',
      prompt: JSON.stringify({
        concept: 'Lifestyle',
        headline: 'Your Daily Game Changer',
        subtext: 'Life Made Better',
        visualDescription: `${options.platform} lifestyle shot showing ${product.title} in natural daily use`,
        animationStyle: 'Natural interaction with smooth camera movements'
      }, null, 2),
      imageBase64: `data:text/plain;base64,${Buffer.from(`Lifestyle static ad for ${product.title}`).toString('base64')}`,
      metadata: { platform: options.platform, style: 'lifestyle', type: 'demo' }
    }
  ]

  const videoConcepts = staticConcepts.map(staticConcept => ({
    concept: staticConcept.concept,
    staticImage: staticConcept.imageBase64,
    videoUrl: `demo:video:${staticConcept.concept.toLowerCase()}`,
    animationPrompt: `Demo ${staticConcept.concept} animation for ${product.title} - 8 second professional video showcase`,
    prompt: staticConcept.prompt,
    metadata: {
      ...staticConcept.metadata,
      videoGeneration: 'demo-veo3',
      animationType: staticConcept.concept.toLowerCase(),
      type: 'demo-video'
    }
  }))

  return {
    static: staticConcepts,
    video: videoConcepts
  }
}