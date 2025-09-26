import mongoose from 'mongoose'

export interface IProduct {
  _id?: string
  title: string
  description: string
  price?: number
  currency?: string
  images: string[]
  category: string
  brand?: string
  features: string[]
  specifications?: Record<string, string>
  targetAudience?: string[]
  keywords?: string[]
  amazonUrl?: string
  scrapedData?: Record<string, any>
  createdAt?: Date
  updatedAt?: Date
}

const ProductSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  specifications: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  targetAudience: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  amazonUrl: {
    type: String,
    unique: true,
    sparse: true
  },
  scrapedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
})

// Create indexes for better query performance
ProductSchema.index({ title: 'text', description: 'text', features: 'text' })
ProductSchema.index({ category: 1 })
ProductSchema.index({ brand: 1 })
// Index already defined in schema field options

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)