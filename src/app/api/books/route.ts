import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 模拟书籍数据（后续对接豆瓣/OpenLibrary）
const mockBooks = [
  { id: '1', title: '百年孤独', author: '加西亚·马尔克斯', description: '布恩迪亚家族的百年兴衰史', cover: '', source: 'douban' },
  { id: '2', title: '追风筝的人', author: '卡勒德·胡赛尼', description: '关于友谊、背叛与救赎的故事', cover: '', source: 'douban' },
  { id: '3', title: '小王子', author: '安托万·德·圣埃克苏佩里', description: '献给所有曾是孩子的大人', cover: '', source: 'douban' },
  { id: '4', title: '活着', author: '余华', description: '一个人为了活着而活着', cover: '', source: 'douban' },
  { id: '5', title: '1984', author: '乔治·奥威尔', description: '反乌托邦的经典之作', cover: '', source: 'douban' },
  { id: '6', title: '月亮与六便士', author: '毛姆', description: '理想与现实的永恒主题', cover: '', source: 'douban' },
  { id: '7', title: '人类简史', author: '尤瓦尔·赫拉利', description: '从十万年前到今天', cover: '', source: 'douban' },
  { id: '8', title: '思考，快与慢', author: '丹尼尔·卡尼曼', description: '关于思维与决策的经典著作', cover: '', source: 'douban' },
  { id: '9', title: '围城', author: '钱钟书', description: '婚姻是一座围城', cover: '', source: 'douban' },
  { id: '10', title: '平凡的世界', author: '路遥', description: '普通人的奋斗史', cover: '', source: 'douban' },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const month = searchParams.get('month')
  const userId = searchParams.get('user')

  try {
    // 搜索书籍
    if (query) {
      const results = mockBooks.filter(
        book =>
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.author.toLowerCase().includes(query.toLowerCase())
      )
      return NextResponse.json(results)
    }

    // 获取用户历史记录（按月分组）
    if (userId && !month) {
      const recommendations = await prisma.bookRecommendation.findMany({
        where: { userId },
        include: { book: true },
        orderBy: { month: 'desc' },
      })

      const readings = await prisma.monthlyReading.findMany({
        where: { userId },
        include: { book: true },
        orderBy: { month: 'desc' },
      })

      const months = new Set<string>()
      recommendations.forEach(r => months.add(r.month))
      readings.forEach(r => months.add(r.month))

      const history = Array.from(months)
        .sort((a, b) => b.localeCompare(a))
        .map(m => ({
          month: m,
          recommendation: recommendations.find(r => r.month === m) || null,
          reading: readings.find(r => r.month === m) || null,
        }))

      return NextResponse.json(history)
    }

    // 获取月份数据
    if (month && userId) {
      // 查询用户的推荐和选择
      const [userRec, userRead, recs, reads] = await Promise.all([
        prisma.bookRecommendation.findFirst({
          where: { userId, month },
          include: { book: true },
        }),
        prisma.monthlyReading.findFirst({
          where: { userId, month },
          include: { book: true },
        }),
        prisma.bookRecommendation.findMany({
          where: { month },
          include: {
            book: true,
            user: { select: { id: true, name: true, image: true } },
          },
        }),
        prisma.monthlyReading.findMany({
          where: { month },
          include: {
            book: true,
            user: { select: { id: true, name: true, image: true } },
          },
        }),
      ])

      return NextResponse.json({
        recommendation: userRec,
        reading: userRead,
        allRecommendations: recs,
        allReadings: reads,
      })
    }

    // 只获取月份的书单（不含用户信息）
    if (month) {
      const reads = await prisma.monthlyReading.findMany({
        where: { month },
        include: {
          book: true,
          user: { select: { id: true, name: true, image: true } },
        },
      })
      return NextResponse.json(reads)
    }

    // 返回所有模拟书籍
    return NextResponse.json(mockBooks)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, author, description } = body

  try {
    let book = await prisma.book.findFirst({
      where: { title, author },
    })

    if (!book) {
      book = await prisma.book.create({
        data: {
          title,
          author,
          description: description || '',
          source: 'manual',
        },
      })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '创建书籍失败' }, { status: 500 })
  }
}
