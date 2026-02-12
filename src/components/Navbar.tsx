'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string | null
  image: string | null
}

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取用户信息
    fetch('/api/user')
      .then(res => {
        if (res.ok) return res.json()
        return null
      })
      .then(data => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/user', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              读书会
            </Link>
            <div className="hidden md:flex md:ml-10 md:space-x-8">
              <Link href="/books" className="text-gray-600 hover:text-blue-600 px-3 py-2">
                选书
              </Link>
              <Link href="/matchings" className="text-gray-600 hover:text-blue-600 px-3 py-2">
                配对
              </Link>
              <Link href="/discussions" className="text-gray-600 hover:text-blue-600 px-3 py-2">
                讨论
              </Link>
              <Link href="/notes" className="text-gray-600 hover:text-blue-600 px-3 py-2">
                笔记
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {loading ? (
              <span className="text-gray-400">加载中...</span>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.name || '书友'}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  退出
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-blue-600 hover:text-blue-700">
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
