import { cookies } from 'next/headers'
import Link from 'next/link'

async function getUser() {
  const cookieStore = await cookies()
  const secondmeId = cookieStore.get('secondme_id')?.value
  const userName = cookieStore.get('user_name')?.value

  if (!secondmeId) return null

  return {
    id: secondmeId,
    name: userName || '书友',
  }
}

export default async function HomePage() {
  const user = await getUser()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          欢迎来到读书会
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          与志同道合的书友一起选书、讨论、分享阅读感悟。
          每月 8 本书，两两配对，深入交流。
        </p>
        {!user && (
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            >
              立即加入
            </Link>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">📚 共同选书</h3>
          <p className="text-gray-600">
            每月投票选出 8 本书，大家一起阅读讨论
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">🤝 配对讨论</h3>
          <p className="text-gray-600">
            系统自动配对，与书友一对一深入交流
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">✍️ 输出笔记</h3>
          <p className="text-gray-600">
            记录阅读感悟，支持导出分享
          </p>
        </div>
      </div>

      {/* User Dashboard Preview */}
      {user && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            你好，{user.name}！
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Link
              href="/books"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900">📚 选书</div>
              <div className="text-sm text-gray-500 mt-1">选择本月想读的书</div>
            </Link>
            <Link
              href="/matchings"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900">🤝 配对</div>
              <div className="text-sm text-gray-500 mt-1">查看你的书友配对</div>
            </Link>
            <Link
              href="/discussions"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900">💬 讨论</div>
              <div className="text-sm text-gray-500 mt-1">开始讨论交流</div>
            </Link>
            <Link
              href="/notes"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-lg font-medium text-gray-900">✍️ 笔记</div>
              <div className="text-sm text-gray-500 mt-1">撰写读书笔记</div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
