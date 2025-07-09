'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/settings/hooks/useAuth';
import SettingsLayout from '@/components/settings/SettingsLayout';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    document.title = '设置 | SSR Bangumi';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-gray-300">加载中...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SettingsLayout>
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">欢迎来到设置页面</h2>
        <p className="text-gray-400 mb-6">
          请从左侧菜单选择要配置的功能模块
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-2xl mb-2">📡</div>
            <h3 className="text-white font-medium mb-1">RSS 配置</h3>
            <p className="text-gray-400 text-sm">管理RSS订阅源和调度</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-2xl mb-2">⬇️</div>
            <h3 className="text-white font-medium mb-1">下载配置</h3>
            <p className="text-gray-400 text-sm">配置Aria2下载服务</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="text-white font-medium mb-1">AI 配置</h3>
            <p className="text-gray-400 text-sm">配置AI智能识别功能</p>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
