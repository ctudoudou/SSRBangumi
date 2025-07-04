import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - 获取下载配置
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    const downloadConfig = await prisma.downloadConfig.findUnique({
      where: { userId: decoded.userId },
    });

    if (!downloadConfig) {
      // 如果没有配置，返回默认值
      return NextResponse.json({
        downloadConfig: {
          rpcUrl: 'http://localhost:6800/jsonrpc',
          rpcSecret: '',
          downloadPath: '/downloads'
        }
      });
    }

    return NextResponse.json({ downloadConfig });
  } catch (error) {
    console.error('获取下载配置失败:', error);
    return NextResponse.json({ error: '获取下载配置失败' }, { status: 500 });
  }
}

// POST - 保存下载配置
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    const { rpcUrl, rpcSecret } = await request.json();

    const downloadConfig = await prisma.downloadConfig.upsert({
      where: { userId: decoded.userId },
      update: {
        rpcUrl,
        rpcSecret,
      },
      create: {
        userId: decoded.userId,
        rpcUrl,
        rpcSecret,
        downloadPath: '/downloads', // 固定下载路径
      },
    });

    return NextResponse.json({ downloadConfig, message: '下载配置保存成功' });
  } catch (error) {
    console.error('保存下载配置失败:', error);
    return NextResponse.json({ error: '保存下载配置失败' }, { status: 500 });
  }
}