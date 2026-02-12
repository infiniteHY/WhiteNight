'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Partner {
  id: string
  name: string | null
  image: string | null
}

interface Book {
  id: string
  title: string
  author: string
}

interface Matching {
  id: string
  partner: Partner
  book: Book
  status: string
  month: string
  updatedAt: string | null
}

interface MonthGroup {
  month: string
  matchings: Matching[]
}

export default function DiscussionsPage() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)
  const [monthGroups, setMonthGroups] = useState<MonthGroup[]>([])
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser({ id: data.id, name: data.name || '书友' })
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!user) return
    fetch('/api/matchings')
      .then(res => res.ok ? res.json() : { current: [], history: [] })
      .then(data => {
        const allMatchings = [...(data.current || []), ...(data.history || [])]
        const activeMatchings = allMatchings.filter((m: Matching) => m.status === 'ACTIVE')

        const monthMap = new Map<string, Matching[]>()
        activeMatchings.forEach(m => {
          if (!monthMap.has(m.month)) {
            monthMap.set(m.month, [])
          }
          monthMap.get(m.month)!.push(m)
        })

        const groups: MonthGroup[] = Array.from(monthMap.entries())
          .map(([month, matchings]) => ({ month, matchings }))
          .sort((a, b) => b.month.localeCompare(a.month))

        setMonthGroups(groups)

        if (groups.length > 0) {
          setExpandedMonths(new Set([groups[0].month]))
        }

        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(month)) {
        newSet.delete(month)
      } else {
        newSet.add(month)
      }
      return newSet
    })
  }

  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  const currentMonth = getCurrentMonth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💬</span>
          </div>
          <p className="text-gray-600 text-lg mb-4">请先登录后查看讨论</p>
          <Link href="/login" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg">
            前往登录
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                💬 讨论
              </h1>
              <p className="text-gray-500 mt-1">与书友分享阅读心得</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium shadow-lg">
              {user.name?.[0] || '?'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : monthGroups.length > 0 ? (
          <div className="space-y-4">
            {monthGroups.map(group => {
              const isExpanded = expandedMonths.has(group.month)
              const isCurrentMonth = group.month === currentMonth

              return (
                <div key={group.month} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Month Header */}
                  <button
                    onClick={() => toggleMonth(group.month)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between hover:from-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrentMonth ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-gray-300 to-gray-400'}`}>
                        <span className="text-white text-lg">{isExpanded ? '▼' : '▶'}</span>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 text-lg">{group.month}</span>
                          {isCurrentMonth && (
                            <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs rounded-full font-medium">
                              本月
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{group.matchings.length} 个讨论</p>
                      </div>
                    </div>
                  </button>

                  {/* Matchings List */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-100">
                      {group.matchings.map(matching => (
                        <Link
                          key={matching.id}
                          href={`/discussions/${matching.id}`}
                          className="block p-5 bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-lg shadow-md flex-shrink-0">
                              {matching.partner.name?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">
                                  {matching.partner.name || '书友'}
                                </h3>
                                <span className="text-sm text-gray-400">{matching.month}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xl">📚</span>
                                <p className="text-gray-600 truncate">{matching.book.title}</p>
                              </div>
                              <p className="text-sm text-gray-400 mt-1 truncate">{matching.book.author}</p>
                              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {matching.status === 'ACTIVE' ? '继续讨论' : '查看记录'}
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无讨论</h3>
            <p className="text-gray-500 mb-6">完成配对后即可开始讨论</p>
            <Link href="/matchings" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg">
              前往配对
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
