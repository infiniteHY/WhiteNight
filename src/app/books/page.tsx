'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  author: string
  description?: string
  cover?: string
}

interface UserData {
  id: string
  name: string | null
  image: string | null
}

interface UserRecommendation {
  id: string
  book: Book
  month: string
}

interface UserReading {
  id: string
  book: Book
  month: string
}

interface AllRecommendation {
  id: string
  book: Book
  user: {
    id: string
    name: string | null
    image: string | null
  }
  month: string
}

interface AllReading {
  id: string
  book: Book
  user: {
    id: string
    name: string | null
    image: string | null
  }
  month: string
}

interface MonthlyData {
  recommendation: UserRecommendation | null
  reading: UserReading | null
  allRecommendations: AllRecommendation[]
  allReadings: AllReading[]
}

interface HistoryRecord {
  month: string
  recommendation: UserRecommendation | null
  reading: UserReading | null
}

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Book Card Component
function BookCard({
  book,
  actions,
  showActions = true
}: {
  book: Book
  actions?: React.ReactNode
  showActions?: boolean
}) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-5">
        <div className="flex gap-4">
          <div className="w-16 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📚</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-lg leading-tight mb-1 truncate">{book.title}</h4>
            <p className="text-sm text-gray-500 mb-2">{book.author}</p>
            {book.description && (
              <p className="text-sm text-gray-400 line-clamp-2">{book.description}</p>
            )}
          </div>
        </div>
        {showActions && actions && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// User Book Card Component
function UserBookCard({
  book,
  label,
  labelColor,
  onCancel,
  showCancel = false
}: {
  book: Book
  label: string
  labelColor: string
  onCancel?: () => void
  showCancel?: boolean
}) {
  return (
    <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className={`h-1.5 ${labelColor}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${labelColor.replace('bg-', 'bg-opacity-20 text-').replace('500', '700')}`}>
            {label}
          </span>
          {showCancel && onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <div className="w-12 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📖</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 leading-tight mb-1">{book.title}</h4>
            <p className="text-sm text-gray-500">{book.author}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// User List Item Component
function UserListItem({
  user,
  book,
  avatarColor = 'bg-blue-100',
  icon = '👤'
}: {
  user: { name: string | null }
  book: { title: string; author: string }
  avatarColor?: string
  icon?: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className={`w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center text-lg shadow-sm`}>
        {user.name?.[0] || icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{user.name || '书友'}</p>
        <p className="text-sm text-gray-500 truncate">{book.title} · {book.author}</p>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">📭</span>
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  )
}

// Loading Spinner
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )
}

export default function BooksPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBook, setNewBook] = useState({ title: '', author: '', description: '' })

  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null)
  const [history, setHistory] = useState<HistoryRecord[]>([])

  const currentMonth = getCurrentMonth()
  const isCurrentMonth = selectedMonth === currentMonth

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser({ id: data.id, name: data.name || '书友', image: data.image })
      })
      .catch(console.error)
  }, [])

  const loadMonthData = useCallback(async (month: string) => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/books?month=${month}&user=${user.id}`)
      if (!res.ok) {
        setMonthlyData(null)
        return
      }
      const text = await res.text()
      if (!text) {
        setMonthlyData(null)
        return
      }
      const data = JSON.parse(text)
      setMonthlyData(data)
    } catch {
      setMonthlyData(null)
    }
    setLoading(false)
  }, [user])

  const loadHistory = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/books?user=${user.id}`)
      if (!res.ok) {
        setHistory([])
        return
      }
      const text = await res.text()
      if (!text) {
        setHistory([])
        return
      }
      const data = JSON.parse(text)
      setHistory(Array.isArray(data) ? data : [])
    } catch {
      setHistory([])
    }
  }, [user])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user) {
      loadMonthData(selectedMonth)
      loadHistory()
    }
  }, [user, selectedMonth])

  const searchBooks = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/books?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data)
    } catch {
      setSearchResults([])
    }
    setSearching(false)
  }

  const addNewBook = async () => {
    if (!newBook.title.trim() || !newBook.author.trim()) {
      alert('请填写书名和作者')
      return
    }

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      })

      if (res.ok) {
        const book = await res.json()
        setSearchResults(prev => [...prev, book])
        setNewBook({ title: '', author: '', description: '' })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('添加书籍失败:', error)
    }
  }

  const recommendBook = async (bookId: string) => {
    if (!selectedMonth) return
    try {
      const res = await fetch('/api/books/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, month: selectedMonth }),
      })
      if (res.ok) {
        loadMonthData(selectedMonth)
        alert('推荐成功！')
      } else {
        const err = await res.json()
        alert(err.error || '推荐失败')
      }
    } catch (error) {
      console.error('推荐失败:', error)
    }
  }

  const selectBook = async (bookId: string) => {
    if (!selectedMonth) return
    try {
      const res = await fetch('/api/books/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, month: selectedMonth }),
      })
      if (res.ok) {
        loadMonthData(selectedMonth)
        loadHistory()
        alert('选择成功！')
      } else {
        const err = await res.json()
        alert(err.error || '选择失败')
      }
    } catch (error) {
      console.error('选择失败:', error)
    }
  }

  const cancelRecommendation = async () => {
    try {
      await fetch(`/api/books/recommend?month=${selectedMonth}`, { method: 'DELETE' })
      loadMonthData(selectedMonth)
    } catch (error) {
      console.error('取消推荐失败:', error)
    }
  }

  const cancelSelection = async () => {
    try {
      await fetch(`/api/books/select?month=${selectedMonth}`, { method: 'DELETE' })
      loadMonthData(selectedMonth)
      loadHistory()
    } catch (error) {
      console.error('取消选择失败:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <p className="text-gray-600 text-lg mb-4">请先登录后选书</p>
          <Link href="/login" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
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
                📚 选书
              </h1>
              <p className="text-gray-500 mt-1">发现好书，分享阅读乐趣</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium shadow-lg">
                {user.name?.[0] || '?'}
              </div>
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
                  }}
                  className="mt-1 block w-40 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchBooks()}
                placeholder="搜索书名或作者..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={searchBooks}
              disabled={searching}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
            >
              {searching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  搜索
                </>
              )}
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加书籍
            </button>
          </div>

          {showAddForm && (
            <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>✨</span> 添加新书籍
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={newBook.title}
                  onChange={e => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="书名 *"
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={newBook.author}
                  onChange={e => setNewBook(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="作者 *"
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={newBook.description}
                  onChange={e => setNewBook(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简介（可选）"
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={addNewBook}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
              >
                确认添加
              </button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - User Actions */}
          <div className="space-y-6">
            {/* My Recommendation */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📖</span> 本月我想读
              </h3>
              {loading ? (
                <LoadingSpinner />
              ) : monthlyData?.recommendation ? (
                <UserBookCard
                  book={monthlyData.recommendation.book}
                  label="我的推荐"
                  labelColor="bg-blue-500"
                  onCancel={cancelRecommendation}
                  showCancel={isCurrentMonth}
                />
              ) : (
                <EmptyState message="还没有推荐书籍" />
              )}
            </div>

            {/* My Selection */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📕</span> 本月已选
              </h3>
              {loading ? (
                <LoadingSpinner />
              ) : monthlyData?.reading ? (
                <UserBookCard
                  book={monthlyData.reading.book}
                  label="我的选择"
                  labelColor="bg-purple-500"
                  onCancel={cancelSelection}
                  showCancel={isCurrentMonth}
                />
              ) : (
                <EmptyState message="还没有选择本月读物" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🔍</span> 搜索结果
                  <span className="ml-auto text-sm text-gray-500">{searchResults.length} 本</span>
                </h3>
                <div className="space-y-4">
                  {searchResults.map(book => (
                    <BookCard
                      key={book.id}
                      book={book}
                      showActions={isCurrentMonth}
                      actions={
                        <>
                          <button
                            onClick={() => recommendBook(book.id)}
                            className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                          >
                            推荐
                          </button>
                          <button
                            onClick={() => selectBook(book.id)}
                            className="flex-1 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                          >
                            选择
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Community */}
          <div className="space-y-6">
            {/* Community Selections */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🏆</span> 本月选书结果
                {monthlyData && monthlyData.allReadings.length > 0 && (
                  <span className="ml-auto px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full text-xs font-medium">
                    {monthlyData.allReadings.length} 人参与
                  </span>
                )}
              </h3>
              {loading ? (
                <LoadingSpinner />
              ) : monthlyData && monthlyData.allReadings.length > 0 ? (
                <div className="space-y-2">
                  {monthlyData.allReadings.map(reading => (
                    <UserListItem
                      key={reading.id}
                      user={reading.user}
                      book={reading.book}
                      avatarColor="bg-gradient-to-br from-amber-400 to-orange-500"
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="本月还没有人选书" />
              )}
            </div>

            {/* Community Recommendations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📚</span> 本月推荐
              </h3>
              {loading ? (
                <LoadingSpinner />
              ) : monthlyData && monthlyData.allRecommendations.length > 0 ? (
                <div className="space-y-2">
                  {monthlyData.allRecommendations.map(rec => (
                    <UserListItem
                      key={rec.id}
                      user={rec.user}
                      book={rec.book}
                      avatarColor="bg-gradient-to-br from-green-400 to-emerald-500"
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="本月还没有人推荐书籍" />
              )}
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📅</span> 阅读历史
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map(record => (
                <div
                  key={record.month}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">{record.month}</span>
                    {record.reading && (
                      <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs">
                        已选
                      </span>
                    )}
                  </div>
                  {record.recommendation && (
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-sm">📖</span>
                      <div>
                        <p className="text-sm text-gray-600 truncate">{record.recommendation.book.title}</p>
                        <p className="text-xs text-gray-400">{record.recommendation.book.author}</p>
                      </div>
                    </div>
                  )}
                  {record.reading && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm">📕</span>
                      <div>
                        <p className="text-sm text-gray-600 truncate">{record.reading.book.title}</p>
                        <p className="text-xs text-gray-400">{record.reading.book.author}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
