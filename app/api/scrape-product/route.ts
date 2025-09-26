import { NextRequest, NextResponse } from 'next/server'
import { scrapeAmazonProduct } from '@/lib/utils/productScraper'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate Amazon URL
    const isAmazonUrl = url.includes('amazon.') || url.includes('amzn.')
    if (!isAmazonUrl) {
      return NextResponse.json(
        { success: false, error: 'Only Amazon URLs are supported' },
        { status: 400 }
      )
    }

    // Scrape product using Apify (same as 1Click)
    const productData = await scrapeAmazonProduct(url)

    return NextResponse.json({
      success: true,
      productData
    })

  } catch (error: any) {
    console.error('Scrape product error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to scrape product'
      },
      { status: 500 }
    )
  }
}