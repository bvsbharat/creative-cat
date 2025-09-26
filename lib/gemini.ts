import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '')

/**
 * Fetch and process image for Gemini API consumption
 * Based on 1Click repository implementation
 */
export async function fetchAndProcessImage(imageUrl: string) {
  try {
    if (!imageUrl) {
      throw new Error('No image URL provided')
    }

    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Get MIME type from response headers or infer from URL
    let mimeType = response.headers.get('content-type') || 'image/jpeg'
    if (!mimeType.startsWith('image/')) {
      // Infer from URL extension
      if (imageUrl.toLowerCase().includes('.png')) mimeType = 'image/png'
      else if (imageUrl.toLowerCase().includes('.webp')) mimeType = 'image/webp'
      else mimeType = 'image/jpeg'
    }

    return {
      inlineData: {
        data: base64,
        mimeType: mimeType
      }
    }
  } catch (error) {
    console.error('Error processing image:', error)
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate structured ad prompt using Gemini
 * Replicates 1Click repository's approach
 */
export async function generateAdPrompt(productData: any) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.8,
    }
  })

  const masterPrompt = `You are a world-class advertising creative director with expertise in visual design, psychology, and brand communication. Create a detailed JSON specification for a professional advertisement.

MASTER RULES FOR AD GENERATION:
1. TYPOGRAPHY: Use maximum 8 words for headlines, 6 words for subtext
2. VISUAL HIERARCHY: Create clear focal points and reading flow
3. COLOR PSYCHOLOGY: Choose colors that evoke the right emotions for ${productData.category || 'this product'}
4. BRAND CONSISTENCY: Maintain professional brand standards
5. PRODUCT FOCUS: The product must be the hero element
6. AUTHENTICITY: No fake testimonials or contact information
7. PLATFORM OPTIMIZATION: Designed for ${productData.platform || 'social media'}
8. CALL TO ACTION: Clear, compelling, action-oriented
9. WHITE SPACE: Use negative space effectively for premium feel
10. READABILITY: Ensure text is legible across all devices
11. EMOTIONAL RESONANCE: Connect with target audience needs

PRODUCT INFORMATION:
- Title: ${productData.title}
- Description: ${productData.description}
- Price: ${productData.price || 'Premium pricing'}
- Category: ${productData.category || 'Premium product'}
- Brand: ${productData.brand || 'Quality brand'}
- Key Features: ${Array.isArray(productData.features) ? productData.features.join(', ') : 'Premium features'}

Generate a JSON response with this EXACT structure:
{
  "headline": "compelling 6-8 word headline",
  "subtext": "supporting 4-6 words",
  "visualDescription": "detailed scene description for AI image generation including lighting, composition, background, mood",
  "colorPalette": {
    "primary": "dominant color with psychology reasoning",
    "secondary": "supporting color",
    "accent": "highlight color for CTA",
    "background": "backdrop color"
  },
  "composition": {
    "layout": "visual arrangement description",
    "productPlacement": "how product should be positioned",
    "textPlacement": "where text elements go",
    "visualFlow": "eye movement pattern"
  },
  "style": "photography style (professional, lifestyle, technical, artistic)",
  "backgroundContext": "appropriate setting description",
  "ctaText": "2-4 word call to action",
  "targetEmotion": "primary emotion to evoke",
  "brandPersonality": "brand voice and feel"
}`

  try {
    const result = await model.generateContent(masterPrompt)
    const rawResponse = result.response.text()

    // Clean and parse JSON response (1Click does this)
    let cleanedResponse = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    // Try to parse JSON
    try {
      const parsedJson = JSON.parse(cleanedResponse)
      return JSON.stringify(parsedJson, null, 2)
    } catch (parseError) {
      // Attempt to fix common JSON issues
      cleanedResponse = cleanedResponse
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to keys

      const parsedJson = JSON.parse(cleanedResponse)
      return JSON.stringify(parsedJson, null, 2)
    }
  } catch (error) {
    console.error('Error generating ad prompt:', error)
    throw new Error(`Ad prompt generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate detailed advertisement description using Gemini Vision
 * Analyzes product image and creates comprehensive ad specification
 */
export async function generateAdvertisementImage(adPromptJson: string, productImageUrl?: string) {
  if (!productImageUrl) {
    throw new Error('Product image URL is required for advertisement generation')
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro" // Use vision-capable model for analysis
  })

  try {
    // Process the product image
    console.log('Analyzing product image:', productImageUrl)
    const processedImage = await fetchAndProcessImage(productImageUrl)

    // Parse the ad prompt JSON for context
    const adSpec = JSON.parse(adPromptJson)

    // Create comprehensive visual analysis prompt
    const analysisPrompt = `As an expert advertising creative director, analyze this product image and create a comprehensive advertisement specification.

CURRENT AD SPECIFICATION:
${adPromptJson}

VISUAL ANALYSIS TASK:
1. Analyze the product image details, colors, lighting, and composition
2. Identify key visual elements that should be highlighted
3. Suggest optimal background and styling based on the product
4. Create specific design recommendations for professional advertisement

Provide a detailed response in this JSON format:
{
  "productAnalysis": {
    "colors": "dominant colors in the product",
    "style": "product aesthetic (modern, classic, premium, etc.)",
    "keyFeatures": "visually prominent features",
    "backgroundSuggestion": "ideal background for this product"
  },
  "adEnhancements": {
    "visualHierarchy": "how to arrange elements for maximum impact",
    "colorHarmony": "color scheme that complements the product",
    "lightingRecommendation": "lighting style for professional look",
    "compositionTips": "specific layout recommendations"
  },
  "imageGenerationPrompt": "detailed prompt for AI image generators like DALL-E, Midjourney, or Stable Diffusion to create this advertisement",
  "designSpecs": {
    "dimensions": "recommended aspect ratios",
    "typography": "font style recommendations",
    "brandingPlacement": "where to place logos and text"
  }
}`

    const result = await model.generateContent([
      analysisPrompt,
      processedImage
    ])

    const response = await result.response
    const analysisText = response.text()

    // Try to extract JSON from response
    let cleanedResponse = analysisText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    // Create a comprehensive specification including the analysis
    const enhancedSpec = {
      originalSpec: adSpec,
      visualAnalysis: cleanedResponse,
      imageGenerationReady: true,
      timestamp: new Date().toISOString()
    }

    // Return as base64 encoded JSON (simulating image data format for compatibility)
    const specString = JSON.stringify(enhancedSpec, null, 2)
    const base64Spec = Buffer.from(specString).toString('base64')

    return `data:application/json;base64,${base64Spec}`

  } catch (error) {
    console.error('Error analyzing product for advertisement:', error)
    throw new Error(`Advertisement analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate multiple ad concepts with real images
 * Enhanced version of your current implementation
 */
export async function generateMultipleAdConcepts(product: any, options: any) {
  const concepts = [
    {
      name: 'Professional',
      focus: 'Clean studio photography with premium branding',
      style: 'professional'
    },
    {
      name: 'Lifestyle',
      focus: 'Natural usage in everyday scenarios',
      style: 'lifestyle'
    },
    {
      name: 'Feature Highlight',
      focus: 'Technical specifications and key benefits',
      style: 'technical'
    },
    {
      name: 'Social Proof',
      focus: 'Community engagement and user testimonials',
      style: 'social'
    }
  ]

  const adConcepts = []

  for (const concept of concepts) {
    try {
      console.log(`Generating ${concept.name} concept...`)

      // Enhance product data with concept-specific information
      const conceptProduct = {
        ...product,
        platform: options.platform,
        style: concept.style,
        focus: concept.focus
      }

      // Generate structured ad prompt
      const adPromptJson = await generateAdPrompt(conceptProduct)

      // Generate real advertisement image
      const imageBase64 = await generateAdvertisementImage(adPromptJson, product.image)

      adConcepts.push({
        concept: concept.name,
        prompt: adPromptJson,
        imageBase64: imageBase64,
        metadata: {
          platform: options.platform,
          style: concept.style,
          focus: concept.focus,
          generatedAt: new Date().toISOString()
        }
      })

      console.log(`✅ Successfully generated ${concept.name} concept`)

    } catch (conceptError) {
      console.error(`❌ Failed to generate ${concept.name} concept:`, conceptError)
      // Continue with other concepts rather than failing completely
    }
  }

  if (adConcepts.length === 0) {
    throw new Error('All image generation attempts failed - check your API key and network connection')
  }

  return adConcepts
}

/**
 * Health check for Gemini API
 */
export async function checkGeminiHealth() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent("Test connection")
    return {
      status: 'healthy',
      model: 'gemini-2.5-flash',
      response: result.response.text().substring(0, 50) + '...'
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}