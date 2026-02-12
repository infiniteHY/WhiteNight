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

// GET /api/notes - 获取用户的笔记列表
export async function GET(request: NextRequest) {
  const user = await getUserFromCookie(request)
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    include: {
      book: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(notes)
}

// POST /api/notes - 创建笔记
export async function POST(request: NextRequest) {
  const user = await getUserFromCookie(request)
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = await request.json()
  const { title, content, bookId, matchingId } = body

  if (!title || !title.trim()) {
    return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
  }

  // 如果没有 bookId，需要先创建或获取书籍
  let book = null
  if (bookId) {
    book = await prisma.book.findUnique({ where: { id: bookId } })
  } else if (body.bookTitle && body.bookAuthor) {
    book = await prisma.book.findFirst({
      where: {
        title: body.bookTitle,
        author: body.bookAuthor,
      },
    })
    if (!book) {
      book = await prisma.book.create({
        data: {
          title: body.bookTitle,
          author: body.bookAuthor,
        },
      })
    }
  }

  if (!book) {
    // 创建一个默认书籍
    book = await prisma.book.create({
      data: {
        title: '未分类',
        author: '未知',
      },
    })
  }

  const note = await prisma.note.create({
    data: {
      userId: user.id,
      bookId: book.id,
      title: title.trim(),
      content: content || '',
      matchingId: matchingId || null,
    },
    include: {
      book: true,
    },
  })

  return NextResponse.json(note)
}
