import { NextRequest, NextResponse } from 'next/server'
import { checkFalHealth } from '../../../../lib/fal-ai'

export async function GET(request: NextRequest) {
  try {
    const healthStatus = await checkFalHealth()

    return NextResponse.json({
      success: true,
      ...healthStatus,
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!(process.env.FAL_KEY || process.env.FAL_API_KEY)
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 'error',
      service: 'fal-ai',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!(process.env.FAL_KEY || process.env.FAL_API_KEY)
    }, { status: 500 })
  }
}