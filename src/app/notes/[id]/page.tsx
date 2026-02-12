'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  name: string | null
}

interface Note {
  id: string
  title: string
  content: string
  bookId: string | null
  matchingId: string | null
  book: { id: string; title: string; author: string } | null
}

interface Book {
  id: string
  title: string
  author: string
}

interface Matching {
  id: string
  book: Book
}

export default function EditNotePage() {
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedBookId, setSelectedBookId] = useState('')
  const [selectedMatchingId, setSelectedMatchingId] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [matchings, setMatchings] = useState<Matching[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch('/api/user')
      .then(res => {
        if (res.ok) return res.json()
        return null
      })
      .then(data => {
        if (data) setUser({ id: data.id, name: data.name })
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!user) return

    Promise.all([
      fetch(`/api/notes/${noteId}`).then(res => {
        if (res.ok) return res.json()
        return null
      }),
      fetch('/api/books').then(res => res.json()),
      fetch('/api/matchings').then(res => res.json()),
    ])
      .then(([noteData, booksData, matchingsData]) => {
        if (noteData) {
          setNote(noteData)
          setTitle(noteData.title || '')
          setContent(noteData.content || '')
          setSelectedBookId(noteData.bookId || '')
          setSelectedMatchingId(noteData.matchingId || '')
        }
        setBooks(booksData)

        const allMatchings = [...(matchingsData.current || []), ...(matchingsData.history || [])]
        setMatchings(allMatchings)
        setLoading(false)
      })
      .catch(err => {
        console.error('加载数据失败:', err)
        setLoading(false)
      })
  }, [user, noteId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() && !content.trim()) {
      alert('请输入标题或内容')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || '无标题笔记',
          content,
          bookId: selectedBookId || null,
          matchingId: selectedMatchingId || null,
        }),
      })

      if (res.ok) {
        router.push('/notes')
      } else {
        alert('保存失败')
      }
    } catch (err) {
      console.error('保存笔记失败:', err)
      alert('保存失败')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇笔记吗？此操作不可恢复。')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/notes')
      } else {
        alert('删除失败')
      }
    } catch (err) {
      console.error('删除笔记失败:', err)
      alert('删除失败')
    }
    setDeleting(false)
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">请先 <Link href="/login" className="text-blue-600">登录</Link></p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">笔记不存在</p>
        <Link href="/notes" className="text-blue-600 hover:underline mt-2 block">
          返回笔记列表
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/notes" className="text-gray-600 hover:text-gray-900">
          ← 返回笔记列表
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">编辑笔记</h1>
        {note.book && (
          <p className="text-sm text-gray-500 mt-1">
            📚 {note.book.title}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标题
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="输入笔记标题..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            关联书籍（可选）
          </label>
          <select
            value={selectedBookId}
            onChange={e => setSelectedBookId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">不关联书籍</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.title} - {book.author}
              </option>
            ))}
          </select>
        </div>

        {matchings.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              关联配对讨论（可选）
            </label>
            <select
              value={selectedMatchingId}
              onChange={e => setSelectedMatchingId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">不关联配对</option>
              {matchings.map(matching => (
                <option key={matching.id} value={matching.id}>
                  与 {matching.book.title} 的讨论
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            内容
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="写下你的读书感悟..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={12}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存修改'}
          </button>
          <Link
            href="/notes"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            取消
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
          >
            {deleting ? '删除中...' : '删除笔记'}
          </button>
        </div>
      </form>
    </div>
  )
}
