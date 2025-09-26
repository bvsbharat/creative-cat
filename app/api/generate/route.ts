import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, prompt, newsContext, marketingHooks, targetAudience } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured'
      }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let generatedContent;

    switch (type) {
      case 'ad-copy':
        generatedContent = await generateAdCopy(model, prompt, newsContext, marketingHooks, targetAudience);
        break;
      case 'social-post':
        generatedContent = await generateSocialPost(model, prompt, newsContext, marketingHooks, targetAudience);
        break;
      case 'campaign-strategy':
        generatedContent = await generateCampaignStrategy(model, prompt, newsContext, marketingHooks, targetAudience);
        break;
      case 'visual-description':
        generatedContent = await generateVisualDescription(model, prompt, newsContext, marketingHooks, targetAudience);
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid generation type'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generation Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate content'
    }, { status: 500 });
  }
}

async function generateAdCopy(model: any, prompt: string, newsContext: any[], marketingHooks: string[], targetAudience: string) {
  const systemPrompt = `
You are an expert copywriter specializing in high-converting ad copy.
Generate compelling advertising copy based on the latest market trends and news insights.

Latest News Context: ${JSON.stringify(newsContext?.slice(0, 3) || [])}
Marketing Hooks: ${marketingHooks?.join(', ') || 'innovative, trending, exclusive'}
Target Audience: ${targetAudience || 'general consumers'}

Create 3 different ad copy variations with:
1. Headline (max 60 characters)
2. Description (max 150 characters)
3. Call-to-action (max 20 characters)

Focus on incorporating trending hooks and current market sentiment.
`;

  const result = await model.generateContent(systemPrompt + '\n\nUser Request: ' + prompt);
  const response = result.response;
  return response.text();
}

async function generateSocialPost(model: any, prompt: string, newsContext: any[], marketingHooks: string[], targetAudience: string) {
  const systemPrompt = `
You are a social media expert creating viral content.
Generate engaging social media posts based on current trends and news.

Latest News Context: ${JSON.stringify(newsContext?.slice(0, 3) || [])}
Marketing Hooks: ${marketingHooks?.join(', ') || 'viral, trending, engaging'}
Target Audience: ${targetAudience || 'social media users'}

Create posts for:
1. Instagram (with hashtags)
2. Twitter/X (max 280 characters)
3. LinkedIn (professional tone)

Make them shareable and incorporate current trends.
`;

  const result = await model.generateContent(systemPrompt + '\n\nUser Request: ' + prompt);
  const response = result.response;
  return response.text();
}

async function generateCampaignStrategy(model: any, prompt: string, newsContext: any[], marketingHooks: string[], targetAudience: string) {
  const systemPrompt = `
You are a marketing strategist developing comprehensive campaign strategies.
Create detailed marketing campaign plans based on current market conditions.

Latest News Context: ${JSON.stringify(newsContext?.slice(0, 5) || [])}
Marketing Hooks: ${marketingHooks?.join(', ') || 'strategic, data-driven, results-focused'}
Target Audience: ${targetAudience || 'business decision makers'}

Provide:
1. Campaign Overview
2. Target Audience Analysis
3. Key Messages
4. Channel Strategy
5. Success Metrics
6. Timeline
7. Budget Considerations

Base recommendations on current market trends and news insights.
`;

  const result = await model.generateContent(systemPrompt + '\n\nUser Request: ' + prompt);
  const response = result.response;
  return response.text();
}

async function generateVisualDescription(model: any, prompt: string, newsContext: any[], marketingHooks: string[], targetAudience: string) {
  const systemPrompt = `
You are a creative director specializing in visual advertising concepts.
Create detailed descriptions for visual ads and creative assets.

Latest News Context: ${JSON.stringify(newsContext?.slice(0, 3) || [])}
Marketing Hooks: ${marketingHooks?.join(', ') || 'visually striking, memorable, impactful'}
Target Audience: ${targetAudience || 'visual content consumers'}

Describe:
1. Visual Concept
2. Color Palette
3. Typography Style
4. Key Visual Elements
5. Composition Layout
6. Mood and Tone
7. Call-to-action Placement

Make descriptions detailed enough for designers or AI image generators.
`;

  const result = await model.generateContent(systemPrompt + '\n\nUser Request: ' + prompt);
  const response = result.response;
  return response.text();
}