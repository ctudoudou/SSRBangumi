import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import rssScheduler from '@/lib/rss-scheduler'

// 获取RSS调度状态和未处理项目
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: '缺少认证token' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: '无效的token' }, { status: 401 })
    }

    // 获取未处理的RSS项目
    const unprocessedItems = await rssScheduler.getUnprocessedItems(20)
    
    return NextResponse.json({
      success: true,
      data: {
        unprocessedCount: unprocessedItems.length,
        items: unprocessedItems
      }
    })
  } catch (error) {
    console.error('获取RSS调度状态失败:', error)
    return NextResponse.json(
      { error: '获取RSS调度状态失败' },
      { status: 500 }
    )
  }
}

// 手动触发RSS源更新
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: '缺少认证token' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: '无效的token' }, { status: 401 })
    }

    const body = await request.json()
    const { action, feedId, itemId } = body

    switch (action) {
      case 'trigger_update':
        if (!feedId) {
          return NextResponse.json({ error: '缺少feedId参数' }, { status: 400 })
        }
        
        const result = await rssScheduler.triggerFeedUpdate(feedId)
        return NextResponse.json(result)

      case 'mark_processed':
        if (!itemId) {
          return NextResponse.json({ error: '缺少itemId参数' }, { status: 400 })
        }
        
        await rssScheduler.markItemAsProcessed(itemId)
        return NextResponse.json({ success: true, message: '项目已标记为已处理' })

      default:
        return NextResponse.json({ error: '无效的操作' }, { status: 400 })
    }
  } catch (error) {
    console.error('RSS调度操作失败:', error)
    return NextResponse.json(
      { error: 'RSS调度操作失败' },
      { status: 500 }
    )
  }
}