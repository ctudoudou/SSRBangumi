'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/settings/hooks/useAuth';
import SettingsLayout from '@/components/settings/SettingsLayout';
import RssConfig from '@/components/settings/RssConfig';

export default function RssConfigPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    document.title = 'RSS 配置 | SSR Bangumi';
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
      <RssConfig />
    </SettingsLayout>
  );
}