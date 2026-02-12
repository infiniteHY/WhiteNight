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

// POST /api/books/select - 选择一本书作为本月读物
export async function POST(request: NextRequest) {
  const user = await getUserFromCookie(request)
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = await request.json()
  const { bookId, month } = body

  if (!bookId || !month) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
  }

  // 检查书籍是否存在
  const book = await prisma.book.findUnique({
    where: { id: bookId },
  })

  if (!book) {
    return NextResponse.json({ error: '书籍不存在' }, { status: 404 })
  }

  // 检查是否已有选择
  const existing = await prisma.monthlyReading.findFirst({
    where: {
      userId: user.id,
      month,
    },
  })

  if (existing) {
    // 更新选择
    const updated = await prisma.monthlyReading.update({
      where: { id: existing.id },
      data: {
        bookId,
      },
      include: {
        book: true,
      },
    })
    return NextResponse.json(updated)
  }

  // 创建新选择
  const reading = await prisma.monthlyReading.create({
    data: {
      userId: user.id,
      bookId,
      month,
    },
    include: {
      book: true,
    },
  })

  return NextResponse.json(reading)
}

// DELETE /api/books/select - 取消选择
export async function DELETE(request: NextRequest) {
  const user = await getUserFromCookie(request)
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const month = searchParams.get('month')

  if (!month) {
    return NextResponse.json({ error: '缺少月份参数' }, { status: 400 })
  }

  await prisma.monthlyReading.deleteMany({
    where: {
      userId: user.id,
      month,
    },
  })

  return NextResponse.json({ success: true })
}
