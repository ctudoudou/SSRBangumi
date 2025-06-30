'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Anime {
  id: string
  title: string
  description: string
  status: string
  episodes: number
  currentEpisode: number
  rating: number
  imageUrl?: string
  updatedAt: string
}

interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [animes, setAnimes] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchAnimes()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const fetchAnimes = async () => {
    try {
      const response = await fetch('/api/animes')
      if (response.ok) {
        const data = await response.json()
        setAnimes(data.animes || [])
      } else {
        setError('获取动漫列表失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '连载中': return 'bg-green-100 text-green-800'
      case '已完结': return 'bg-blue-100 text-blue-800'
      case '未开播': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                SSRBangumi
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">欢迎, {user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">动漫追番列表</h2>
          <p className="text-gray-600">发现和追踪你喜爱的动漫作品</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Add Anime Button */}
        <div className="mb-6">
          <Link
            href="/dashboard/add-anime"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            添加动漫
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无动漫</h3>
            <p className="text-gray-600 mb-4">开始添加你喜爱的动漫作品吧！</p>
            <Link
              href="/dashboard/add-anime"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              添加第一部动漫
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {animes.map((anime) => (
              <div key={anime.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {anime.imageUrl && (
                  <img
                    src={anime.imageUrl}
                    alt={anime.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                    {anime.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {anime.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(anime.status)}`}>
                      {anime.status}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm">{anime.rating}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <div className="flex justify-between">
                      <span>进度:</span>
                      <span>{anime.currentEpisode}/{anime.episodes}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(anime.currentEpisode / anime.episodes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    更新时间: {formatDate(anime.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}