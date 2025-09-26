"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, X, Edit3 } from "lucide-react"
import ProductImageGallery from "./ProductImageGallery"
import ProductSpecsTable from "./ProductSpecsTable"
import { ScrapedProductData } from "@/lib/utils/productScraper"
import { IProduct } from "@/lib/models/Product"

interface ProductPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  productData: ScrapedProductData | null
  isLoading: boolean
  onSave: (productData: ScrapedProductData) => Promise<void>
  isSaving: boolean
}

export default function ProductPreviewModal({
  isOpen,
  onClose,
  productData,
  isLoading,
  onSave,
  isSaving
}: ProductPreviewModalProps) {
  const [editMode, setEditMode] = useState(false)
  const [editedProduct, setEditedProduct] = useState<ScrapedProductData | null>(null)

  const handleEdit = () => {
    setEditedProduct(productData)
    setEditMode(true)
  }

  const handleCancelEdit = () => {
    setEditedProduct(null)
    setEditMode(false)
  }

  const handleSave = async () => {
    if (editedProduct) {
      await onSave(editedProduct)
    } else if (productData) {
      await onSave(productData)
    }
  }

  const updateEditedProduct = (field: keyof ScrapedProductData, value: any) => {
    if (editedProduct) {
      setEditedProduct({
        ...editedProduct,
        [field]: value
      })
    }
  }

  const currentProduct = editedProduct || productData

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Fetching Product</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
              <div className="space-y-2">
                <p className="text-lg font-semibold">Fetching Product Details</p>
                <p className="text-sm text-gray-500">
                  Using Apify API to extract comprehensive product information...
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!currentProduct) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {editMode ? 'Edit Product Details' : 'Product Preview'}
            </DialogTitle>
            <div className="flex gap-2">
              {!editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Images */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ProductImageGallery
                images={currentProduct.images}
                productTitle={currentProduct.title}
              />
            </div>

            {/* Basic Product Info */}
            <div className="space-y-4">
              {editMode ? (
                <>
                  <div>
                    <Label htmlFor="title">Product Title</Label>
                    <Input
                      id="title"
                      value={currentProduct.title}
                      onChange={(e) => updateEditedProduct('title', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={currentProduct.description}
                      onChange={(e) => updateEditedProduct('description', e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={currentProduct.price || ''}
                        onChange={(e) => updateEditedProduct('price', parseFloat(e.target.value) || undefined)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        value={currentProduct.currency || 'USD'}
                        onChange={(e) => updateEditedProduct('currency', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={currentProduct.brand || ''}
                        onChange={(e) => updateEditedProduct('brand', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={currentProduct.category}
                        onChange={(e) => updateEditedProduct('category', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                      {currentProduct.title}
                    </h2>
                  </div>

                  {currentProduct.price && (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-green-600">
                        ${currentProduct.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        {currentProduct.currency}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {currentProduct.brand && (
                      <Badge variant="secondary">
                        Brand: {currentProduct.brand}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {currentProduct.category}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {currentProduct.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Specifications and Details */}
          {!editMode && (
            <ProductSpecsTable
              specifications={currentProduct.specifications}
              features={currentProduct.features}
              targetAudience={currentProduct.targetAudience}
              keywords={currentProduct.keywords}
            />
          )}

          {/* Edit Mode Additional Fields */}
          {editMode && (
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label>Features (one per line)</Label>
                <Textarea
                  value={currentProduct.features.join('\n')}
                  onChange={(e) => updateEditedProduct('features', e.target.value.split('\n').filter(f => f.trim()))}
                  rows={6}
                  className="mt-1"
                  placeholder="Enter product features, one per line"
                />
              </div>

              <div>
                <Label>Target Audience (comma-separated)</Label>
                <Input
                  value={currentProduct.targetAudience.join(', ')}
                  onChange={(e) => updateEditedProduct('targetAudience', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  className="mt-1"
                  placeholder="e.g., Tech Enthusiasts, Business Professionals"
                />
              </div>

              <div>
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={currentProduct.keywords.join(', ')}
                  onChange={(e) => updateEditedProduct('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                  className="mt-1"
                  placeholder="e.g., wireless, bluetooth, premium"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Product
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save to Database
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}