import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 辅助函数：从 cookie 获取用户
async function getUserFromCookie(request: NextRequest) {
  const secondmeId = request.cookies.get('secondme_id')?.value
  if (!secondmeId) return null

  let user = await prisma.user.findUnique({
    where: { secondMeId: secondmeId },
  })

  if (!user) {
    const userName = request.cookies.get('user_name')?.value || 'User'
    user = await prisma.user.create({
      data: {
        secondMeId: secondmeId,
        name: userName,
      },
    })
  }

  return user
}

// GET /api/discussions/[id] - 获取讨论详情和消息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromCookie(request)
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { id } = await params

  // 获取配对信息
  const matching = await prisma.matching.findUnique({
    where: { id },
    include: {
      book: true,
      user: {
        select: { id: true, name: true, image: true },
      },
      partner: {
        select: { id: true, name: true, image: true },
      },
    },
  })

  if (!matching) {
    return NextResponse.json({ error: '配对不存在' }, { status: 404 })
  }

  // 验证用户是否参与此配对
  if (matching.userId !== user.id && matching.partnerId !== user.id) {
    return NextResponse.json({ error: '无权访问此讨论' }, { status: 403 })
  }

  // 获取消息列表
  const messages = await prisma.chatMessage.findMany({
    where: { matchingId: id },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({
    matching,
    messages,
  })
}

// POST /api/discussions/[id]/messages - 发送消息
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromCookie(request)
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { content } = body

  if (!content || !content.trim()) {
    return NextResponse.json({ error: '消息内容不能为空' }, { status: 400 })
  }

  // 验证配对存在且用户参与
  const matching = await prisma.matching.findUnique({
    where: { id },
  })

  if (!matching) {
    return NextResponse.json({ error: '配对不存在' }, { status: 404 })
  }

  if (matching.userId !== user.id && matching.partnerId !== user.id) {
    return NextResponse.json({ error: '无权在此讨论中发言' }, { status: 403 })
  }

  // 创建消息
  const message = await prisma.chatMessage.create({
    data: {
      matchingId: id,
      userId: user.id,
      content: content.trim(),
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  })

  return NextResponse.json(message)
}
