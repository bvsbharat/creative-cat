import { NextRequest, NextResponse } from 'next/server';

// Mock analytics data - in production, this would connect to real analytics services
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('range') || '7d';
    const metric = searchParams.get('metric') || 'all';

    const analyticsData = generateMockAnalytics(timeRange, metric);

    return NextResponse.json({
      success: true,
      data: analyticsData,
      timeRange,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    // In production, this would store the event in your analytics database
    console.log('Analytics Event:', event, data);

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Analytics Tracking Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to track event'
    }, { status: 500 });
  }
}

function generateMockAnalytics(timeRange: string, metric: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const data = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      impressions: Math.floor(Math.random() * 10000) + 5000,
      clicks: Math.floor(Math.random() * 500) + 100,
      conversions: Math.floor(Math.random() * 50) + 10,
      ctr: parseFloat((Math.random() * 3 + 1).toFixed(2)),
      cpc: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
      roas: parseFloat((Math.random() * 3 + 2).toFixed(2)),
      spend: Math.floor(Math.random() * 1000) + 500
    });
  }

  return {
    overview: {
      totalImpressions: data.reduce((sum, d) => sum + d.impressions, 0),
      totalClicks: data.reduce((sum, d) => sum + d.clicks, 0),
      totalConversions: data.reduce((sum, d) => sum + d.conversions, 0),
      averageCTR: parseFloat((data.reduce((sum, d) => sum + d.ctr, 0) / data.length).toFixed(2)),
      averageCPC: parseFloat((data.reduce((sum, d) => sum + d.cpc, 0) / data.length).toFixed(2)),
      averageROAS: parseFloat((data.reduce((sum, d) => sum + d.roas, 0) / data.length).toFixed(2)),
      totalSpend: data.reduce((sum, d) => sum + d.spend, 0)
    },
    timeline: data,
    topPerformingAds: [
      {
        id: '1',
        title: 'Revolutionary AI Marketing Tool',
        impressions: 45000,
        clicks: 2250,
        conversions: 180,
        ctr: 5.0,
        roas: 4.5
      },
      {
        id: '2',
        title: 'Exclusive Marketing Automation',
        impressions: 38000,
        clicks: 1900,
        conversions: 152,
        ctr: 4.8,
        roas: 4.2
      },
      {
        id: '3',
        title: 'Trending Social Media Strategy',
        impressions: 42000,
        clicks: 2100,
        conversions: 168,
        ctr: 4.9,
        roas: 4.3
      }
    ],
    audienceInsights: {
      demographics: [
        { age: '18-24', percentage: 15 },
        { age: '25-34', percentage: 35 },
        { age: '35-44', percentage: 28 },
        { age: '45-54', percentage: 15 },
        { age: '55+', percentage: 7 }
      ],
      interests: [
        { category: 'Marketing', percentage: 45 },
        { category: 'Technology', percentage: 32 },
        { category: 'Business', percentage: 28 },
        { category: 'Social Media', percentage: 25 },
        { category: 'Analytics', percentage: 18 }
      ],
      platforms: [
        { platform: 'Google Ads', spend: 45, performance: 4.2 },
        { platform: 'Facebook Ads', spend: 30, performance: 3.8 },
        { platform: 'LinkedIn Ads', spend: 15, performance: 4.5 },
        { platform: 'Twitter Ads', spend: 10, performance: 3.5 }
      ]
    },
    marketTrends: {
      growingKeywords: ['AI marketing', 'automation', 'personalization', 'ROI optimization'],
      decliningKeywords: ['traditional advertising', 'mass marketing', 'one-size-fits-all'],
      emergingChannels: ['TikTok Ads', 'Pinterest Shopping', 'Snapchat AR'],
      seasonalTrends: [
        { month: 'Jan', trend: 'New Year campaigns' },
        { month: 'Feb', trend: 'Valentine\'s promotions' },
        { month: 'Mar', trend: 'Spring launches' },
        { month: 'Apr', trend: 'Easter marketing' }
      ]
    }
  };
}