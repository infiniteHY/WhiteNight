import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/by-book - 获取选择某本书的所有用户
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const bookId = searchParams.get('bookId')
  const month = searchParams.get('month')

  if (!bookId || !month) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
  }

  // 获取所有选择该书作为本月读物的用户
  const readings = await prisma.monthlyReading.findMany({
    where: {
      bookId,
      month,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const users = readings.map(r => ({
    ...r.user,
    selectedAt: r.createdAt,
  }))

  return NextResponse.json(users)
}
