import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - 获取AI配置
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    const aiConfig = await prisma.aiConfig.findUnique({
      where: { userId: decoded.userId },
    });

    if (!aiConfig) {
      // 如果没有配置，返回默认值
      return NextResponse.json({
        aiConfig: {
          apiKey: '',
          proxyUrl: 'https://openrouter.ai/api/v1',
          model: 'anthropic/claude-3.5-sonnet',
          smartTorrentRecognition: false
        }
      });
    }

    return NextResponse.json({ aiConfig });
  } catch (error) {
    console.error('获取AI配置失败:', error);
    return NextResponse.json({ error: '获取AI配置失败' }, { status: 500 });
  }
}

// POST/PUT - 保存AI配置
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    const { apiKey, proxyUrl, model, smartTorrentRecognition } = await request.json();

    const aiConfig = await prisma.aiConfig.upsert({
      where: { userId: decoded.userId },
      update: {
        apiKey,
        proxyUrl,
        model,
        smartTorrentRecognition,
      },
      create: {
        userId: decoded.userId,
        apiKey,
        proxyUrl,
        model,
        smartTorrentRecognition,
      },
    });

    return NextResponse.json({ aiConfig, message: 'AI配置保存成功' });
  } catch (error) {
    console.error('保存AI配置失败:', error);
    return NextResponse.json({ error: '保存AI配置失败' }, { status: 500 });
  }
}