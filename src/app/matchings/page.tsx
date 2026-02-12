'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Partner {
  id: string
  name: string | null
  image: string | null
  bio?: string | null
}

interface Book {
  id: string
  title: string
  author: string
  cover?: string
  description?: string
}

interface Matching {
  id: string
  partner: Partner
  book: Book
  status: string
  month: string
}

interface BookWithReaders {
  book: Book
  readers: Array<{
    id: string
    name: string | null
    image: string | null
    bio: string | null
    selectedAt: string
  }>
  readerCount: number
}

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// User Avatar Component
function UserAvatar({
  name,
  image,
  size = 'md',
  gradient = 'from-indigo-500 to-purple-600'
}: {
  name: string | null
  image?: string | null
  size?: 'sm' | 'md' | 'lg'
  gradient?: string
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl'
  }

  return (
    <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-white font-medium shadow-md ${sizeClasses[size]}`}>
      {image ? (
        <img src={image} alt={name || ''} className="w-full h-full rounded-full object-cover" />
      ) : (
        name?.[0] || '?'
      )}
    </div>
  )
}

// Matching Card Component
function MatchingCard({
  matching,
  isCurrent = false
}: {
  matching: Matching
  isCurrent?: boolean
}) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-700' }
  }
  const status = statusColors[matching.status] || statusColors.ACTIVE

  return (
    <div className={`relative bg-white rounded-2xl shadow-sm border transition-all duration-300 ${isCurrent ? 'border-indigo-200 hover:shadow-lg' : 'border-gray-100'}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isCurrent ? 'from-indigo-500 to-purple-600' : 'from-gray-300 to-gray-400'}`} />
      <div className="p-5">
        <div className="flex items-start gap-4">
          <UserAvatar name={matching.partner.name} gradient="from-amber-400 to-orange-500" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{matching.partner.name || '书友'}</h4>
                <p className="text-sm text-gray-500 mt-1">{matching.book.title}</p>
                <p className="text-xs text-gray-400">{matching.book.author}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                {matching.status === 'ACTIVE' ? '进行中' : '已完成'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          <Link
            href={`/discussions/${matching.id}`}
            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-center hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {matching.status === 'ACTIVE' ? '开始讨论' : '查看记录'}
          </Link>
        </div>
      </div>
    </div>
  )
}

// Book Selection Card
function BookSelectionCard({
  bookData,
  selected,
  onSelect
}: {
  bookData: BookWithReaders
  selected: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
        selected
          ? 'border-indigo-500 bg-indigo-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="w-12 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md flex items-center justify-center flex-shrink-0">
          <span className="text-xl">📚</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{bookData.book.title}</h4>
          <p className="text-sm text-gray-500">{bookData.book.author}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              {bookData.readerCount} 人选择
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Partner Selection Card
function PartnerSelectionCard({
  partner,
  selected,
  onSelect
}: {
  partner: {
    id: string
    name: string | null
    bio: string | null
  }
  selected: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
        selected
          ? 'border-green-500 bg-green-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-3">
        <UserAvatar name={partner.name} gradient="from-green-400 to-emerald-500" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{partner.name || '书友'}</h4>
          <p className="text-sm text-gray-500 truncate">{partner.bio || '暂无简介'}</p>
        </div>
        {selected && (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

// Empty State
function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  )
}

// Loading Spinner
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )
}

export default function MatchingsPage() {
  const [user, setUser] = useState<{
    id: string
    name: string | null
    image: string | null
    bio: string | null
  } | null>(null)
  const [currentMatchings, setCurrentMatchings] = useState<Matching[]>([])
  const [historyMatchings, setHistoryMatchings] = useState<Matching[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [booksWithReaders, setBooksWithReaders] = useState<BookWithReaders[]>([])
  const [selectedBook, setSelectedBook] = useState<BookWithReaders | null>(null)
  const [matchingPartnerId, setMatchingPartnerId] = useState<string | null>(null)
  const [matchingBookId, setMatchingBookId] = useState<string | null>(null)
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [bioText, setBioText] = useState('')

  const currentMonth = getCurrentMonth()

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setUser({
            id: data.id,
            name: data.name,
            image: data.image,
            bio: data.bio || null
          })
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!user) return
    fetch('/api/matchings')
      .then(res => res.ok ? res.json() : { current: [], history: [] })
      .then(data => {
        setCurrentMatchings(data.current || [])
        setHistoryMatchings(data.history || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  const loadMonthData = useCallback(async (month: string) => {
    if (!user) return
    try {
      const res = await fetch(`/api/books?month=${month}`)
      const text = await res.text()
      if (!text) {
        setBooksWithReaders([])
        return
      }
      const data = JSON.parse(text)
      if (Array.isArray(data)) {
        const bookMap = new Map<string, BookWithReaders>()
        data.forEach((reading: { bookId: string; book: Book; user?: { id: string; name: string | null; image: string | null; bio?: string | null }; createdAt: string }) => {
          const bookId = reading.bookId
          if (!bookMap.has(bookId)) {
            bookMap.set(bookId, { book: reading.book, readers: [], readerCount: 0 })
          }
          const bookData = bookMap.get(bookId)!
          if (reading.user && reading.user.id !== user.id) {
            bookData.readers.push({
              id: reading.user.id,
              name: reading.user.name,
              image: reading.user.image,
              bio: reading.user.bio ?? null,
              selectedAt: reading.createdAt
            })
            bookData.readerCount += 1
          }
        })
        const sortedBooks = Array.from(bookMap.values())
          .filter(b => b.readers.length > 0)
          .sort((a, b) => b.readerCount - a.readerCount)
        setBooksWithReaders(sortedBooks)
      } else {
        setBooksWithReaders([])
      }
    } catch {
      setBooksWithReaders([])
    }
  }, [user])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user) {
      loadMonthData(selectedMonth)
    }
  }, [user])

  const createMatching = async () => {
    if (!matchingPartnerId || !matchingBookId || !selectedMonth) {
      alert('请选择要配对的书友和书籍')
      return
    }
    setMatchingLoading(true)
    try {
      const res = await fetch('/api/matchings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: matchingPartnerId,
          bookId: matchingBookId,
          month: selectedMonth
        })
      })
      if (res.ok) {
        alert('配对成功！')
        setSelectedBook(null)
        setMatchingPartnerId(null)
        setMatchingBookId(null)
        fetch('/api/matchings')
          .then(res => res.json())
          .then(data => {
            setCurrentMatchings(data.current || [])
            setHistoryMatchings(data.history || [])
          })
      } else {
        const err = await res.json()
        alert(err.error || '配对失败')
      }
    } catch {
      alert('配对失败')
    }
    setMatchingLoading(false)
  }

  const saveBio = async () => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bioText })
      })
      if (res.ok) {
        setUser(prev => prev ? { ...prev, bio: bioText } : null)
        setEditingBio(false)
      }
    } catch (error) {
      console.error('保存简介失败:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🤝</span>
          </div>
          <p className="text-gray-600 text-lg mb-4">请先登录后查看配对</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🤝 配对
              </h1>
              <p className="text-gray-500 mt-1">寻找志同道合的书友</p>
            </div>
            <div className="flex items-center gap-3">
              <UserAvatar name={user.name} gradient="from-indigo-500 to-purple-600" size="lg" />
              <span className="text-gray-700 font-medium">{user.name || '书友'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Month Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">查看月份</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => {
                    setSelectedMonth(e.target.value)
                    loadMonthData(e.target.value)
                    setSelectedBook(null)
                    setMatchingPartnerId(null)
                  }}
                  className="mt-1 block w-40 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            {selectedMonth !== currentMonth && (
              <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                历史记录
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Create Matching */}
          <div className="space-y-6">
            {/* My Profile */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>👤</span> 我的简介
              </h3>
              <div className="flex items-start gap-4">
                <UserAvatar name={user.name} gradient="from-blue-500 to-indigo-600" size="lg" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.name || '书友'}</p>
                  {editingBio ? (
                    <div className="mt-3">
                      <textarea
                        value={bioText}
                        onChange={e => setBioText(e.target.value)}
                        placeholder="介绍一下自己吧..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={saveBio}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingBio(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mt-1">{user.bio || '这个人很懒，什么都没写...'}</p>
                      <button
                        onClick={() => {
                          setBioText(user.bio || '')
                          setEditingBio(true)
                        }}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        {user.bio ? '编辑简介' : '添加简介'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Select Book */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📚</span> 选择书籍
                <span className="ml-auto text-sm text-gray-500">点击查看选择该书的书友</span>
              </h3>
              {loading ? (
                <LoadingSpinner />
              ) : booksWithReaders.length > 0 ? (
                <div className="space-y-3">
                  {booksWithReaders.map(bookData => (
                    <BookSelectionCard
                      key={bookData.book.id}
                      bookData={bookData}
                      selected={selectedBook?.book.id === bookData.book.id}
                      onSelect={() => {
                        setSelectedBook(bookData)
                        setMatchingBookId(bookData.book.id)
                        setMatchingPartnerId(null)
                      }}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState icon="📚" message="本月还没有书友选择书籍" />
              )}
            </div>

            {/* Select Partner */}
            {selectedBook && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>👥</span> 选择 {selectedBook.book.title} 的书友
                </h3>
                <div className="space-y-3">
                  {selectedBook.readers.map(reader => (
                    <PartnerSelectionCard
                      key={reader.id}
                      partner={reader}
                      selected={matchingPartnerId === reader.id}
                      onSelect={() => setMatchingPartnerId(reader.id)}
                    />
                  ))}
                </div>
                <button
                  onClick={createMatching}
                  disabled={!matchingPartnerId || matchingLoading}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {matchingLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      发起配对
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Matchings */}
          <div className="space-y-6">
            {/* Current Month Matchings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>💬</span> 本月配对
                {currentMatchings.length > 0 && (
                  <span className="ml-auto px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-medium">
                    {currentMatchings.length} 个
                  </span>
                )}
              </h3>
              {loading ? (
                <LoadingSpinner />
              ) : currentMatchings.length > 0 ? (
                <div className="space-y-4">
                  {currentMatchings.map(matching => (
                    <MatchingCard key={matching.id} matching={matching} isCurrent />
                  ))}
                </div>
              ) : (
                <EmptyState icon="🤝" message="本月还没有配对" />
              )}
            </div>

            {/* History Matchings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📜</span> 历史配对
                {historyMatchings.length > 0 && (
                  <span className="ml-auto px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {historyMatchings.length} 个
                  </span>
                )}
              </h3>
              {loading ? (
                <LoadingSpinner />
              ) : historyMatchings.length > 0 ? (
                <div className="space-y-3">
                  {historyMatchings.map(matching => (
                    <MatchingCard key={matching.id} matching={matching} />
                  ))}
                </div>
              ) : (
                <EmptyState icon="📜" message="暂无历史配对" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
