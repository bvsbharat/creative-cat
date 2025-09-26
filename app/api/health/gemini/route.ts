import { NextRequest, NextResponse } from 'next/server'
import { checkGeminiHealth } from '../../../../lib/gemini'

export async function GET(request: NextRequest) {
  try {
    const health = await checkGeminiHealth()

    return NextResponse.json({
      success: health.status === 'healthy',
      ...health,
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!(process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY)
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!(process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY)
    }, { status: 500 })
  }
}