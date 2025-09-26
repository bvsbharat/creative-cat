"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductSpecsTableProps {
  specifications: Record<string, string>
  features: string[]
  targetAudience: string[]
  keywords: string[]
}

export default function ProductSpecsTable({
  specifications,
  features,
  targetAudience,
  keywords
}: ProductSpecsTableProps) {
  const hasSpecs = Object.keys(specifications).length > 0
  const hasFeatures = features.length > 0
  const hasAudience = targetAudience.length > 0
  const hasKeywords = keywords.length > 0

  if (!hasSpecs && !hasFeatures && !hasAudience && !hasKeywords) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No additional product details available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Features */}
      {hasFeatures && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Features</CardTitle>
            <CardDescription>Product highlights and benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Specifications */}
      {hasSpecs && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Technical Specifications</CardTitle>
            <CardDescription>Detailed product specifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(specifications).map(([key, value], index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium text-sm text-gray-700">{key}</span>
                  <span className="text-sm text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target Audience */}
        {hasAudience && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Target Audience</CardTitle>
              <CardDescription>Ideal customer segments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {targetAudience.map((audience, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {audience}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Keywords */}
        {hasKeywords && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Marketing Keywords</CardTitle>
              <CardDescription>SEO and marketing terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {keywords.slice(0, 10).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
                {keywords.length > 10 && (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    +{keywords.length - 10} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}