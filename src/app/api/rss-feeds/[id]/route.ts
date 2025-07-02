import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { id } = params;

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
    if (updateFreq !== undefined) {
      if (updateFreq < 5 || updateFreq > 1440) {
        return NextResponse.json({ error: '更新频次必须在5-1440分钟之间' }, { status: 400 });
      }
    }

    // 检查RSS订阅是否存在且属于当前用户
    const existingFeed = await prisma.rssFeed.findFirst({
      where: {
        id,
        userId: decoded.userId,
      },
    });

    if (!existingFeed) {
      return NextResponse.json({ error: 'RSS订阅不存在' }, { status: 404 });
    }

    const updateData: any = {
      name,
      url,
      description: description || null,
      isActive: isActive !== undefined ? isActive : true,
    };

    if (updateFreq !== undefined) {
      updateData.updateFreq = updateFreq;
    }

    const rssFeed = await prisma.rssFeed.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ rssFeed });
  } catch (error) {
    console.error('更新RSS订阅失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '无效的token' }, { status: 401 });
    }

    const { id } = params;

    // 检查RSS订阅是否存在且属于当前用户
    const existingFeed = await prisma.rssFeed.findFirst({
      where: {
        id,
        userId: decoded.userId,
      },
    });

    if (!existingFeed) {
      return NextResponse.json({ error: 'RSS订阅不存在' }, { status: 404 });
    }

    await prisma.rssFeed.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'RSS订阅删除成功' });
  } catch (error) {
    console.error('删除RSS订阅失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}