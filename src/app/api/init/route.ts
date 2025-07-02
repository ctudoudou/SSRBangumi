import { NextRequest, NextResponse } from 'next/server'
import { initializeApp } from '@/lib/startup'

// 标记是否已初始化
let isInitialized = false

export async function GET(request: NextRequest) {
  try {
    // 只在第一次请求时初始化
    if (!isInitialized) {
      initializeApp()
      isInitialized = true
      return NextResponse.json({ message: 'RSS 调度器已初始化', initialized: true })
    }
    
    return NextResponse.json({ message: 'RSS 调度器已经在运行中', initialized: false })
  } catch (error) {
    console.error('初始化 RSS 调度器失败:', error)
    return NextResponse.json(
      { error: '初始化失败' },
      { status: 500 }
    )
  }
}