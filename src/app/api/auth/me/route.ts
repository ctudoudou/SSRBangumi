import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 从 cookie 中获取 token
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    // 验证 token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token 无效' },
        { status: 401 }
      )
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user
    })
  } catch (error) {
    console.error('Get user info error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}