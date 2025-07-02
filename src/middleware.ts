import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 中间件只处理路由，不初始化 RSS 调度器
  return NextResponse.next()
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 只匹配 API 路由，避免在 Edge Runtime 中初始化 RSS 调度器
     */
    '/api/:path*',
  ],
}