export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;          // ← ADDED for discount display
  category: string;
  images: string[];
  darazLink: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  name: string;
  avatar?: string;
  rating: number;
  text: string;
  platform: string;
  isActive: boolean;
  createdAt: string;
}

export interface CmsPage {
  [key: string]: unknown;
}

export interface StatItem {
  label: string;
  value: string;
}