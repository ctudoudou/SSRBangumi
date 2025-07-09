'use client';

import React, { useState, useEffect } from 'react';
import { AiConfig as AiConfigType, ConnectionStatus } from './types';
import { useNotification } from './hooks/useNotification';

export default function AiConfig() {
  const { showError, showSuccess, error, success, clearMessages } = useNotification();
  const [config, setConfig] = useState<AiConfigType>({
    openrouterApiKey: '',
    openrouterProxyUrl: 'https://openrouter.ai/api/v1',
    openrouterModel: 'anthropic/claude-3.5-sonnet',
    enableSmartRecognition: false
  });
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const availableModels = [
    { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
    { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' },
    { value: 'openai/gpt-4o', label: 'GPT-4o' },
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'openai/gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5' },
    { value: 'meta-llama/llama-3.1-8b-instruct', label: 'Llama 3.1 8B' },
    { value: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
    { value: 'mistralai/mistral-7b-instruct', label: 'Mistral 7B' },
    { value: 'mistralai/mixtral-8x7b-instruct', label: 'Mixtral 8x7B' }
  ];

  useEffect(() => {
    fetchAiConfig();
  }, []);

  const fetchAiConfig = async () => {
    try {
      const response = await fetch('/api/ai-config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      } else {
        showError('获取AI配置失败');
      }
    } catch (error) {
      console.error('Failed to fetch AI config:', error);
      showError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const testConnection = async () => {
    if (!config.openrouterApiKey) {
      showError('请先输入 OpenRouter API Key');
      return;
    }

    setTestingConnection(true);
    setConnectionResult(null);

    try {
      const response = await fetch('/api/ai-config/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: config.openrouterApiKey,
          proxyUrl: config.openrouterProxyUrl,
          model: config.openrouterModel
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setConnectionResult({
          success: true,
          message: '连接成功！AI 服务可正常使用',
          details: data.details
        });
      } else {
        setConnectionResult({
          success: false,
          message: data.message || '连接失败',
          details: data.details
        });
      }
    } catch (error) {
      setConnectionResult({
        success: false,
        message: '网络错误，请检查网络连接',
        details: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const saveConfig = async () => {
    try {
      const response = await fetch('/api/ai-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('AI配置保存成功');
      } else {
        showError(data.error || '保存失败');
      }
    } catch (error) {
      showError('网络错误，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mr-3"></div>
        <span className="text-gray-300">加载AI配置中...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">AI 配置</h2>
        <p className="text-gray-400">配置 OpenRouter AI 服务</p>
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

      <div className="space-y-6">
        {/* OpenRouter Service Configuration */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">OpenRouter 服务配置</h3>
          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label htmlFor="openrouterApiKey" className="block text-sm font-medium text-gray-300 mb-2">
                API Key *
              </label>
              <input
                type="password"
                id="openrouterApiKey"
                name="openrouterApiKey"
                value={config.openrouterApiKey}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="输入你的 OpenRouter API Key"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                从 <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">OpenRouter</a> 获取你的 API Key
              </p>
            </div>

            {/* Proxy URL */}
            <div>
              <label htmlFor="openrouterProxyUrl" className="block text-sm font-medium text-gray-300 mb-2">
                代理地址（可选）
              </label>
              <input
                type="url"
                id="openrouterProxyUrl"
                name="openrouterProxyUrl"
                value={config.openrouterProxyUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://your-proxy.com/v1"
              />
              <p className="text-xs text-gray-500 mt-1">
                如果需要通过代理访问 OpenRouter，请输入代理地址
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label htmlFor="openrouterModel" className="block text-sm font-medium text-gray-300 mb-2">
                模型选择
              </label>
              <select
                id="openrouterModel"
                name="openrouterModel"
                value={config.openrouterModel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {availableModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                选择要使用的 AI 模型。推荐使用 Claude 3.5 Sonnet 以获得最佳效果。
              </p>
            </div>

            {/* Connection Test */}
            {connectionResult && (
              <div className={`p-4 rounded-md ${
                connectionResult.success 
                  ? 'bg-green-900/20 border border-green-500/30' 
                  : 'bg-red-900/20 border border-red-500/30'
              }`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                    connectionResult.success ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {connectionResult.success ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${
                      connectionResult.success ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {connectionResult.message}
                    </h4>
                    {connectionResult.details && (
                      <p className={`text-xs mt-1 ${
                        connectionResult.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {connectionResult.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Test Connection Button */}
            <div className="flex justify-end">
              <button
                onClick={testConnection}
                disabled={testingConnection || !config.openrouterApiKey}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium flex items-center"
              >
                {testingConnection ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    测试中...
                  </>
                ) : (
                  '测试连通性'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Smart Features */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">智能功能</h3>
          <div className="space-y-4">
            {/* Smart Recognition Toggle */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="enableSmartRecognition"
                name="enableSmartRecognition"
                checked={config.enableSmartRecognition}
                onChange={handleInputChange}
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded mt-1"
              />
              <div className="flex-1">
                <label htmlFor="enableSmartRecognition" className="block text-sm font-medium text-white">
                  启用智能识别种子信息
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  使用 AI 自动识别和解析种子文件信息，提高识别准确性
                </p>
              </div>
            </div>

            {/* Smart Recognition Description */}
            {config.enableSmartRecognition && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-300 mb-2">智能识别功能说明</h4>
                <ul className="text-xs text-blue-200 space-y-1">
                  <li>• 自动识别番剧名称、季度、集数等信息</li>
                  <li>• 智能匹配字幕组和视频质量</li>
                  <li>• 提高种子信息解析的准确性</li>
                  <li>• 减少手动配置的工作量</li>
                </ul>
                <p className="text-xs text-blue-300 mt-2">
                  注意：启用此功能将消耗 API 调用次数，请确保你的 API Key 有足够的额度。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveConfig}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors font-medium"
          >
            保存配置
          </button>
        </div>

        {/* Configuration Help */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">配置说明</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-1">OpenRouter API Key</h4>
              <p>OpenRouter 是一个 AI 模型聚合平台，提供多种优秀的 AI 模型访问。你需要：</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-400 mt-1">
                <li>访问 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">OpenRouter 官网</a> 注册账号</li>
                <li>在 <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">API Keys 页面</a> 创建新的 API Key</li>
                <li>将 API Key 复制到上方输入框中</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">模型选择建议</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li><strong>Claude 3.5 Sonnet</strong>：推荐选择，理解能力强，适合复杂任务</li>
                <li><strong>GPT-4o</strong>：OpenAI 最新模型，性能优秀</li>
                <li><strong>Claude 3 Haiku</strong>：速度快，成本低，适合简单任务</li>
                <li><strong>Gemini Pro 1.5</strong>：Google 模型，上下文长度大</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">代理配置</h4>
              <p>如果你的网络环境无法直接访问 OpenRouter，可以配置代理地址。代理服务需要兼容 OpenAI API 格式。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}