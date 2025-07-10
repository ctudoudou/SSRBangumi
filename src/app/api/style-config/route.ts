import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const styleConfig = await prisma.styleConfig.findUnique({
      where: { userId: user.id }
    });

    // 如果没有样式配置，返回默认配置
    const defaultConfig = {
      currentTheme: 'dark',
      customThemes: [],
      enableAnimations: true,
      fontSize: 'medium',
      borderRadius: 'medium'
    };

    const config = styleConfig ? JSON.parse(styleConfig.config) : defaultConfig;

    return NextResponse.json({ config });
  } catch (error) {
    console.error('获取样式配置失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const config = await request.json();

    // 验证配置格式
    if (!config.currentTheme || typeof config.enableAnimations !== 'boolean') {
      return NextResponse.json({ error: '配置格式无效' }, { status: 400 });
    }

    // 保存或更新样式配置
    await prisma.styleConfig.upsert({
      where: { userId: user.id },
      update: {
        config: JSON.stringify(config),
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        config: JSON.stringify(config)
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存样式配置失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}