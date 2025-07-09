'use client';

import { useState, useEffect } from 'react';
import { DownloadConfig as DownloadConfigType, TestResult, ConnectionStatus } from './types';
import { useNotification } from './hooks/useNotification';

export default function DownloadConfig() {
  const { showError, showSuccess, error, success, clearMessages } = useNotification();
  const [config, setConfig] = useState<DownloadConfigType>({
    aria2RpcUrl: 'http://localhost:6800/jsonrpc',
    aria2RpcSecret: '',
    downloadPath: '/downloads'
  });
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');

  useEffect(() => {
    fetchDownloadConfig();
  }, []);

  const fetchDownloadConfig = async () => {
    try {
      const response = await fetch('/api/download-config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      } else {
        showError('获取下载配置失败');
      }
    } catch (error) {
      console.error('Failed to fetch download config:', error);
      showError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    setTestResult(null);

    try {
      const response = await fetch('/api/download-config/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aria2RpcUrl: config.aria2RpcUrl,
          aria2RpcSecret: config.aria2RpcSecret
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setTestResult({
          success: true,
          message: '连接成功！',
          details: data.version ? `Aria2 版本: ${data.version}` : undefined
        });
        setConnectionStatus('success');
        showSuccess('连接成功！');
      } else {
        setTestResult({
          success: false,
          message: data.message || '连接失败',
          details: data.details
        });
        setConnectionStatus('error');
        showError(data.message || '连接失败');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: '网络错误，请检查网络连接',
        details: error instanceof Error ? error.message : '未知错误'
      });
      setConnectionStatus('error');
      showError('网络错误，请检查网络连接');
    }
  };

  const saveConfig = async () => {
    try {
      const response = await fetch('/api/download-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('下载配置保存成功');
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
        <span className="text-gray-300">加载下载配置中...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">下载服务配置</h2>
        <p className="text-gray-400">配置 Aria2 下载服务连接</p>
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

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="space-y-6">
          {/* Download Path */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              下载路径
            </label>
            <input
              type="text"
              value={config.downloadPath}
              disabled
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed"
              placeholder="下载文件保存路径"
            />
            <p className="text-xs text-gray-500 mt-1">
              下载路径由系统配置，无法修改
            </p>
          </div>

          {/* Aria2 RPC URL */}
          <div>
            <label htmlFor="aria2RpcUrl" className="block text-sm font-medium text-gray-300 mb-2">
              Aria2 RPC 地址 *
            </label>
            <input
              type="url"
              id="aria2RpcUrl"
              name="aria2RpcUrl"
              value={config.aria2RpcUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="http://localhost:6800/jsonrpc"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Aria2 JSON-RPC 接口地址，通常为 http://localhost:6800/jsonrpc
            </p>
          </div>

          {/* Aria2 RPC Secret */}
          <div>
            <label htmlFor="aria2RpcSecret" className="block text-sm font-medium text-gray-300 mb-2">
              Aria2 RPC 密钥
            </label>
            <input
              type="password"
              id="aria2RpcSecret"
              name="aria2RpcSecret"
              value={config.aria2RpcSecret}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="输入 RPC 密钥（可选）"
            />
            <p className="text-xs text-gray-500 mt-1">
              如果 Aria2 配置了 RPC 密钥，请在此输入。留空表示无密钥验证。
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-4 rounded-md ${
              testResult.success 
                ? 'bg-green-900/20 border border-green-500/30' 
                : 'bg-red-900/20 border border-red-500/30'
            }`}>
              <div className="flex items-start">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                  testResult.success ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {testResult.success ? (
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
                    testResult.success ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {testResult.message}
                  </h4>
                  {testResult.details && (
                    <p className={`text-xs mt-1 ${
                      testResult.success ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {testResult.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={testConnection}
              disabled={connectionStatus === 'testing'}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium flex items-center"
            >
              {connectionStatus === 'testing' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  测试中...
                </>
              ) : (
                '测试连接'
              )}
            </button>
            <button
              onClick={saveConfig}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors font-medium"
            >
              保存配置
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Help */}
      <div className="mt-6 bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">配置说明</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-1">Aria2 RPC 地址</h4>
            <p>Aria2 的 JSON-RPC 接口地址。如果 Aria2 运行在本地默认端口，通常为：</p>
            <code className="block bg-gray-700 px-2 py-1 rounded mt-1 text-orange-300">
              http://localhost:6800/jsonrpc
            </code>
          </div>
          <div>
            <h4 className="font-medium text-white mb-1">RPC 密钥</h4>
            <p>如果在 Aria2 配置中设置了 <code className="bg-gray-700 px-1 rounded text-orange-300">rpc-secret</code>，请在此输入相同的密钥。</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-1">常见问题</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>确保 Aria2 服务正在运行</li>
              <li>检查 RPC 地址和端口是否正确</li>
              <li>验证 RPC 密钥是否匹配</li>
              <li>确认防火墙没有阻止连接</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}