import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product, { IProduct } from '@/lib/models/Product'
import { scrapeAmazonProduct, createDemoProduct } from '@/lib/utils/productScraper'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')

    const query = category ? { category } : {}
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      products
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products. Please check database connection.',
      products: []
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productUrl, manualData, productData, amazonUrl } = body

    let finalProductData: Partial<IProduct>

    // Handle new format from ProductPreviewModal
    if (productData && amazonUrl) {
      finalProductData = {
        ...productData,
        amazonUrl: amazonUrl,
        scrapedData: productData
      }
    }
    // Handle legacy productUrl format
    else if (productUrl) {
      if (productUrl.includes('amazon.')) {
        try {
          const scrapedData = await scrapeAmazonProduct(productUrl)
          finalProductData = {
            ...scrapedData,
            amazonUrl: productUrl,
            scrapedData: scrapedData
          }
        } catch (error) {
          console.error('Scraping failed, using demo data:', error)
          finalProductData = {
            ...createDemoProduct(productUrl),
            amazonUrl: productUrl
          }
        }
      } else {
        return NextResponse.json({
          success: false,
          error: 'Currently only Amazon URLs are supported'
        }, { status: 400 })
      }
    }
    // Handle manual data
    else if (manualData) {
      finalProductData = manualData
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either productUrl, productData, or manualData is required'
      }, { status: 400 })
    }

    try {
      await dbConnect()

      // Check if product already exists (by URL or title)
      const checkUrl = amazonUrl || productUrl
      const existingProduct = checkUrl
        ? await Product.findOne({ amazonUrl: checkUrl })
        : await Product.findOne({ title: finalProductData.title })

      if (existingProduct) {
        return NextResponse.json({
          success: true,
          product: existingProduct,
          message: 'Product already exists'
        })
      }

      // Create new product
      const product = new Product(finalProductData)
      await product.save()

      return NextResponse.json({
        success: true,
        product,
        message: 'Product created successfully'
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Failed to save product to database. Please check MongoDB connection.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create product'
    }, { status: 500 })
  }
}