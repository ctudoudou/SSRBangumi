// 设置页面相关的类型定义

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface RssFeed {
  id: string;
  name: string;
  url: string;
  description?: string;
  isActive: boolean;
  updateFreq: number;
  lastChecked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RssItem {
  id: string;
  title: string;
  description?: string;
  link: string;
  pubDate?: string;
  processed: boolean;
  rssFeed: {
    name: string;
    userId: string;
  };
  createdAt: string;
}

export interface DownloadConfig {
  aria2RpcUrl: string;
  aria2RpcSecret: string;
  downloadPath: string;
}

export interface AiConfig {
  openrouterApiKey: string;
  openrouterProxyUrl: string;
  openrouterModel: string;
  enableSmartRecognition: boolean;
}

export interface TestResult {
  success: boolean;
  message: string;
  details?: string;
}

export type MenuTab = 'rss' | 'download' | 'ai';

export type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

// Theme Configuration Types
export interface ThemeConfig {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'anime' | 'custom';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    border: string;
  };
  isDefault?: boolean;
  isCustom?: boolean;
}

export interface StyleConfig {
  currentTheme: string;
  customThemes: ThemeConfig[];
  enableAnimations: boolean;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
}