import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    // 验证输入
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '用户名、邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      )
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: '该用户名已被使用' },
        { status: 409 }
      )
    }

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true
      }
    })

    // 生成 JWT token
    const token = generateToken(user.id)

    // 创建响应
    const response = NextResponse.json(
      {
        message: '注册成功',
        user
      },
      { status: 201 }
    )

    // 设置 HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}