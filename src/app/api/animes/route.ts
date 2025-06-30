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

    // 获取用户的动漫列表
    const animes = await prisma.anime.findMany({
      where: {
        user: {
          id: decoded.userId
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      animes
    })
  } catch (error) {
    console.error('Get animes error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { title, description, status, episodes, currentEpisode, rating, imageUrl } = await request.json()

    // 验证输入
    if (!title || !description) {
      return NextResponse.json(
        { error: '标题和描述不能为空' },
        { status: 400 }
      )
    }

    // 创建动漫记录
    const anime = await prisma.anime.create({
      data: {
        title,
        description,
        status: status || '未开播',
        episodes: parseInt(episodes) || 0,
        currentEpisode: parseInt(currentEpisode) || 0,
        rating: parseFloat(rating) || 0,
        imageUrl,
        user: {
          connect: {
            id: decoded.userId
          }
        }
      }
    })

    return NextResponse.json(
      {
        message: '动漫添加成功',
        anime
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create anime error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}