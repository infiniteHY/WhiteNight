'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  name: string | null
}

interface Book {
  id: string
  title: string
  author: string
}

interface Note {
  id: string
  title: string
  content: string
  book: Book | null
  matchingId: string | null
  createdAt: string
  updatedAt: string
}

export default function NotesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

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

    fetch('/api/notes')
      .then(res => {
        if (res.ok) return res.json()
        return []
      })
      .then(data => {
        setNotes(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('加载笔记失败:', err)
        setLoading(false)
      })
  }, [user])

  const deleteNote = async (id: string) => {
    if (!confirm('确定要删除这篇笔记吗？')) return

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== id))
      }
    } catch (err) {
      console.error('删除笔记失败:', err)
    }
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">请先 <Link href="/login" className="text-blue-600">登录</Link> 查看笔记</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">✍️ 读书笔记</h1>
        <Link
          href="/notes/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          新建笔记
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">加载中...</p>
      ) : notes.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {notes.map(note => (
            <div
              key={note.id}
              className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <Link href={`/notes/${note.id}`} className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-blue-600">
                    {note.title || '无标题笔记'}
                  </h3>
                  {note.book && (
                    <p className="text-sm text-gray-500 mb-3">
                      📚 {note.book.title}
                    </p>
                  )}
                  <p className="text-gray-600 line-clamp-3">
                    {note.content || '暂无内容'}
                  </p>
                </Link>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-400">
                  {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/notes/${note.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    编辑
                  </Link>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>暂无读书笔记</p>
          <p className="text-sm mt-2">开始阅读并记录你的感悟吧</p>
          <Link
            href="/notes/new"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            写第一篇笔记
          </Link>
        </div>
      )}
    </div>
  )
}
