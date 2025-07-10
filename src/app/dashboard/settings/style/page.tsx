'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/settings/hooks/useAuth';
import SettingsLayout from '@/components/settings/SettingsLayout';
import StyleConfig from '@/components/settings/StyleConfig';

export default function StylePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    document.title = 'SSRBangumi - 样式配置';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SettingsLayout>
      <StyleConfig />
    </SettingsLayout>
  );
}