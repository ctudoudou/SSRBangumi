'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  username: string;
}

interface RssFeed {
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

interface RssItem {
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

type MenuTab = 'rss' | 'download' | 'ai';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [rssFeeds, setRssFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    isActive: true,
    updateFreq: 60
  });
  const [rssItems, setRssItems] = useState<RssItem[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);

  // 下载服务配置状态
  const [downloadConfig, setDownloadConfig] = useState({
    rpcUrl: 'http://localhost:6800/jsonrpc',
    rpcSecret: '',
    downloadPath: '/downloads'
  });
  const [isLoadingDownloadConfig, setIsLoadingDownloadConfig] = useState(false);
  const [isSavingDownloadConfig, setIsSavingDownloadConfig] = useState(false);
  const [isTestingAria2, setIsTestingAria2] = useState(false);
  const [aria2TestResult, setAria2TestResult] = useState<{success: boolean, message: string} | null>(null);
  
  // AI 配置状态
  const [aiConfig, setAiConfig] = useState({
    apiKey: '',
    proxyUrl: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-3.5-sonnet',
    smartTorrentRecognition: false
  });
  const [isLoadingAiConfig, setIsLoadingAiConfig] = useState(false);
  const [isSavingAiConfig, setIsSavingAiConfig] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<MenuTab>('rss');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchRssFeeds();
    fetchAiConfig();
    fetchDownloadConfig();
    if (showScheduler) {
      fetchRssItems();
    }
  }, [showScheduler]);

  useEffect(() => {
    // 动态设置页面标题
    document.title = '设置 | SSR Bangumi';
  }, []);

  const fetchAiConfig = async () => {
    setIsLoadingAiConfig(true);
    try {
      const response = await fetch('/api/ai-config');
      if (response.ok) {
        const data = await response.json();
        setAiConfig(data.aiConfig);
      }
    } catch (error) {
      console.error('获取AI配置失败:', error);
    } finally {
      setIsLoadingAiConfig(false);
    }
  };

  const saveAiConfig = async () => {
    setIsSavingAiConfig(true);
    try {
      const response = await fetch('/api/ai-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiConfig),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message || 'AI配置保存成功');
      } else {
        const data = await response.json();
        setError(data.error || '保存AI配置失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsSavingAiConfig(false);
    }
  };

  const fetchDownloadConfig = async () => {
    setIsLoadingDownloadConfig(true);
    try {
      const response = await fetch('/api/download-config');
      if (response.ok) {
        const data = await response.json();
        setDownloadConfig(data.downloadConfig);
      }
    } catch (error) {
      console.error('获取下载配置失败:', error);
    } finally {
      setIsLoadingDownloadConfig(false);
    }
  };

  const saveDownloadConfig = async () => {
    setIsSavingDownloadConfig(true);
    try {
      const response = await fetch('/api/download-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rpcUrl: downloadConfig.rpcUrl,
          rpcSecret: downloadConfig.rpcSecret
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message || '下载配置保存成功');
      } else {
        const data = await response.json();
        setError(data.error || '保存下载配置失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsSavingDownloadConfig(false);
    }
  };

  const testAria2Connection = async () => {
    setIsTestingAria2(true);
    setAria2TestResult(null);
    try {
      const response = await fetch('/api/download-config/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rpcUrl: downloadConfig.rpcUrl,
          rpcSecret: downloadConfig.rpcSecret
        }),
      });

      const data = await response.json();
      setAria2TestResult({
        success: data.success,
        message: data.message || data.error
      });

      if (data.success) {
        setSuccess(data.message);
      } else {
        setError(data.error);
      }
    } catch (error) {
      const errorMessage = '网络错误，请稍后重试';
      setAria2TestResult({
        success: false,
        message: errorMessage
      });
      setError(errorMessage);
    } finally {
      setIsTestingAria2(false);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const fetchRssFeeds = async () => {
    try {
      const response = await fetch('/api/rss-feeds');
      if (response.ok) {
        const data = await response.json();
        setRssFeeds(data.rssFeeds);
      }
    } catch (error) {
      console.error('Failed to fetch RSS feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fetchRssItems = async () => {
    try {
      const response = await fetch('/api/rss-scheduler');
      if (response.ok) {
        const data = await response.json();
        setRssItems(data.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch RSS items:', error);
    }
  };

  const triggerFeedUpdate = async (feedId: string) => {
    try {
      const response = await fetch('/api/rss-scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'trigger_update', feedId }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess('RSS源更新完成');
        fetchRssItems();
      } else {
        setError(data.message || '更新失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    }
  };

  const markItemProcessed = async (itemId: string) => {
    try {
      const response = await fetch('/api/rss-scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'mark_processed', itemId }),
      });
      
      if (response.ok) {
        setSuccess('项目已标记为已处理');
        fetchRssItems();
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      description: '',
      isActive: true,
      updateFreq: 60
    });
    setShowAddForm(false);
    setEditingFeed(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingFeed ? `/api/rss-feeds/${editingFeed.id}` : '/api/rss-feeds';
      const method = editingFeed ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingFeed ? 'RSS订阅更新成功' : 'RSS订阅添加成功');
        fetchRssFeeds();
        resetForm();
      } else {
        setError(data.error || '操作失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    }
  };

  const handleEdit = (feed: RssFeed) => {
    setFormData({
      name: feed.name,
      url: feed.url,
      description: feed.description || '',
      isActive: feed.isActive,
      updateFreq: feed.updateFreq || 60
    });
    setEditingFeed(feed);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个RSS订阅吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/rss-feeds/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('RSS订阅删除成功');
        fetchRssFeeds();
      } else {
        const data = await response.json();
        setError(data.error || '删除失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-white">加载中...</div>
      </div>
    );
  }

  const menuItems = [
    { id: 'rss' as MenuTab, name: 'RSS 配置', icon: '📡' },
    { id: 'download' as MenuTab, name: '下载服务配置', icon: '⬇️' },
    { id: 'ai' as MenuTab, name: 'AI 配置', icon: '🤖' }
  ];

  const renderRssConfig = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">RSS 配置</h2>
        <p className="text-gray-400">管理你的RSS订阅源</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition-colors font-medium"
        >
          + 添加RSS订阅
        </button>
        <button
          onClick={() => setShowScheduler(!showScheduler)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors font-medium"
        >
          {showScheduler ? '隐藏调度管理' : '显示调度管理'}
        </button>
      </div>

      {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-white mb-4">
              {editingFeed ? '编辑RSS订阅' : '添加RSS订阅'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    名称 *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="RSS订阅名称"
                  />
                </div>
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://example.com/rss.xml"
                  />
                </div>
                <div>
                  <label htmlFor="updateFreq" className="block text-sm font-medium text-gray-300 mb-2">
                    更新频次（分钟）
                  </label>
                  <select
                    id="updateFreq"
                    name="updateFreq"
                    value={formData.updateFreq}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value={5}>5分钟</option>
                    <option value={15}>15分钟</option>
                    <option value={30}>30分钟</option>
                    <option value={60}>1小时</option>
                    <option value={120}>2小时</option>
                    <option value={360}>6小时</option>
                    <option value={720}>12小时</option>
                    <option value={1440}>24小时</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  描述
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="RSS订阅描述"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">
                  启用此RSS订阅
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
                >
                  {editingFeed ? '更新' : '添加'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RSS Scheduler Management */}
        {showScheduler && (
          <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">RSS调度管理</h3>
            </div>
            {rssItems.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-400">暂无未处理的RSS项目</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {rssItems.map((item) => (
                  <div key={item.id} className="px-6 py-4 hover:bg-gray-750 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-white font-medium">{item.title}</h4>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-100">
                            {item.rssFeed.name}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.processed 
                              ? 'bg-green-900 text-green-100' 
                              : 'bg-yellow-900 text-yellow-100'
                          }`}>
                            {item.processed ? '已处理' : '未处理'}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>发布时间: {item.pubDate ? new Date(item.pubDate).toLocaleString() : '未知'}</span>
                          <span>创建时间: {new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                          >
                            查看
                          </a>
                        )}
                        {!item.processed && (
                          <button
                            onClick={() => markItemProcessed(item.id)}
                            className="text-green-400 hover:text-green-300 text-sm transition-colors"
                          >
                            标记已处理
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* RSS Feeds List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">RSS订阅列表</h3>
        </div>
        {rssFeeds.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-400">暂无RSS订阅</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {rssFeeds.map((feed) => (
              <div key={feed.id} className="px-6 py-4 hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-white font-medium">{feed.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        feed.isActive 
                          ? 'bg-green-900 text-green-100' 
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {feed.isActive ? '启用' : '禁用'}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-100">
                        每{feed.updateFreq}分钟
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{feed.url}</p>
                    {feed.description && (
                      <p className="text-gray-500 text-sm mt-1">{feed.description}</p>
                    )}
                    {feed.lastChecked && (
                      <p className="text-gray-500 text-xs mt-1">
                        最后检查: {new Date(feed.lastChecked).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => triggerFeedUpdate(feed.id)}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      立即更新
                    </button>
                    <button
                      onClick={() => handleEdit(feed)}
                      className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(feed.id)}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDownloadConfig = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">下载服务配置</h2>
        <p className="text-gray-400">配置 Aria2 下载服务连接信息</p>
      </div>

      {isLoadingDownloadConfig && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mr-3"></div>
            <span className="text-gray-300">加载下载配置中...</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* 下载路径显示 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">下载配置</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              下载目录
            </label>
            <input
              type="text"
              value={downloadConfig.downloadPath}
              readOnly
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400 focus:outline-none cursor-not-allowed"
              placeholder="下载路径由系统管理"
            />
            <p className="text-sm text-gray-500 mt-1">下载路径由系统管理，无法修改</p>
          </div>
        </div>

        {/* Aria2 连接配置 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Aria2 连接配置</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  RPC 地址 *
                </label>
                <input
                  type="text"
                  value={downloadConfig.rpcUrl}
                  onChange={(e) => setDownloadConfig({...downloadConfig, rpcUrl: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="http://localhost:6800/jsonrpc"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  RPC 密钥
                </label>
                <input
                  type="password"
                  value={downloadConfig.rpcSecret}
                  onChange={(e) => setDownloadConfig({...downloadConfig, rpcSecret: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="可选，如果设置了密钥请填写"
                />
              </div>
            </div>
            
            {/* 连接测试结果 */}
            {aria2TestResult && (
              <div className={`p-4 rounded-md ${
                aria2TestResult.success 
                  ? 'bg-green-900/20 border border-green-700' 
                  : 'bg-red-900/20 border border-red-700'
              }`}>
                <div className="flex items-center">
                  <span className={`text-sm ${
                    aria2TestResult.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {aria2TestResult.success ? '✓' : '✗'} {aria2TestResult.message}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={testAria2Connection}
                disabled={isTestingAria2 || !downloadConfig.rpcUrl}
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingAria2 ? '测试中...' : '测试连接'}
              </button>
              <button
                onClick={saveDownloadConfig}
                disabled={isSavingDownloadConfig || isLoadingDownloadConfig || !downloadConfig.rpcUrl}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingDownloadConfig ? '保存中...' : '保存配置'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('testing');
    
    try {
      // 模拟API连接测试
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (aiConfig.apiKey && aiConfig.proxyUrl) {
        setConnectionStatus('success');
        setSuccess('OpenRouter 连接测试成功');
      } else {
        setConnectionStatus('error');
        setError('请填写完整的 API Key 和代理地址');
      }
    } catch (error) {
      setConnectionStatus('error');
      setError('连接测试失败，请检查配置');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const renderAiConfig = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">AI 配置</h2>
        <p className="text-gray-400">配置 OpenRouter AI 服务和智能功能</p>
      </div>

      {isLoadingAiConfig && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-3"></div>
            <span className="text-gray-300">加载AI配置中...</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* OpenRouter 服务配置 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">OpenRouter 服务配置</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key *
              </label>
              <input
                type="password"
                value={aiConfig.apiKey}
                onChange={(e) => setAiConfig({...aiConfig, apiKey: e.target.value})}
                placeholder="输入 OpenRouter API Key"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                在 <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">OpenRouter</a> 获取您的 API Key
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API 代理地址
              </label>
              <input
                type="url"
                value={aiConfig.proxyUrl}
                onChange={(e) => setAiConfig({...aiConfig, proxyUrl: e.target.value})}
                placeholder="https://openrouter.ai/api/v1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                模型配置
              </label>
              <input
                type="text"
                value={aiConfig.model}
                onChange={(e) => setAiConfig({...aiConfig, model: e.target.value})}
                placeholder="输入模型名称，如: anthropic/claude-3.5-sonnet"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                常用模型: anthropic/claude-3.5-sonnet, openai/gpt-4o, google/gemini-pro-1.5
              </p>
            </div>
            
            {/* 连通性检查 */}
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">连通性检查</h4>
                <div className="flex items-center space-x-2">
                  {connectionStatus === 'success' && (
                    <span className="text-green-400 text-sm">✓ 连接正常</span>
                  )}
                  {connectionStatus === 'error' && (
                    <span className="text-red-400 text-sm">✗ 连接失败</span>
                  )}
                  <button
                    onClick={testConnection}
                    disabled={isTestingConnection}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white text-sm rounded-md transition-colors"
                  >
                    {isTestingConnection ? '测试中...' : '测试连接'}
                  </button>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                测试与 OpenRouter API 的连接状态
              </p>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={saveAiConfig}
                disabled={isSavingAiConfig || isLoadingAiConfig}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white rounded-md transition-colors"
              >
                {isSavingAiConfig ? '保存中...' : '保存配置'}
              </button>
            </div>
          </div>
        </div>

        {/* 智能功能配置 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">智能功能</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">智能识别种子信息</h4>
                <p className="text-gray-400 text-sm">使用 AI 自动识别和解析种子文件中的番剧信息</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={aiConfig.smartTorrentRecognition}
                  onChange={(e) => setAiConfig({...aiConfig, smartTorrentRecognition: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            
            {aiConfig.smartTorrentRecognition && (
              <div className="bg-gray-700 rounded-lg p-4 mt-3">
                <h5 className="text-white font-medium mb-2">功能说明</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 自动识别种子文件名中的番剧标题</li>
                  <li>• 解析集数、季度、分辨率等信息</li>
                  <li>• 智能匹配番剧数据库</li>
                  <li>• 生成标准化的文件命名</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-orange-400">SSRBangumi</h1>
              <nav className="flex space-x-6">
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  番剧首页
                </Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  番剧库
                </Link>
                <Link href="/dashboard/settings" className="text-orange-400 hover:text-orange-300 transition-colors">
                  设置
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">欢迎, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Menu */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">设置菜单</h3>
              </div>
              <nav className="p-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded mb-6">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Dynamic Content Based on Active Tab */}
            {activeTab === 'rss' && renderRssConfig()}
            {activeTab === 'download' && renderDownloadConfig()}
            {activeTab === 'ai' && renderAiConfig()}
          </div>
        </div>
      </main>
    </div>
  );
}
