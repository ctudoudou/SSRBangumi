'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './hooks/useAuth';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'rss', name: 'RSS 配置', icon: '📡', href: '/dashboard/settings/rss' },
    { id: 'download', name: '下载服务配置', icon: '⬇️', href: '/dashboard/settings/download' },
    { id: 'ai', name: 'AI 配置', icon: '🤖', href: '/dashboard/settings/ai' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 如果访问 /dashboard/settings，重定向到 RSS 配置页面
  useEffect(() => {
    if (pathname === '/dashboard/settings') {
      router.replace('/dashboard/settings/rss');
    }
  }, [pathname, router]);

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
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-left transition-colors ${
                        isActive
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}