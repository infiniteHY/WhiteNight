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

// GET /api/notes/[id] - 获取单条笔记
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromCookie(request)
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { id } = await params

  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      book: true,
      matching: {
        include: {
          book: true,
          user: { select: { id: true, name: true } },
          partner: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!note) {
    return NextResponse.json({ error: '笔记不存在' }, { status: 404 })
  }

  // 验证是否是笔记所有者
  if (note.userId !== user.id) {
    return NextResponse.json({ error: '无权访问此笔记' }, { status: 403 })
  }

  return NextResponse.json(note)
}

// PUT /api/notes/[id] - 更新笔记
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromCookie(request)
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { title, content } = body

  // 验证笔记存在且属于当前用户
  const existingNote = await prisma.note.findUnique({
    where: { id },
  })

  if (!existingNote) {
    return NextResponse.json({ error: '笔记不存在' }, { status: 404 })
  }

  if (existingNote.userId !== user.id) {
    return NextResponse.json({ error: '无权修改此笔记' }, { status: 403 })
  }

  const note = await prisma.note.update({
    where: { id },
    data: {
      title: title ? title.trim() : existingNote.title,
      content: content !== undefined ? content : existingNote.content,
    },
    include: {
      book: true,
    },
  })

  return NextResponse.json(note)
}

// DELETE /api/notes/[id] - 删除笔记
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromCookie(request)
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { id } = await params

  const note = await prisma.note.findUnique({
    where: { id },
  })

  if (!note) {
    return NextResponse.json({ error: '笔记不存在' }, { status: 404 })
  }

  if (note.userId !== user.id) {
    return NextResponse.json({ error: '无权删除此笔记' }, { status: 403 })
  }

  await prisma.note.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
