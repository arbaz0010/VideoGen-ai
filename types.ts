
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum PlanType {
  FREE = 'Free',
  PLUS = 'Plus',
  PRO = 'Pro',
  ENTERPRISE = 'Enterprise'
}

export enum VideoStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: PlanType;
  credits: number;
  avatarUrl?: string;
  lastActive?: Date;
  status: 'active' | 'banned';
  joinedAt: Date;
}

export interface Video {
  id: string;
  userId: string;
  prompt: string;
  url?: string;
  thumbnailUrl?: string;
  status: VideoStatus;
  createdAt: Date;
  duration: number; // in seconds
  aspectRatio: string;
  model: string;
  size?: string;
  errorMessage?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  link?: string;
}

export interface PricingPlan {
  id: string;
  name: PlanType;
  price: number;
  priceYearly: number;
  credits: number | 'Unlimited';
  features: string[];
  maxDuration: number;
  quality: string;
  paddlePriceId?: string;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  status: 'active' | 'disabled';
  usageCount: number;
}

export interface AnalyticsData {
  date: string;
  generated: number;
  views: number;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  gemini: {
    apiKey: string;
  };
  featureFlags: {
    videoGeneration: boolean;
    newSignups: boolean;
    apiAccess: boolean;
  };
  limits: {
    freeMaxDuration: number;
    proMaxDuration: number; // MB
    freeStorage: number; // MB
    proStorage: number; // MB
  };
  watermark: {
    enabled: boolean;
    type: 'text' | 'image';
    text: string;
    imageUrl?: string;
  };
  mailgun: {
    enabled: boolean;
    apiKey: string;
    domain: string;
    fromEmail: string;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface KBArticle {
  id: string;
  title: string;
  category: string;
  views: number;
  status: 'published' | 'draft';
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target?: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success';
}