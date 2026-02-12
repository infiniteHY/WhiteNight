import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 辅助函数：获取当前月份
function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// 辅助函数：从 cookie 获取用户
async function getUserFromCookie(request: NextRequest) {
  const secondmeId = request.cookies.get('secondme_id')?.value
  if (!secondmeId) return null

  let user = await prisma.user.findUnique({
    where: { secondMeId: secondmeId },
  })

  // 如果用户不存在，创建一个
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

// GET /api/matchings - 获取用户的配对列表
export async function GET(request: NextRequest) {
  const user = await getUserFromCookie(request)
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const month = searchParams.get('month') || getCurrentMonth()

  // 获取当月配对
  const matchings = await prisma.matching.findMany({
    where: {
      OR: [
        { userId: user.id },
        { partnerId: user.id },
      ],
      month,
    },
    include: {
      book: true,
      user: {
        select: { id: true, name: true, image: true },
      },
      partner: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // 格式化返回数据
  const formattedMatchings = matchings.map(m => {
    const isUser = m.userId === user.id
    return {
      id: m.id,
      partner: isUser ? m.partner : m.user,
      book: m.book,
      status: m.status,
      month: m.month,
      isUserInitiator: isUser,
    }
  })

  // 获取历史配对（之前月份）
  const historyMatchings = await prisma.matching.findMany({
    where: {
      OR: [
        { userId: user.id },
        { partnerId: user.id },
      ],
      NOT: { month },
    },
    include: {
      book: true,
      user: {
        select: { id: true, name: true, image: true },
      },
      partner: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const formattedHistory = historyMatchings.map(m => {
    const isUser = m.userId === user.id
    return {
      id: m.id,
      partner: isUser ? m.partner : m.user,
      book: m.book,
      status: m.status,
      month: m.month,
    }
  })

  return NextResponse.json({
    current: formattedMatchings,
    history: formattedHistory,
  })
}

// POST /api/matchings/generate - 生成配对（强制分配）
export async function POST(request: NextRequest) {
  const user = await getUserFromCookie(request)
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = await request.json()
  const { bookId, partnerId } = body
  const month = body.month || getCurrentMonth()

  // 检查是否已存在配对
  const existing = await prisma.matching.findFirst({
    where: {
      OR: [
        { userId: user.id, partnerId, month },
        { userId: partnerId, partnerId: user.id, month },
      ],
    },
  })

  if (existing) {
    return NextResponse.json({ error: '配对已存在' }, { status: 400 })
  }

  // 创建配对
  const matching = await prisma.matching.create({
    data: {
      userId: user.id,
      partnerId,
      bookId,
      month,
      status: 'ACTIVE',
    },
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

  return NextResponse.json(matching)
}
