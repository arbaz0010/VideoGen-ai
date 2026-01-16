
import { PlanType, PricingPlan } from './types';
import { LayoutDashboard, Video, PlusSquare, BarChart2, CreditCard, Settings, Users, HelpCircle } from 'lucide-react';

export const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: PlanType.FREE,
    price: 0,
    priceYearly: 0,
    credits: 3,
    features: [
      'Max 5 second videos',
      '480p quality only',
      'Watermarked videos',
      'Basic styles (3 options)',
      'Videos expire after 7 days',
      '1 concurrent generation',
      'Community support'
    ],
    maxDuration: 5,
    quality: '480p'
  },
  {
    id: 'plus',
    name: PlanType.PLUS,
    price: 7.99,
    priceYearly: 81.50,
    credits: 75,
    features: [
      'Max 8 second videos',
      '720p quality',
      'No watermarks',
      'All styles (20+ options)',
      'Videos kept for 1 month',
      '3 concurrent generations',
      'Batch generation (up to 5)',
      'Priority queue'
    ],
    maxDuration: 8,
    quality: '720p',
    paddlePriceId: 'pri_plus_monthly_123'
  },
  {
    id: 'pro',
    name: PlanType.PRO,
    price: 29.99,
    priceYearly: 306.00,
    credits: 250,
    features: [
      'Max 15 second videos',
      '1080p quality',
      'No watermarks',
      'Custom branding',
      'Videos kept for 1 year',
      '7 concurrent generations',
      'Batch generation (up to 10)',
      'Email support'
    ],
    maxDuration: 15,
    quality: '1080p',
    paddlePriceId: 'pri_pro_monthly_456'
  },
  {
    id: 'ent',
    name: PlanType.ENTERPRISE,
    price: 55.00,
    priceYearly: 560.00,
    credits: 'Unlimited',
    features: [
      'Max 30 second videos',
      '4K quality',
      'Custom styles & Models',
      'Videos kept permanently',
      'Unlimited concurrent',
      'Team collaboration (10 users)',
      'API Access & Webhooks',
      '24/7 Priority Support'
    ],
    maxDuration: 30,
    quality: '4K',
    paddlePriceId: 'pri_ent_monthly_789'
  }
];

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Videos', path: '/videos', icon: Video },
  { label: 'Create New', path: '/generate', icon: PlusSquare },
  { label: 'Analytics', path: '/analytics', icon: BarChart2 },
  { label: 'Billing', path: '/billing', icon: CreditCard },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const MOCK_ANALYTICS = [
  { date: 'Mon', generated: 4, views: 120 },
  { date: 'Tue', generated: 7, views: 240 },
  { date: 'Wed', generated: 3, views: 90 },
  { date: 'Thu', generated: 12, views: 450 },
  { date: 'Fri', generated: 8, views: 300 },
  { date: 'Sat', generated: 15, views: 600 },
  { date: 'Sun', generated: 10, views: 380 },
];
