'use client';

import { useState, useEffect } from 'react';
import { RssFeed, RssItem } from './types';
import { useNotification } from './hooks/useNotification';

export default function RssConfig() {
  const { showError, showSuccess, error, success, clearMessages } = useNotification();
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

  useEffect(() => {
    fetchRssFeeds();
    if (showScheduler) {
      fetchRssItems();
    }
  }, [showScheduler]);

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
        showSuccess('RSS源更新完成');
        fetchRssItems();
      } else {
        showError(data.message || '更新失败');
      }
    } catch (error) {
      showError('网络错误，请稍后重试');
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
        showSuccess('项目已标记为已处理');
        fetchRssItems();
      }
    } catch (error) {
      showError('网络错误，请稍后重试');
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'updateFreq' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        showSuccess(editingFeed ? 'RSS订阅更新成功' : 'RSS订阅添加成功');
        fetchRssFeeds();
        resetForm();
      } else {
        showError(data.error || '操作失败');
      }
    } catch (error) {
      showError('网络错误，请稍后重试');
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
        showSuccess('RSS订阅删除成功');
        fetchRssFeeds();
      } else {
        const data = await response.json();
        showError(data.error || '删除失败');
      }
    } catch (error) {
      showError('网络错误，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mr-3"></div>
        <span className="text-gray-300">加载RSS配置中...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">RSS 配置</h2>
        <p className="text-gray-400">管理你的RSS订阅源</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded mb-6">
          <div className="flex justify-between items-center">
            <span>{success}</span>
            <button onClick={clearMessages} className="text-green-300 hover:text-green-100">
              ✕
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearMessages} className="text-red-300 hover:text-red-100">
              ✕
            </button>
          </div>
        </div>
      )}

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
            <p className="text-gray-400">暂无RSS订阅，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {rssFeeds.map((feed) => (
              <div key={feed.id} className="px-6 py-4 hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between">
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
                        {feed.updateFreq}分钟
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{feed.url}</p>
                    {feed.description && (
                      <p className="text-gray-500 text-sm mt-1">{feed.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>创建时间: {new Date(feed.createdAt).toLocaleString()}</span>
                      {feed.lastChecked && (
                        <span>最后检查: {new Date(feed.lastChecked).toLocaleString()}</span>
                      )}
                    </div>
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
}