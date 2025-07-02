import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '无效的token' }, { status: 401 });
    }

    const rssFeeds = await prisma.rssFeed.findMany({
      where: {
        user: {
          id: decoded.userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ rssFeeds });
  } catch (error) {
    console.error('获取RSS订阅失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '无效的token' }, { status: 401 });
    }

    const { name, url, description, isActive, updateFreq } = await request.json();

    if (!name || !url) {
      return NextResponse.json({ error: '名称和URL是必填项' }, { status: 400 });
    }

    // 验证URL格式
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: '无效的URL格式' }, { status: 400 });
    }

    // 验证更新频次
    const freq = updateFreq || 60;
    if (freq < 5 || freq > 1440) {
      return NextResponse.json({ error: '更新频次必须在5-1440分钟之间' }, { status: 400 });
    }

    const rssFeed = await prisma.rssFeed.create({
      data: {
        name,
        url,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
        updateFreq: freq,
        user: {
          connect: {
            id: decoded.userId,
          },
        },
      },
    });

    return NextResponse.json({ rssFeed }, { status: 201 });
  } catch (error) {
    console.error('创建RSS订阅失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}