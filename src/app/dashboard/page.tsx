'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface Anime {
  id: string;
  title: string;
  description: string;
  status: string;
  episodes: number;
  currentEpisode: number;
  rating: number;
  imageUrl?: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchAnimes();
  }, []);

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

  const fetchAnimes = async () => {
    try {
      const response = await fetch('/api/animes');
      if (response.ok) {
        const data = await response.json();
        setAnimes(data.animes || []);
      } else {
        setError('获取动漫列表失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-orange-400">
                SSRBangumi
              </h1>
              <div className="flex space-x-6">
                <Link href="/dashboard" className="text-orange-400 hover:text-orange-300 transition-colors">
                  番剧首页
                </Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  番剧库
                </Link>
                <Link href="/dashboard/settings" className="text-gray-300 hover:text-white transition-colors">
                  设置
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300">欢迎, {user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-8 mb-8">
          <button className="text-orange-400 border-b-2 border-orange-400 pb-2 font-medium">
            番剧首页
          </button>
          <button className="text-gray-400 hover:text-white transition-colors pb-2">
            番剧库
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Add Anime Button */}
        <div className="flex justify-end mb-6">
          <Link
            href="/dashboard/add-anime"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition-colors font-medium inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            添加番剧
          </Link>
        </div>

        {/* Anime Grid */}
        {animes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v10h6V6H9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-100 mb-2">暂无番剧</h3>
            <p className="text-gray-400 mb-4">开始添加你喜爱的番剧作品吧！</p>
            <Link
              href="/dashboard/add-anime"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition-colors font-medium"
            >
              添加第一部番剧
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {animes.map((anime) => (
              <div key={anime.id} className="group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-800 hover:scale-105 transition-transform duration-200">
                  {anime.imageUrl ? (
                    <img
                      src={anime.imageUrl}
                      alt={anime.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 text-sm text-center px-2">{anime.title}</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {anime.status}
                    </span>
                  </div>
                  
                  {/* Episode Progress */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {anime.currentEpisode}/{anime.episodes}
                    </div>
                  </div>
                  
                  {/* Rating */}
                  {anime.rating > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        {anime.rating}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                    {anime.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Recently Updated Section */}
        {animes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">番剧新上线</h2>
            <div className="text-right mb-4">
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                更多 &gt;
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {animes.slice(0, 8).map((anime) => (
                <div key={`recent-${anime.id}`} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-800 hover:scale-105 transition-transform duration-200">
                    {anime.imageUrl ? (
                      <img
                        src={anime.imageUrl}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <span className="text-gray-400 text-sm text-center px-2">{anime.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                      {anime.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}