import mongoose, { Document, Model, Schema } from "mongoose";

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Product image URL is required"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds updatedTs in case it's needed later
  }
);

ProductSchema.pre("validate", function () {
  if (!this.slug || !this.slug.trim()) {
    this.slug = toSlug(this.name)
  } else {
    this.slug = toSlug(this.slug)
  }
})

// Fallback to existing model to avoid 'OverwriteModelError' during Next.js reloads
const Product: Model<IProduct> =
  mongoose.models?.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
