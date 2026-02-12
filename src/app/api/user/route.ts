import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user/me - 获取当前用户信息
export async function GET(request: NextRequest) {
  const secondmeId = request.cookies.get('secondme_id')?.value
  const userName = request.cookies.get('user_name')?.value
  const userAvatar = request.cookies.get('user_avatar')?.value

  if (!secondmeId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  // 查找或创建用户
  let user = await prisma.user.findUnique({
    where: { secondMeId: secondmeId },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        secondMeId: secondmeId,
        name: userName || 'User',
        image: userAvatar,
      },
    })
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    bio: user.bio,
    secondMeId: user.secondMeId,
  })
}

// PUT /api/user - 更新用户信息
export async function PUT(request: NextRequest) {
  const secondmeId = request.cookies.get('secondme_id')?.value

  if (!secondmeId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = await request.json()
  const { bio } = body

  const user = await prisma.user.findUnique({
    where: { secondMeId: secondmeId },
  })

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      bio,
    },
  })

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    image: updated.image,
    bio: updated.bio,
  })
}

// POST /api/user/logout - 退出登录
export async function POST() {
  const response = NextResponse.json({ success: true })

  // 清除所有相关的 cookie
  response.cookies.set('secondme_id', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })
  response.cookies.set('user_name', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })
  response.cookies.set('user_avatar', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })

  return response
}
