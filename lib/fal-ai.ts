import { fal } from "@fal-ai/client";

// Configure Fal.ai client
fal.config({
  credentials: process.env.FAL_KEY || process.env.FAL_API_KEY || ""
});

/**
 * Generate advertisement images using Fal.ai nano-banana/edit model
 * This replaces Gemini image generation with real AI image generation
 */
export async function generateAdvertisementWithFal(
  prompt: string,
  productImageUrl: string,
  options: {
    numImages?: number;
    outputFormat?: 'jpeg' | 'png';
    syncMode?: boolean;
  } = {}
) {
  try {
    console.log('🎨 Generating advertisement image with Fal.ai...');
    console.log('Product image:', productImageUrl);
    console.log('Prompt:', prompt);

    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt: prompt,
        image_urls: [productImageUrl],
        num_images: options.numImages || 1,
        output_format: options.outputFormat || "jpeg",
        sync_mode: options.syncMode || false
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log('⏳ Fal.ai processing:', update.logs?.map((log) => log.message).join(', ') || 'Processing...');
        }
      },
    });

    console.log('✅ Fal.ai generation completed');
    console.log('Generated images:', result.data.images?.length || 0);
    console.log('Description:', result.data.description);

    return {
      success: true,
      images: result.data.images || [],
      description: result.data.description || '',
      requestId: result.requestId
    };

  } catch (error) {
    console.error('❌ Fal.ai generation failed:', error);
    throw new Error(`Fal.ai image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate multiple advertisement concepts using Fal.ai
 * Based on 1Click methodology but with real image generation
 */
export async function generateMultipleAdConceptsWithFal(product: any, options: any) {
  if (!product.image) {
    throw new Error('Product image URL is required for Fal.ai generation');
  }

  const concepts = [
    {
      name: 'Professional',
      focus: 'Clean studio photography with premium branding',
      style: 'professional',
      prompt: `Create a professional advertisement for ${product.title}. Clean studio setup with premium white background, soft directional lighting, modern typography showing "${product.title}" prominently. Professional product photography style with elegant branding elements. High-end commercial aesthetic.`
    },
    {
      name: 'Lifestyle',
      focus: 'Natural usage in everyday scenarios',
      style: 'lifestyle',
      prompt: `Transform this into a lifestyle advertisement showing ${product.title} in natural daily use. Modern home or outdoor setting, authentic lighting, people using the product naturally. Instagram-worthy lifestyle photography with warm, inviting atmosphere.`
    },
    {
      name: 'Feature Highlight',
      focus: 'Technical specifications and key benefits',
      style: 'technical',
      prompt: `Create a feature-focused advertisement for ${product.title} highlighting key features: ${product.features?.slice(0, 3).join(', ') || 'premium features'}. Technical showcase with feature callouts, specification overlays, multi-angle views. High-tech laboratory or clean workspace background.`
    },
    {
      name: 'Social Proof',
      focus: 'Community engagement and user testimonials',
      style: 'social',
      prompt: `Design a social proof advertisement for ${product.title} showing community satisfaction. User-generated content style with diverse usage scenarios, testimonials aesthetic, vibrant community colors, 5-star rating elements. Social media optimized design.`
    }
  ];

  const adConcepts = [];

  for (const concept of concepts) {
    try {
      console.log(`🎯 Generating ${concept.name} concept with Fal.ai...`);

      // Generate the advertisement image using Fal.ai
      const falResult = await generateAdvertisementWithFal(
        concept.prompt,
        product.image,
        {
          numImages: 1,
          outputFormat: 'jpeg',
          syncMode: false
        }
      );

      if (falResult.success && falResult.images.length > 0) {
        const generatedImage = falResult.images[0];

        adConcepts.push({
          concept: concept.name,
          prompt: JSON.stringify({
            concept: concept.name,
            headline: `${product.brand || 'Premium'} ${concept.name} Excellence`,
            subtext: getSubtextForConcept(concept.name),
            visualDescription: concept.prompt,
            style: concept.style,
            focus: concept.focus,
            falPrompt: concept.prompt,
            imageGeneration: 'Fal.ai nano-banana/edit'
          }, null, 2),
          imageBase64: generatedImage.url ? await convertUrlToBase64(generatedImage.url) : null,
          imageUrl: generatedImage.url,
          metadata: {
            platform: options.platform,
            style: concept.style,
            focus: concept.focus,
            generatedAt: new Date().toISOString(),
            generator: 'fal-ai',
            requestId: falResult.requestId,
            description: falResult.description
          }
        });

        console.log(`✅ Successfully generated ${concept.name} concept`);
      } else {
        throw new Error('No images generated');
      }

    } catch (conceptError) {
      console.error(`❌ Failed to generate ${concept.name} concept:`, conceptError);
      // Continue with other concepts rather than failing completely
    }
  }

  if (adConcepts.length === 0) {
    throw new Error('All Fal.ai image generation attempts failed - check your FAL_KEY and network connection');
  }

  return adConcepts;
}

/**
 * Convert image URL to base64 for display compatibility
 */
async function convertUrlToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting URL to base64:', error);
    // Return the original URL if conversion fails
    return imageUrl;
  }
}

/**
 * Get appropriate subtext for each concept type
 */
function getSubtextForConcept(conceptName: string): string {
  switch (conceptName) {
    case 'Professional':
      return 'Premium Quality Guaranteed';
    case 'Lifestyle':
      return 'Life Made Better';
    case 'Feature Highlight':
      return 'Innovation Meets Performance';
    case 'Social Proof':
      return '★★★★★ 4.9/5 Rating';
    default:
      return 'Exceptional Quality';
  }
}

/**
 * Generate video advertisement using Fal.ai Veo 3 Fast Image-to-Video
 * Converts static advertisement images into dynamic video ads
 */
export async function generateVideoAdWithFal(
  imageUrl: string,
  prompt: string,
  options: {
    aspectRatio?: 'auto' | '16:9' | '9:16';
    duration?: '8s';
    generateAudio?: boolean;
    resolution?: '720p' | '1080p';
  } = {}
) {
  try {
    console.log('🎬 Generating video ad with Fal.ai Veo 3...');
    console.log('Image URL:', imageUrl);
    console.log('Animation prompt:', prompt);

    const result = await fal.subscribe("fal-ai/veo3/fast/image-to-video", {
      input: {
        prompt: prompt,
        image_url: imageUrl,
        aspect_ratio: options.aspectRatio || "auto",
        duration: options.duration || "8s",
        generate_audio: options.generateAudio !== false, // Default to true
        resolution: options.resolution || "720p"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log('⏳ Veo 3 processing:', update.logs?.map((log) => log.message).join(', ') || 'Processing...');
        }
      },
    });

    console.log('✅ Veo 3 video generation completed');
    console.log('Generated video URL:', result.data.video?.url);

    return {
      success: true,
      video: result.data.video || null,
      requestId: result.requestId
    };

  } catch (error) {
    console.error('❌ Veo 3 video generation failed:', error);
    throw new Error(`Fal.ai video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate multiple video ad concepts from static images
 * This creates dynamic video versions of the static ad concepts
 */
export async function generateVideoAdConceptsWithFal(
  staticAdConcepts: any[],
  product: any,
  options: any
) {
  const videoAdConcepts = [];

  for (const staticConcept of staticAdConcepts) {
    try {
      // Skip if no image URL available
      if (!staticConcept.imageUrl && !staticConcept.imageBase64?.startsWith('data:image')) {
        console.log(`⚠️ Skipping ${staticConcept.concept} - no valid image for video generation`);
        continue;
      }

      console.log(`🎯 Generating video for ${staticConcept.concept} concept...`);

      // Create animation prompt based on concept type
      const animationPrompt = createAnimationPrompt(staticConcept.concept, product);

      // Use the image URL or convert base64 to URL if needed
      const imageUrl = staticConcept.imageUrl || (
        staticConcept.imageBase64?.startsWith('data:image')
          ? staticConcept.imageBase64
          : null
      );

      if (!imageUrl) {
        console.log(`⚠️ No valid image URL for ${staticConcept.concept} concept`);
        continue;
      }

      // Generate video from the static image
      const videoResult = await generateVideoAdWithFal(
        imageUrl,
        animationPrompt,
        {
          aspectRatio: '16:9', // Standard for most social media
          duration: '8s',
          generateAudio: true,
          resolution: '720p'
        }
      );

      if (videoResult.success && videoResult.video) {
        videoAdConcepts.push({
          concept: staticConcept.concept,
          staticImage: imageUrl,
          videoUrl: videoResult.video.url,
          animationPrompt: animationPrompt,
          prompt: staticConcept.prompt, // Keep original static prompt
          metadata: {
            ...staticConcept.metadata,
            videoGeneration: 'fal-ai-veo3',
            videoRequestId: videoResult.requestId,
            animationType: getAnimationTypeForConcept(staticConcept.concept),
            generatedAt: new Date().toISOString()
          }
        });

        console.log(`✅ Successfully generated video for ${staticConcept.concept} concept`);
      }

    } catch (conceptError) {
      console.error(`❌ Failed to generate video for ${staticConcept.concept}:`, conceptError);
      // Continue with other concepts
    }
  }

  if (videoAdConcepts.length === 0) {
    throw new Error('All video generation attempts failed - check your FAL_KEY and network connection');
  }

  return videoAdConcepts;
}

/**
 * Create animation prompt based on ad concept type
 */
function createAnimationPrompt(conceptName: string, product: any): string {
  const productName = product.title || 'product';

  switch (conceptName) {
    case 'Professional':
      return `Professional product showcase: The ${productName} slowly rotates 360 degrees on a premium white background. Soft lighting creates elegant shadows that dance around the product. Text elements fade in gracefully with smooth typography animations. Camera gently zooms in to highlight premium details. Clean, sophisticated motion emphasizing luxury and quality.`;

    case 'Lifestyle':
      return `Lifestyle story: Scene comes to life showing the ${productName} in natural daily use. People interact naturally with the product in a modern, warm environment. Smooth camera movements follow the action. Background elements like plants or home decor gently sway. Warm lighting shifts subtly to create an inviting atmosphere. Authentic, relatable motion that shows real-world benefits.`;

    case 'Feature Highlight':
      return `Technical showcase: Dynamic feature callouts animate in sequence highlighting key benefits of ${productName}. The product rotates to show different angles while specification overlays appear with smooth transitions. High-tech particle effects and subtle glows emphasize innovation. Camera moves with precision to focus on specific features. Modern, tech-forward animation style.`;

    case 'Social Proof':
      return `Community celebration: Multiple usage scenarios of ${productName} blend together seamlessly. Happy customers appear using the product in various settings. Star ratings and testimonial text animate in with energetic transitions. Vibrant colors pulse gently. Camera movements are dynamic and engaging, showing diverse community satisfaction. Social media aesthetic with authentic energy.`;

    default:
      return `The ${productName} comes to life with smooth, professional animation. Elegant camera movements showcase the product from multiple angles. Text elements appear with smooth transitions. Background elements subtly animate to create visual interest while maintaining focus on the product.`;
  }
}

/**
 * Get animation type for concept
 */
function getAnimationTypeForConcept(conceptName: string): string {
  switch (conceptName) {
    case 'Professional':
      return 'product-rotation';
    case 'Lifestyle':
      return 'lifestyle-story';
    case 'Feature Highlight':
      return 'feature-showcase';
    case 'Social Proof':
      return 'community-montage';
    default:
      return 'general-animation';
  }
}

/**
 * Health check for Fal.ai API
 */
export async function checkFalHealth() {
  try {
    // Test with a simple request
    const testResult = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt: "test image generation",
        image_urls: ["https://via.placeholder.com/500x500.jpg"],
        num_images: 1
      }
    });

    return {
      status: 'healthy',
      service: 'fal-ai',
      model: 'nano-banana/edit + veo3/fast/image-to-video',
      requestId: testResult.requestId
    };
  } catch (error) {
    return {
      status: 'error',
      service: 'fal-ai',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}