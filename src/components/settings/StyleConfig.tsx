'use client';

import { useState, useEffect } from 'react';
import { ThemeConfig, StyleConfig as StyleConfigType } from './types';
import { useNotification } from './hooks/useNotification';
import { useTheme } from '../ThemeProvider';

// 预设主题
const DEFAULT_THEMES: ThemeConfig[] = [
  {
    id: 'dark',
    name: '暗色调',
    type: 'dark',
    colors: {
      primary: '#f97316',
      secondary: '#64748b',
      background: '#111827',
      surface: '#1f2937',
      text: '#ffffff',
      textSecondary: '#9ca3af',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      border: '#374151'
    },
    isDefault: true
  },
  {
    id: 'light',
    name: '亮色调',
    type: 'light',
    colors: {
      primary: '#ea580c',
      secondary: '#64748b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1f2937',
      textSecondary: '#6b7280',
      accent: '#2563eb',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      border: '#e5e7eb'
    },
    isDefault: true
  },
  {
    id: 'anime',
    name: '动漫风格',
    type: 'anime',
    colors: {
      primary: '#ff6b9d',
      secondary: '#a78bfa',
      background: '#fef7ff',
      surface: '#fff0f9',
      text: '#2d1b69',
      textSecondary: '#7c3aed',
      accent: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#f43f5e',
      border: '#e879f9'
    },
    isDefault: true
  }
];

export default function StyleConfig() {
  const { showError, showSuccess, error, success, clearMessages } = useNotification();
  const { currentTheme, setTheme, applyTheme } = useTheme();
  const [config, setConfig] = useState<StyleConfigType>({
    currentTheme: 'dark',
    customThemes: [],
    enableAnimations: true,
    fontSize: 'medium',
    borderRadius: 'medium'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCustomThemeForm, setShowCustomThemeForm] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeConfig | null>(null);
  const [customTheme, setCustomTheme] = useState<Partial<ThemeConfig>>({
    name: '',
    type: 'custom',
    colors: {
      primary: '#f97316',
      secondary: '#64748b',
      background: '#111827',
      surface: '#1f2937',
      text: '#ffffff',
      textSecondary: '#9ca3af',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      border: '#374151'
    }
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/style-config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      } else {
        showError('获取样式配置失败');
      }
    } catch (error) {
      console.error('Failed to fetch style config:', error);
      showError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/style-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('样式配置保存成功');
      } else {
        showError(data.error || '保存失败');
      }
    } catch (error) {
      showError('网络错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const getAllThemes = (): ThemeConfig[] => {
    return [...DEFAULT_THEMES, ...config.customThemes];
  };

  const handleThemeChange = (themeId: string) => {
    setConfig(prev => ({ ...prev, currentTheme: themeId }));
    const theme = getAllThemes().find(t => t.id === themeId);
    if (theme) {
      setTheme(theme); // 使用ThemeProvider的setTheme方法
    }
  };

  const handleConfigChange = (key: keyof StyleConfigType, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleCustomThemeSubmit = () => {
    if (!customTheme.name || !customTheme.colors) {
      showError('请填写完整的主题信息');
      return;
    }

    const newTheme: ThemeConfig = {
      id: editingTheme?.id || `custom-${Date.now()}`,
      name: customTheme.name,
      type: 'custom',
      colors: customTheme.colors,
      isCustom: true
    };

    if (editingTheme) {
      // 编辑现有主题
      setConfig(prev => ({
        ...prev,
        customThemes: prev.customThemes.map(t => t.id === editingTheme.id ? newTheme : t)
      }));
      showSuccess('自定义主题更新成功');
    } else {
      // 添加新主题
      setConfig(prev => ({
        ...prev,
        customThemes: [...prev.customThemes, newTheme]
      }));
      showSuccess('自定义主题创建成功');
    }

    setShowCustomThemeForm(false);
    setEditingTheme(null);
    setCustomTheme({
      name: '',
      type: 'custom',
      colors: {
        primary: '#f97316',
        secondary: '#64748b',
        background: '#111827',
        surface: '#1f2937',
        text: '#ffffff',
        textSecondary: '#9ca3af',
        accent: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        border: '#374151'
      }
    });
  };

  const handleEditTheme = (theme: ThemeConfig) => {
    setEditingTheme(theme);
    setCustomTheme(theme);
    setShowCustomThemeForm(true);
  };

  const handleDeleteTheme = (themeId: string) => {
    setConfig(prev => ({
      ...prev,
      customThemes: prev.customThemes.filter(t => t.id !== themeId),
      currentTheme: prev.currentTheme === themeId ? 'dark' : prev.currentTheme
    }));
    showSuccess('自定义主题删除成功');
  };

  const handleColorChange = (colorKey: string, value: string) => {
    setCustomTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors!,
        [colorKey]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">样式配置</h2>
        <p className="text-gray-400">自定义应用的外观和主题</p>
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

      <div className="space-y-8">
        {/* Theme Selection */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">主题选择</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAllThemes().map((theme) => (
              <div
                key={theme.id}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  config.currentTheme === theme.id
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">{theme.name}</h4>
                  {theme.isCustom && (
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTheme(theme);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        编辑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTheme(theme.id);
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 mb-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.primary }}></div>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.secondary }}></div>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.accent }}></div>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.background }}></div>
                </div>
                <p className="text-sm text-gray-400">{theme.type === 'custom' ? '自定义主题' : '预设主题'}</p>
                {config.currentTheme === theme.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setShowCustomThemeForm(true)}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            创建自定义主题
          </button>
        </div>

        {/* Other Style Settings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">其他设置</h3>
          <div className="space-y-6">
            {/* Animations */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={config.enableAnimations}
                  onChange={(e) => handleConfigChange('enableAnimations', e.target.checked)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded"
                />
                <span className="text-white">启用动画效果</span>
              </label>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                字体大小
              </label>
              <select
                value={config.fontSize}
                onChange={(e) => handleConfigChange('fontSize', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="small">小</option>
                <option value="medium">中</option>
                <option value="large">大</option>
              </select>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                圆角大小
              </label>
              <select
                value={config.borderRadius}
                onChange={(e) => handleConfigChange('borderRadius', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="none">无圆角</option>
                <option value="small">小圆角</option>
                <option value="medium">中圆角</option>
                <option value="large">大圆角</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium"
          >
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      {/* Custom Theme Form Modal */}
      {showCustomThemeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-white mb-4">
              {editingTheme ? '编辑自定义主题' : '创建自定义主题'}
            </h3>
            
            <div className="space-y-4">
              {/* Theme Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  主题名称
                </label>
                <input
                  type="text"
                  value={customTheme.name || ''}
                  onChange={(e) => setCustomTheme(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="输入主题名称"
                />
              </div>

              {/* Color Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  颜色配置
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(customTheme.colors || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-400 mb-1 capitalize">
                        {key === 'primary' ? '主色' :
                         key === 'secondary' ? '次要色' :
                         key === 'background' ? '背景色' :
                         key === 'surface' ? '表面色' :
                         key === 'text' ? '文字色' :
                         key === 'textSecondary' ? '次要文字色' :
                         key === 'accent' ? '强调色' :
                         key === 'success' ? '成功色' :
                         key === 'warning' ? '警告色' :
                         key === 'error' ? '错误色' :
                         key === 'border' ? '边框色' : key}
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="w-12 h-8 rounded border border-gray-600"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCustomThemeForm(false);
                  setEditingTheme(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCustomThemeSubmit}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
              >
                {editingTheme ? '更新主题' : '创建主题'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}