import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Video, UserRole, PlanType, VideoStatus, SystemConfig, PricingPlan, EmailTemplate, KBArticle, CreditPack, PromoCode, ActivityLog, Notification } from '../types';
import { PLANS } from '../constants';
import { EmailService } from '../services/emailService';

// Mock Initial Data (Fallbacks)
const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Creator',
    email: 'alex@example.com',
    role: UserRole.USER,
    plan: PlanType.PRO,
    credits: 140,
    avatarUrl: 'https://picsum.photos/seed/u1/200',
    lastActive: new Date(),
    status: 'active',
    joinedAt: new Date('2024-01-15')
  },
  {
    id: 'u2',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    role: UserRole.USER,
    plan: PlanType.FREE,
    credits: 10,
    avatarUrl: 'https://picsum.photos/seed/u2/200',
    lastActive: new Date(Date.now() - 86400000), // Yesterday
    status: 'active',
    joinedAt: new Date('2024-03-10')
  },
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'arbazb3yg@gmail.com',
    role: UserRole.ADMIN,
    plan: PlanType.ENTERPRISE,
    credits: 9999,
    avatarUrl: 'https://picsum.photos/seed/admin/200',
    lastActive: new Date(),
    status: 'active',
    joinedAt: new Date('2023-11-01')
  }
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: 'l1', userId: 'u1', userName: 'Alex Creator', action: 'Video Generated', target: 'Cyberpunk City', timestamp: new Date(Date.now() - 1000 * 60 * 30), type: 'success' },
  { id: 'l2', userId: 'u2', userName: 'Sarah Smith', action: 'Login', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), type: 'info' },
  { id: 'l3', userId: 'u1', userName: 'Alex Creator', action: 'Plan Upgrade', target: 'Pro', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), type: 'success' },
  { id: 'l4', userId: 'u2', userName: 'Sarah Smith', action: 'Failed Generation', target: 'Ocean', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), type: 'error' },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Welcome to VideoGen!', message: 'Start creating your first AI video today.', type: 'info', read: false, createdAt: new Date() },
  { id: 'n2', title: 'Credits Added', message: 'You received 60 free credits for signing up.', type: 'success', read: false, createdAt: new Date(Date.now() - 3600000) },
  { id: 'n3', title: 'New Feature: 4K', message: 'Enterprise users can now generate in 4K resolution.', type: 'info', read: true, createdAt: new Date(Date.now() - 86400000) },
];

const INITIAL_VIDEOS: Video[] = [
  { id: 'v1', userId: 'u1', prompt: 'Cyberpunk City', createdAt: new Date(Date.now() - 7200000), duration: 5, aspectRatio: '16:9', model: 'veo-3.1', status: VideoStatus.COMPLETED, url: '#', size: '2.4 MB' },
  { id: 'v2', userId: 'u1', prompt: 'Ocean Waves', createdAt: new Date(Date.now() - 86400000), duration: 8, aspectRatio: '9:16', model: 'veo-3.1', status: VideoStatus.COMPLETED, url: '#', size: '4.1 MB' }
];

const INITIAL_SYSTEM_CONFIG: SystemConfig = {
  maintenanceMode: false,
  gemini: {
    apiKey: ''
  },
  featureFlags: {
    videoGeneration: true,
    newSignups: true,
    apiAccess: true,
  },
  limits: {
    freeMaxDuration: 5,
    proMaxDuration: 15,
    freeStorage: 500,
    proStorage: 5000,
  },
  watermark: {
    enabled: true,
    type: 'text',
    text: 'Made with VideoGen AI',
    imageUrl: ''
  },
  mailgun: {
    enabled: false,
    apiKey: '',
    domain: '',
    fromEmail: ''
  }
};

const INITIAL_TEMPLATES: EmailTemplate[] = [
  { id: 'welcome', name: 'Welcome Email', subject: 'Welcome to VideoGen AI!', body: 'Hi {name},\n\nWelcome to the future of video generation. We are excited to have you on board.\n\nYou have received 60 free credits to start creating amazing videos.\n\nHappy creating,\nThe VideoGen Team' },
  { id: 'reset', name: 'Password Reset', subject: 'Reset your password', body: 'Click the link below to reset your password...' },
  { id: 'payment_failed', name: 'Payment Failed', subject: 'Action Required: Payment Failed', body: 'We were unable to process your payment...' },
];

const INITIAL_KB: KBArticle[] = [
  { id: '1', title: 'Getting Started with Gemini Veo', category: 'General', views: 1250, status: 'published', updatedAt: new Date() },
  { id: '2', title: 'Troubleshooting Generation Errors', category: 'Support', views: 850, status: 'published', updatedAt: new Date() },
  { id: '3', title: 'API Documentation', category: 'Developers', views: 2100, status: 'draft', updatedAt: new Date() },
];

const INITIAL_CREDIT_PACKS: CreditPack[] = [
  { id: 'pack_50', name: 'Credit Boost', credits: 50, price: 5.00 },
  { id: 'pack_500', name: 'Creator Pack', credits: 500, price: 39.99 },
];

const INITIAL_PROMO_CODES: PromoCode[] = [
  { id: 'promo1', code: 'WELCOME20', discountType: 'percent', discountValue: 20, status: 'active', usageCount: 45 },
  { id: 'promo2', code: 'LAUNCH50', discountType: 'percent', discountValue: 50, status: 'disabled', usageCount: 150 },
];

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  impersonateUser: (userToImpersonate: User) => void;
  deductCredits: (amount: number) => boolean;
  addVideo: (video: Partial<Video>) => void;
  deleteVideo: (videoId: string) => void;
  userVideos: Video[];
  allUsers: User[]; 
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  stats: { totalUsers: number; totalVideos: number; revenue: number };
  
  // Activity Logs
  activityLogs: ActivityLog[];
  addLog: (action: string, type?: ActivityLog['type'], target?: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // System Settings
  systemConfig: SystemConfig;
  updateSystemConfig: (config: Partial<SystemConfig>) => void;
  pricingPlans: PricingPlan[];
  updatePricingPlan: (id: string, data: Partial<PricingPlan>) => void;
  emailTemplates: EmailTemplate[];
  updateEmailTemplate: (id: string, data: Partial<EmailTemplate>) => void;
  kbArticles: KBArticle[];
  addKBArticle: (article: Omit<KBArticle, 'id' | 'views' | 'updatedAt'>) => void;
  
  // New Pricing Configs
  creditPacks: CreditPack[];
  updateCreditPack: (id: string, data: Partial<CreditPack>) => void;
  promoCodes: PromoCode[];
  addPromoCode: (code: Omit<PromoCode, 'id' | 'usageCount'>) => void;
  deletePromoCode: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  
  // System State
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_SYSTEM_CONFIG);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(PLANS);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(INITIAL_TEMPLATES);
  const [kbArticles, setKbArticles] = useState<KBArticle[]>(INITIAL_KB);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>(INITIAL_CREDIT_PACKS);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(INITIAL_PROMO_CODES);

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('videoGen_user');
    const storedUsers = localStorage.getItem('videoGen_allUsers');
    const storedVideos = localStorage.getItem('videoGen_allVideos');
    const storedConfig = localStorage.getItem('videoGen_systemConfig');
    const storedPacks = localStorage.getItem('videoGen_creditPacks');
    const storedPromos = localStorage.getItem('videoGen_promoCodes');
    const storedLogs = localStorage.getItem('videoGen_activityLogs');
    const storedNotes = localStorage.getItem('videoGen_notifications');

    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.lastActive) parsedUser.lastActive = new Date(parsedUser.lastActive);
        if (parsedUser.joinedAt) parsedUser.joinedAt = new Date(parsedUser.joinedAt);
        setUser(parsedUser);
    }
    if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers).map((u: any) => ({
            ...u,
            lastActive: u.lastActive ? new Date(u.lastActive) : undefined,
            joinedAt: u.joinedAt ? new Date(u.joinedAt) : new Date()
        }));
        setUsers(parsedUsers);
    }
    if (storedVideos) {
      const parsedVideos = JSON.parse(storedVideos).map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt)
      }));
      setVideos(parsedVideos);
    }
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      setSystemConfig({
        ...INITIAL_SYSTEM_CONFIG,
        ...parsed,
        watermark: {
          ...INITIAL_SYSTEM_CONFIG.watermark,
          ...(parsed.watermark || {})
        },
        mailgun: {
          ...INITIAL_SYSTEM_CONFIG.mailgun,
          ...(parsed.mailgun || {})
        },
        gemini: {
          ...INITIAL_SYSTEM_CONFIG.gemini,
          ...(parsed.gemini || {})
        }
      });
    }
    if (storedPacks) setCreditPacks(JSON.parse(storedPacks));
    if (storedPromos) setPromoCodes(JSON.parse(storedPromos));
    if (storedLogs) {
      setActivityLogs(JSON.parse(storedLogs).map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) })));
    }
    if (storedNotes) {
      setNotifications(JSON.parse(storedNotes).map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) })));
    }
    
    setIsInitialized(true);
  }, []);

  // Persistence Effects
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('videoGen_allUsers', JSON.stringify(users));
      localStorage.setItem('videoGen_allVideos', JSON.stringify(videos));
      localStorage.setItem('videoGen_systemConfig', JSON.stringify(systemConfig));
      localStorage.setItem('videoGen_creditPacks', JSON.stringify(creditPacks));
      localStorage.setItem('videoGen_promoCodes', JSON.stringify(promoCodes));
      localStorage.setItem('videoGen_activityLogs', JSON.stringify(activityLogs));
      localStorage.setItem('videoGen_notifications', JSON.stringify(notifications));
      
      if (user) localStorage.setItem('videoGen_user', JSON.stringify(user));
      else localStorage.removeItem('videoGen_user');
    }
  }, [users, videos, user, systemConfig, creditPacks, promoCodes, activityLogs, notifications, isInitialized]);

  const addLog = (action: string, type: ActivityLog['type'] = 'info', target?: string) => {
    if (!user) return;
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      action,
      target,
      type,
      timestamp: new Date()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const login = async (email: string, password: string) => {
    const now = new Date();
    if (email === 'arbazb3yg@gmail.com' && password === '12345678') {
      const adminUser = users.find(u => u.email === email) || INITIAL_USERS[2];
      const updatedAdmin = { ...adminUser, lastActive: now };
      
      setUser(updatedAdmin);
      
      // Update admin in users array if exists, else add
      if (users.find(u => u.id === adminUser.id)) {
        setUsers(prev => prev.map(u => u.id === adminUser.id ? updatedAdmin : u));
      } else {
        setUsers(prev => [...prev, updatedAdmin]);
      }
      return true;
    }
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      if (foundUser.status === 'banned') {
        alert("Account is banned.");
        return false;
      }
      const updatedUser = { ...foundUser, lastActive: now };
      setUser(updatedUser);
      setUsers(users.map(u => u.id === foundUser.id ? updatedUser : u));
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string) => {
    if (!systemConfig.featureFlags.newSignups) {
      alert("New signups are currently disabled.");
      return;
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      role: UserRole.USER,
      plan: PlanType.FREE,
      credits: 60, // Default to 60 as requested
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      lastActive: new Date(),
      status: 'active',
      joinedAt: new Date()
    };
    setUsers([...users, newUser]);
    setUser(newUser);
    addLog('User Signup', 'success', name);
    
    // Add Welcome Notification
    setNotifications(prev => [{
      id: `n_${Date.now()}`,
      title: 'Welcome to VideoGen!',
      message: 'Happy creating! Check out the generator to start.',
      type: 'success',
      read: false,
      createdAt: new Date()
    }, ...prev]);

    // Send Welcome Email if Mailgun is enabled
    if (systemConfig.mailgun.enabled) {
       const welcomeTemplate = emailTemplates.find(t => t.id === 'welcome');
       if (welcomeTemplate) {
         const body = welcomeTemplate.body.replace('{name}', name);
         EmailService.sendEmail(systemConfig.mailgun, email, welcomeTemplate.subject, body);
       }
    }
  };

  const logout = () => setUser(null);

  const impersonateUser = (userToImpersonate: User) => {
    setUser(userToImpersonate);
    addLog('Impersonation', 'warning', `Admin impersonated ${userToImpersonate.name}`);
  };

  const deductCredits = (amount: number) => {
    if (!user) return false;
    if (user.role === UserRole.ADMIN || user.plan === PlanType.ENTERPRISE) return true;
    if (user.credits >= amount) {
      const updatedUser = { ...user, credits: user.credits - amount };
      setUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      return true;
    }
    return false;
  };

  const addVideo = (videoData: Partial<Video>) => {
    if (!user) return;
    const newVideo: Video = {
      id: `v${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
      userId: user.id,
      prompt: videoData.prompt || '',
      url: videoData.url,
      thumbnailUrl: videoData.thumbnailUrl,
      status: videoData.status || VideoStatus.PROCESSING,
      createdAt: new Date(),
      duration: videoData.duration || 5,
      aspectRatio: videoData.aspectRatio || '16:9',
      model: 'veo-3.1',
      size: '1080p',
      errorMessage: videoData.errorMessage
    };
    setVideos(prev => [newVideo, ...prev]);
    
    // Log generation
    if (newVideo.status === VideoStatus.FAILED) {
      addLog('Generation Failed', 'error', videoData.prompt?.substring(0, 30));
    } else {
      addLog('Video Generated', 'success', videoData.prompt?.substring(0, 30));
    }
  };

  const deleteVideo = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    addLog('Video Deleted', 'info', videoId);
  };

  const updateUser = (userId: string, data: Partial<User>) => {
    if (user && user.id === userId) setUser({ ...user, ...data });
    setUsers(users.map(u => u.id === userId ? { ...u, ...data } : u));
    addLog('User Updated', 'info', `Updated user ${userId}`);
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    addLog('User Deleted', 'warning', `Deleted user ${userId}`);
  };

  // System Settings Methods
  const updateSystemConfig = (config: Partial<SystemConfig>) => {
    setSystemConfig(prev => ({ ...prev, ...config }));
    addLog('System Config Updated', 'warning');
  };

  const updatePricingPlan = (id: string, data: Partial<PricingPlan>) => {
    setPricingPlans(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const updateEmailTemplate = (id: string, data: Partial<EmailTemplate>) => {
    setEmailTemplates(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const addKBArticle = (article: Omit<KBArticle, 'id' | 'views' | 'updatedAt'>) => {
    const newArticle: KBArticle = {
      id: `kb_${Date.now()}`,
      ...article,
      views: 0,
      updatedAt: new Date()
    };
    setKbArticles([newArticle, ...kbArticles]);
  };

  // Credit Packs & Promo Codes
  const updateCreditPack = (id: string, data: Partial<CreditPack>) => {
    setCreditPacks(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const addPromoCode = (code: Omit<PromoCode, 'id' | 'usageCount'>) => {
    const newCode: PromoCode = {
      id: `promo_${Date.now()}`,
      ...code,
      usageCount: 0
    };
    setPromoCodes([newCode, ...promoCodes]);
  };

  const deletePromoCode = (id: string) => {
    setPromoCodes(prev => prev.filter(c => c.id !== id));
  };

  const userVideos = user?.role === UserRole.ADMIN ? videos : videos.filter(v => v.userId === user?.id);

  const stats = {
    totalUsers: users.length,
    totalVideos: videos.length,
    revenue: users.reduce((acc, curr) => {
      const price = curr.plan === PlanType.PRO ? 29.99 : curr.plan === PlanType.PLUS ? 7.99 : curr.plan === PlanType.ENTERPRISE ? 55 : 0;
      return acc + price;
    }, 0)
  };

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!user, login, signup, logout, impersonateUser, deductCredits,
      addVideo, deleteVideo, userVideos, allUsers: users, updateUser, deleteUser, stats,
      activityLogs, addLog,
      notifications, markNotificationRead, markAllNotificationsRead, clearNotifications,
      systemConfig, updateSystemConfig,
      pricingPlans, updatePricingPlan,
      emailTemplates, updateEmailTemplate,
      kbArticles, addKBArticle,
      creditPacks, updateCreditPack,
      promoCodes, addPromoCode, deletePromoCode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};