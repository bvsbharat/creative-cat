"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3,
  Brain,
  Camera,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Grid,
  ImageIcon,
  Lightbulb,
  Menu,
  MessageSquare,
  Play,
  Plus,
  Search,
  Settings,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  Video,
  Wand2,
  X,
  Zap,
  Target,
  PieChart,
  Activity,
  Globe,
  Newspaper
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import ProductPreviewModal from "@/components/product/ProductPreviewModal"
import { ScrapedProductData } from "@/lib/utils/productScraper"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar
} from 'recharts'

interface NewsArticle {
  title: string
  description: string
  publishedAt: string
  source: { name: string }
  marketingHooks: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  trendScore: number
}

interface AnalyticsData {
  overview: {
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    averageCTR: number
    averageCPC: number
    averageROAS: number
    totalSpend: number
  }
  timeline: Array<{
    date: string
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    cpc: number
    roas: number
    spend: number
  }>
  topPerformingAds: Array<{
    id: string
    title: string
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    roas: number
  }>
}

interface Product {
  _id: string
  title: string
  description: string
  price?: number
  currency?: string
  images: string[]
  category: string
  brand?: string
  features: string[]
  targetAudience?: string[]
  keywords?: string[]
  amazonUrl?: string
}

interface GeneratedAd {
  type: string
  content: string
  metadata: any
}

export default function Creative() {
  const [activeTab, setActiveTab] = useState("analytics")
  const [newsData, setNewsData] = useState<NewsArticle[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [generatedContent, setGeneratedContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Product and ads states
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [productUrl, setProductUrl] = useState('')
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([])
  const [selectedAdType, setSelectedAdType] = useState('image-generation')
  const [targetAudience, setTargetAudience] = useState('')
  const [adStyle, setAdStyle] = useState('modern')
  const [platform, setPlatform] = useState('instagram')
  const [customPrompt, setCustomPrompt] = useState('')

  // Product preview modal states
  const [showProductModal, setShowProductModal] = useState(false)
  const [previewProductData, setPreviewProductData] = useState<ScrapedProductData | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchNewsData()
    fetchAnalyticsData()
    fetchProducts()
  }, [])

  const fetchNewsData = async () => {
    try {
      const response = await fetch('/api/news?q=marketing advertising AI')
      const data = await response.json()
      if (data.success) {
        setNewsData(data.articles)
      }
    } catch (error) {
      console.error('Failed to fetch news:', error)
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics?range=7d')
      const data = await response.json()
      if (data.success) {
        setAnalyticsData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const generateContent = async (type: string, prompt: string) => {
    setIsGenerating(true)
    try {
      const marketingHooks = newsData.flatMap(article => article.marketingHooks).slice(0, 10)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          prompt,
          newsContext: newsData.slice(0, 3),
          marketingHooks,
          targetAudience: 'business professionals'
        })
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedContent(data.content)
      }
    } catch (error) {
      console.error('Failed to generate content:', error)
    }
    setIsGenerating(false)
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      if (data.success) {
        setProducts(data.products)
      } else {
        console.error('Failed to fetch products:', data.error)
        toast({
          title: "Failed to Load Products",
          description: data.error || "Could not load products from database.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast({
        title: "Connection Error",
        description: "Could not connect to server.",
        variant: "destructive"
      })
    }
  }

  const addProductFromUrl = async () => {
    if (!productUrl.trim()) return

    setShowProductModal(true)
    setIsPreviewLoading(true)

    try {
      // Fetch product data using Apify (1Click methodology)
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: productUrl.trim() })
      })

      const data = await response.json()
      if (data.success) {
        setPreviewProductData(data.productData)
        toast({
          title: "Product Fetched Successfully",
          description: "Product details loaded via Apify API. Review and save to database.",
          variant: "success"
        })
      } else {
        throw new Error(data.error || 'Failed to fetch product')
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      toast({
        title: "Failed to Fetch Product",
        description: "Could not fetch product details. Please check the URL and try again.",
        variant: "destructive"
      })
      setShowProductModal(false)
    }
    setIsPreviewLoading(false)
  }

  const handleSaveProduct = async (productData: ScrapedProductData) => {
    setIsSavingProduct(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productData,
          amazonUrl: productUrl.trim()
        })
      })

      const data = await response.json()
      if (data.success) {
        // Add the product to local state immediately
        const newProduct = data.product
        setProducts(prevProducts => {
          // Check if product already exists to avoid duplicates
          const existingIndex = prevProducts.findIndex(p => p._id === newProduct._id)
          if (existingIndex >= 0) {
            // Update existing product
            const updated = [...prevProducts]
            updated[existingIndex] = newProduct
            return updated
          } else {
            // Add new product to the beginning
            return [newProduct, ...prevProducts]
          }
        })
        setSelectedProduct(newProduct._id)
        setProductUrl('')
        setShowProductModal(false)
        setPreviewProductData(null)

        const isDatabaseUnavailable = data.message?.includes('database temporarily unavailable')
        toast({
          title: "Product Saved",
          description: isDatabaseUnavailable
            ? "Product saved locally (database temporarily unavailable)"
            : "Product has been successfully saved to your database.",
          variant: "success"
        })
      } else {
        throw new Error(data.error || 'Failed to save product')
      }
    } catch (error) {
      console.error('Failed to save product:', error)
      toast({
        title: "Failed to Save Product",
        description: "Could not save product. Please try again.",
        variant: "destructive"
      })
    }
    setIsSavingProduct(false)
  }

  const handleCloseModal = () => {
    setShowProductModal(false)
    setPreviewProductData(null)
    setIsPreviewLoading(false)
  }

  const generateAdvancedAd = async () => {
    if (!selectedProduct) return

    setIsGenerating(true)
    try {
      const marketingHooks = newsData.flatMap(article => article.marketingHooks).slice(0, 10)

      // Find the selected product data to include as fallback
      const selectedProductData = products.find(p => p._id === selectedProduct)

      // Use appropriate endpoint based on ad type
      if (selectedAdType === 'image-generation' || selectedAdType === 'video-generation') {
        const endpoint = selectedAdType === 'video-generation' ? '/api/generate-video-ad' : '/api/generate-ad'
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productData: selectedProductData,
            adType: 'professional', // Default to professional for 1Click
            platform: platform,
            style: adStyle,
            customPrompt: customPrompt,
            ...(selectedAdType === 'video-generation' && {
              videoOptions: {
                resolution: '720p',
                generateAudio: true,
                aspectRatio: '16:9'
              }
            })
          })
        })

        const data = await response.json()
        if (data.success) {
          let transformedAds = []

          // Handle video generation response
          if (selectedAdType === 'video-generation' && data.videoAdConcepts) {
            transformedAds = data.videoAdConcepts.map((concept: any) => ({
              type: 'video-ad',
              content: `## ${concept.concept} Video Advertisement

**Concept**: ${concept.concept}

**Animation Prompt**:
${concept.animationPrompt}

**Static Image**: ${concept.staticImage ? 'Available' : 'Not available'}
**Video**: ${concept.videoUrl ? 'Generated' : 'Generation in progress...'}

**Platform**: ${concept.metadata?.platform || platform}
**Style**: ${concept.metadata?.style || adStyle}
**Animation Type**: ${concept.metadata?.animationType || 'Professional'}`,
              metadata: {
                platform: concept.metadata?.platform || platform,
                style: concept.metadata?.style || adStyle,
                concept: concept.concept,
                videoUrl: concept.videoUrl,
                staticImage: concept.staticImage,
                animationPrompt: concept.animationPrompt,
                animationType: concept.metadata?.animationType,
                prompt: concept.prompt
              }
            }))

            // Also add static concepts if available
            if (data.staticAdConcepts) {
              const staticAds = data.staticAdConcepts.map((concept: any) => ({
                type: '1click-image-ad',
                content: `## ${concept.concept} Static Advertisement

**Concept**: ${concept.concept}

**Prompt Specification**:
${concept.prompt}

**Generated Image**: ${concept.imageBase64 ? 'Available' : 'Generation in progress...'}

**Platform**: ${concept.metadata?.platform || platform}
**Style**: ${concept.metadata?.style || adStyle}
**Focus**: ${concept.metadata?.focus || 'Professional advertising'}`,
                metadata: {
                  platform: concept.metadata?.platform || platform,
                  style: concept.metadata?.style || adStyle,
                  concept: concept.concept,
                  imageBase64: concept.imageBase64,
                  prompt: concept.prompt
                }
              }))
              transformedAds = [...transformedAds, ...staticAds]
            }
          }
          // Handle image generation response
          else if (data.adConcepts) {
            transformedAds = data.adConcepts.map((concept: any) => ({
              type: '1click-image-ad',
              content: `## ${concept.concept} Advertisement

**Concept**: ${concept.concept}

**Prompt Specification**:
${concept.prompt}

**Generated Image**: ${concept.imageBase64 ? 'Available' : 'Generation in progress...'}

**Platform**: ${concept.metadata?.platform || platform}
**Style**: ${concept.metadata?.style || adStyle}
**Focus**: ${concept.metadata?.focus || 'Professional advertising'}`,
              metadata: {
                platform: concept.metadata?.platform || platform,
                style: concept.metadata?.style || adStyle,
                concept: concept.concept,
                imageBase64: concept.imageBase64,
                prompt: concept.prompt
              }
            }))
          }

          if (transformedAds.length > 0) {
            setGeneratedAds([...transformedAds, ...generatedAds.slice(0, 1)])
            const adType = selectedAdType === 'video-generation' ? 'Video Ads' : 'Image Ads'
            toast({
              title: `${adType} Generated`,
              description: `Generated ${transformedAds.length} professional ad concepts with Fal.ai.`,
              variant: "success"
            })
          }
        }
      } else {
        // Use existing ads-generate endpoint for other types
        const response = await fetch('/api/ads-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: selectedProduct,
            productData: selectedProductData, // Include product data as fallback
            adType: selectedAdType,
            targetAudience,
            adStyle,
            platform,
            customPrompt,
            newsContext: newsData.slice(0, 3),
            marketingHooks
          })
        })

        const data = await response.json()
        if (data.success) {
          setGeneratedAds([data.ad, ...generatedAds.slice(0, 4)])
        }
      }
    } catch (error) {
      console.error('Failed to generate ad:', error)
      toast({
        title: "Ad Generation Failed",
        description: "Could not generate advertisement. Please try again.",
        variant: "destructive"
      })
    }
    setIsGenerating(false)
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI-Powered Ads Intelligence</h1>
            <p className="text-slate-600 mt-1">Advanced analytics, content generation, and creative insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Content Gen
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Ads Studio
            </TabsTrigger>
          </TabsList>

          {/* Analytics Dashboard Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData && (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Total Impressions</p>
                          <p className="text-2xl font-bold">{analyticsData.overview.totalImpressions.toLocaleString()}</p>
                        </div>
                        <Eye className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Total Clicks</p>
                          <p className="text-2xl font-bold">{analyticsData.overview.totalClicks.toLocaleString()}</p>
                        </div>
                        <Target className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Avg CTR</p>
                          <p className="text-2xl font-bold">{analyticsData.overview.averageCTR}%</p>
                        </div>
                        <Activity className="w-8 h-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">ROAS</p>
                          <p className="text-2xl font-bold">{analyticsData.overview.averageROAS}x</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Click-through rates and conversions over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData && (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData.timeline}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="ctr" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="roas" stroke="#82ca9d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* News Feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5" />
                    Latest Marketing News
                  </CardTitle>
                  <CardDescription>Real-time insights and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {newsData.map((article, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                          <h4 className="font-semibold text-sm">{article.title}</h4>
                          <p className="text-xs text-slate-600 mt-1">{article.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex gap-1">
                              {article.marketingHooks.slice(0, 2).map((hook, hookIndex) => (
                                <Badge key={hookIndex} variant="secondary" className="text-xs">
                                  {hook}
                                </Badge>
                              ))}
                            </div>
                            <Badge
                              variant={article.sentiment === 'positive' ? 'default' : article.sentiment === 'negative' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {article.sentiment}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Ads */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Ads</CardTitle>
                <CardDescription>Best performing campaigns based on ROAS and CTR</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData && (
                  <div className="space-y-4">
                    {analyticsData.topPerformingAds.map((ad, index) => (
                      <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{ad.title}</h4>
                            <p className="text-sm text-slate-600">
                              {ad.impressions.toLocaleString()} impressions • {ad.clicks.toLocaleString()} clicks
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{ad.roas}x ROAS</div>
                          <div className="text-sm text-slate-600">{ad.ctr}% CTR</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Generator Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Content Generator
                  </CardTitle>
                  <CardDescription>Generate marketing content based on latest trends</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => generateContent('ad-copy', 'Create compelling ad copy for a new marketing automation tool')}
                      disabled={isGenerating}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <MessageSquare className="w-6 h-6" />
                      <span className="text-sm">Ad Copy</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => generateContent('social-post', 'Create engaging social media posts about AI marketing trends')}
                      disabled={isGenerating}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <Share2 className="w-6 h-6" />
                      <span className="text-sm">Social Posts</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => generateContent('campaign-strategy', 'Develop a comprehensive marketing campaign strategy')}
                      disabled={isGenerating}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <Target className="w-6 h-6" />
                      <span className="text-sm">Campaign Strategy</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => generateContent('visual-description', 'Create visual concepts for marketing materials')}
                      disabled={isGenerating}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-sm">Visual Concepts</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Prompt</label>
                    <Textarea
                      placeholder="Enter your custom prompt for AI content generation..."
                      className="min-h-[100px]"
                    />
                    <Button className="w-full" disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Custom Content
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated Content</CardTitle>
                  <CardDescription>AI-generated content based on latest trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedContent ? (
                    <div className="space-y-4">
                      <ScrollArea className="h-[400px] w-full border rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] border rounded-lg flex items-center justify-center text-slate-500">
                      <div className="text-center">
                        <Brain className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p>Generated content will appear here</p>
                        <p className="text-sm mt-1">Select a generation type to get started</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Market Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Current Market Hooks & Trends
                </CardTitle>
                <CardDescription>Latest trending keywords and hooks for content generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">Growing Trends</h4>
                    <div className="flex flex-wrap gap-2">
                      {['AI Marketing', 'Automation', 'Personalization', 'ROI Optimization'].map((trend, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800">
                          {trend}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">Active Hooks</h4>
                    <div className="flex flex-wrap gap-2">
                      {newsData.flatMap(article => article.marketingHooks).slice(0, 8).map((hook, index) => (
                        <Badge key={index} variant="secondary">
                          {hook}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-orange-600">Emerging Channels</h4>
                    <div className="flex flex-wrap gap-2">
                      {['TikTok Ads', 'Pinterest Shopping', 'Snapchat AR', 'LinkedIn Video'].map((channel, index) => (
                        <Badge key={index} className="bg-orange-100 text-orange-800">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Studio Tab */}
          <TabsContent value="ads" className="space-y-6">
            {/* Product Management Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Product Management
                </CardTitle>
                <CardDescription>Add products from Amazon URLs or select existing products</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Paste Amazon product URL here..."
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={addProductFromUrl}
                    disabled={isLoadingProduct || !productUrl.trim()}
                  >
                    {isLoadingProduct ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Product</label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product for ads generation" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          <div className="flex items-center gap-3">
                            {product.images[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-8 h-8 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium truncate max-w-[200px]">{product.title}</div>
                              <div className="text-xs text-slate-500">{product.category}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct && products.find(p => p._id === selectedProduct) && (
                  <div className="p-4 border rounded-lg bg-slate-50">
                    <div className="flex gap-4">
                      {products.find(p => p._id === selectedProduct)?.images[0] && (
                        <img
                          src={products.find(p => p._id === selectedProduct)?.images[0]}
                          alt="Product"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{products.find(p => p._id === selectedProduct)?.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {products.find(p => p._id === selectedProduct)?.description?.slice(0, 100)}...
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{products.find(p => p._id === selectedProduct)?.category}</Badge>
                          {products.find(p => p._id === selectedProduct)?.brand && (
                            <Badge variant="outline">{products.find(p => p._id === selectedProduct)?.brand}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ads Generator Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Ads Generator
                </CardTitle>
                <CardDescription>Generate professional ads using Fal.ai with real image generation ✨</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Ad Type</label>
                    <Select value={selectedAdType} onValueChange={setSelectedAdType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image-generation">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            1Click Image Ads (AI Generated) ✨
                          </div>
                        </SelectItem>
                        <SelectItem value="video-generation">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Video Ads (Fal.ai + Veo 3) 🎬
                          </div>
                        </SelectItem>
                        <SelectItem value="image-description">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Image Ad Description
                          </div>
                        </SelectItem>
                        <SelectItem value="video-script">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Video Ad Script
                          </div>
                        </SelectItem>
                        <SelectItem value="social-media">
                          <div className="flex items-center gap-2">
                            <Grid className="w-4 h-4" />
                            Social Media Ads
                          </div>
                        </SelectItem>
                        <SelectItem value="banner-ad">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Banner Ads
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Target Audience</label>
                    <Input
                      placeholder="e.g., Tech-savvy millennials, Business owners"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Ad Style</label>
                      <Select value={adStyle} onValueChange={setAdStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern & Sleek</SelectItem>
                          <SelectItem value="playful">Playful & Fun</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="minimalist">Minimalist</SelectItem>
                          <SelectItem value="bold">Bold & Dramatic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Platform</label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="google">Google Ads</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Custom Instructions (Optional)</label>
                    <Textarea
                      placeholder="Any specific requirements or creative direction..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={generateAdvancedAd}
                    disabled={isGenerating || !selectedProduct}
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating Real Images with Fal.ai...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Professional Ad {selectedAdType === 'image-generation' ? '🎨' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Products Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>Manage your product catalog for ads generation</CardDescription>
              </CardHeader>
              <CardContent>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className={`group relative border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedProduct === product._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedProduct(product._id)}
                      >
                        <div className="flex gap-3">
                          {product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{product.title}</h4>
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                              {product.brand && (
                                <Badge variant="outline" className="text-xs">{product.brand}</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {selectedProduct === product._id && (
                          <div className="absolute -top-2 -right-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">No products yet</p>
                    <p className="text-sm text-slate-400 mt-1">Add your first product using an Amazon URL</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Ads Display - Below Products */}
            {generatedAds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generated Advertisement Creatives
                  </CardTitle>
                  <CardDescription>AI-powered professional advertisements ready for use</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generatedAds.map((ad, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        {/* Enhanced display for video ads */}
                        {ad.type === 'video-ad' ? (
                          <div className="space-y-0">
                            {/* Video Display */}
                            {ad.metadata?.videoUrl && (
                              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative">
                                {ad.metadata.videoUrl.startsWith('http') ? (
                                  <video
                                    src={ad.metadata.videoUrl}
                                    controls
                                    className="w-full h-full object-cover rounded-t-lg"
                                    poster={ad.metadata.staticImage}
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                                    <Video className="w-16 h-16 mb-3 text-purple-400 animate-pulse" />
                                    <h3 className="text-lg font-semibold text-slate-700">{ad.metadata.concept} Video</h3>
                                    <p className="text-sm text-center max-w-[250px]">AI-Generated Video Advertisement</p>
                                    <div className="mt-3 flex gap-2">
                                      <Badge variant="outline" className="text-xs">{ad.metadata.platform}</Badge>
                                      <Badge variant="outline" className="text-xs">{ad.metadata.animationType}</Badge>
                                    </div>
                                  </div>
                                )}

                                {/* Video overlay info */}
                                <div className="absolute top-3 left-3">
                                  <Badge className="bg-purple-600/90 text-white text-xs">
                                    🎬 {ad.metadata.concept}
                                  </Badge>
                                </div>
                                <div className="absolute top-3 right-3">
                                  <Badge className="bg-black/70 text-white text-xs">
                                    Veo 3 Video
                                  </Badge>
                                </div>
                              </div>
                            )}

                            {/* Video Ad Details */}
                            <div className="p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-lg flex items-center gap-2">
                                  <Video className="w-5 h-5 text-purple-600" />
                                  {ad.metadata?.concept} Video Ad
                                </h4>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline">
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Share2 className="w-4 h-4 mr-1" />
                                    Share
                                  </Button>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">{ad.metadata?.platform}</Badge>
                                <Badge variant="outline">{ad.metadata?.animationType}</Badge>
                                <Badge className="bg-purple-100 text-purple-800">Video Generation</Badge>
                                <Badge variant="secondary">8s • 720p</Badge>
                              </div>

                              {/* Animation Prompt Preview */}
                              <div>
                                <h5 className="text-sm font-medium text-slate-700 mb-2">Animation Description</h5>
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded border max-h-32 overflow-y-auto">
                                  <p className="text-xs text-slate-700">
                                    {ad.metadata?.animationPrompt?.substring(0, 200) + '...' || 'Video animation generated with Veo 3'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : ad.type === '1click-image-ad' ? (
                          <div className="space-y-0">
                            {/* Image Display */}
                            {ad.metadata?.imageBase64 && (
                              <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 relative">
                                {ad.metadata.imageBase64.startsWith('data:image') ? (
                                  <img
                                    src={ad.metadata.imageBase64}
                                    alt={`${ad.metadata.concept} Advertisement`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.log('Image load error for:', ad.metadata.concept)
                                      e.currentTarget.style.display = 'none'
                                      e.currentTarget.nextElementSibling.style.display = 'flex'
                                    }}
                                  />
                                ) : null}
                                {/* Fallback display */}
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500" style={{display: ad.metadata.imageBase64?.startsWith('data:image') ? 'none' : 'flex'}}>
                                  <Sparkles className="w-12 h-12 mb-3 text-blue-400 animate-pulse" />
                                  <h3 className="text-lg font-semibold text-slate-700">{ad.metadata.concept}</h3>
                                  <p className="text-sm text-center max-w-[200px]">AI-Generated Advertisement</p>
                                  <div className="mt-3 flex gap-2">
                                    <Badge variant="outline" className="text-xs">{ad.metadata.platform}</Badge>
                                    <Badge variant="outline" className="text-xs">{ad.metadata.style}</Badge>
                                  </div>
                                </div>

                                {/* Overlay info */}
                                <div className="absolute top-3 left-3">
                                  <Badge className="bg-black/70 text-white text-xs">
                                    {ad.metadata.concept}
                                  </Badge>
                                </div>
                                <div className="absolute top-3 right-3">
                                  <Badge variant="secondary" className="text-xs">
                                    AI Generated
                                  </Badge>
                                </div>
                              </div>
                            )}

                            {/* Ad Details */}
                            <div className="p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-lg">{ad.metadata?.concept} Advertisement</h4>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline">
                                    <Download className="w-4 h-4 mr-1" />
                                    Export
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Share2 className="w-4 h-4 mr-1" />
                                    Share
                                  </Button>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">{ad.metadata?.platform}</Badge>
                                <Badge variant="outline">{ad.metadata?.style}</Badge>
                                <Badge variant="secondary">
                                  {ad.metadata?.generatedAt ? new Date(ad.metadata.generatedAt).toLocaleTimeString() : 'Just now'}
                                </Badge>
                              </div>

                              {/* Prompt Preview */}
                              <div>
                                <h5 className="text-sm font-medium text-slate-700 mb-2">Ad Specification</h5>
                                <div className="bg-slate-50 p-3 rounded border max-h-32 overflow-y-auto">
                                  <pre className="whitespace-pre-wrap text-xs text-slate-600">
                                    {ad.metadata?.prompt ?
                                      JSON.stringify(JSON.parse(ad.metadata.prompt), null, 2).substring(0, 300) + '...'
                                      : ad.content.substring(0, 300) + '...'}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Regular ad display */
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="default" className="text-xs">
                                {ad.type.replace('-', ' ').toUpperCase()}
                              </Badge>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4 mr-2" />
                                  Export
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </Button>
                              </div>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap text-sm bg-slate-50 p-3 rounded max-h-64 overflow-y-auto">
                                {ad.content}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Product Preview Modal - 1Click Workflow */}
        <ProductPreviewModal
          isOpen={showProductModal}
          onClose={handleCloseModal}
          productData={previewProductData}
          isLoading={isPreviewLoading}
          onSave={handleSaveProduct}
          isSaving={isSavingProduct}
        />

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </div>
  )
}