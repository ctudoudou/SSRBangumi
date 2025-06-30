import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: '登出成功' },
      { status: 200 }
    )

    // 清除 auth-token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // 立即过期
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}