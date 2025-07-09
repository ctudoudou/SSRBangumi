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