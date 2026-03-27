/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface CropPrice {
  id: string;
  name: string;
  cropName: string; // Added for compatibility
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  city: string;
  updatedAt: string;
  history?: { date: string; price: number }[];
}

export interface HarvestEvent {
  id: string;
  cropName: string;
  action: 'planting' | 'harvesting';
  month: number; // 0-11
  description?: string;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: string;
  price: number; // Added
  unit: string; // Added
  status: 'available' | 'low' | 'sold-out';
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption: string;
  userId?: string; // Added
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId?: string; // Added
  userName: string;
  content: string;
  city: string;
  likes: number;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  city: string;
  humidity: number; // Added
  windSpeed: number; // Added
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
  createdAt: string;
}

export interface DiseaseAnalysis {
  id: string;
  imageUrl: string;
  result: string;
  userId: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: 'ekim' | 'gubreleme' | 'sulama' | 'hasat' | 'ekipman' | 'genel';
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: string[]; // Array of user IDs
  commentCount: number;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface WeatherAlert {
  id: string;
  type: 'frost' | 'storm' | 'heat' | 'rain';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  city: string;
  createdAt: string;
  expiresAt: string;
}

export interface HarvestPrediction {
  id: string;
  imageUrl: string;
  cropType: string;
  maturityLevel: string; // e.g., "60% - Hasada 2 hafta var"
  recommendation: string;
  userId: string;
  createdAt: string;
}

export interface SoilAnalysis {
  id: string;
  reportUrl: string;
  analysisResult: string;
  userId: string;
  createdAt: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // e.g., "ton"
  imageUrl: string;
  category: 'sebze' | 'meyve' | 'bakliyat' | 'diger';
  isAvailable: boolean;
  userId: string;
  userName: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface EquipmentListing {
  id: string;
  type: 'equipment' | 'labor';
  title: string;
  description: string;
  price: number;
  unit: string;
  imageUrl?: string;
  contactPhone: string;
  userId: string;
  userName: string;
  createdAt: string;
  isAvailable: boolean;
}

export interface CustomerReview {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  targetUserId?: string; // Added to support seller reviews
  rating: number;
  comment: string;
  imageUrl?: string;
  productId?: string;
  createdAt: string;
}

export interface IrrigationPlan {
  id: string;
  userId: string;
  cropType: string;
  fieldSize: number;
  soilType: string;
  plan: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  role: 'farmer' | 'trader' | 'admin';
  reliabilityScore: number;
  totalSales: number;
  locationName?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  category: 'policy' | 'weather' | 'market' | 'general';
  imageUrl?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  category: 'mazot' | 'gubre' | 'ilac' | 'iscilik' | 'diger';
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface CropCycle {
  id: string;
  userId: string;
  cropName: string;
  plantingDate: string;
  status: 'growing' | 'harvested' | 'failed';
  notes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}
