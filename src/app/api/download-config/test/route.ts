import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// POST - 测试aria2连接
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

    const { rpcUrl, rpcSecret } = await request.json();

    if (!rpcUrl) {
      return NextResponse.json({ error: 'RPC URL 不能为空' }, { status: 400 });
    }

    // 构建aria2 JSON-RPC请求
    const rpcRequest = {
      jsonrpc: '2.0',
      method: 'aria2.getVersion',
      id: 'test-connection',
      params: rpcSecret ? [`token:${rpcSecret}`] : []
    };

    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rpcRequest),
        signal: AbortSignal.timeout(5000), // 5秒超时
      });

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: `HTTP错误: ${response.status} ${response.statusText}`
        });
      }

      const result = await response.json();

      if (result.error) {
        return NextResponse.json({
          success: false,
          error: `aria2错误: ${result.error.message || result.error.code}`
        });
      }

      if (result.result && result.result.version) {
        return NextResponse.json({
          success: true,
          message: `连接成功! aria2版本: ${result.result.version}`,
          version: result.result.version
        });
      }

      return NextResponse.json({
        success: false,
        error: '未知的响应格式'
      });

    } catch (fetchError: any) {
      if (fetchError.name === 'TimeoutError') {
        return NextResponse.json({
          success: false,
          error: '连接超时，请检查aria2服务是否运行或URL是否正确'
        });
      }

      return NextResponse.json({
        success: false,
        error: `连接失败: ${fetchError.message}`
      });
    }

  } catch (error) {
    console.error('测试aria2连接失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '测试连接时发生内部错误' 
    }, { status: 500 });
  }
}