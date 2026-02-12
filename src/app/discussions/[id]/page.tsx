'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  name: string | null
}

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
}

interface Message {
  id: string
  content: string
  userId: string
  userName: string | null
  createdAt: string
  isCurrentUser: boolean
}

export default function DiscussionChatPage() {
  const params = useParams()
  const matchingId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [matching, setMatching] = useState<Matching | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [turn, setTurn] = useState<'user' | 'partner'>('user')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 获取用户信息
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

  // 获取配对信息
  useEffect(() => {
    if (!user) return

    fetch('/api/matchings')
      .then(res => {
        if (res.ok) return res.json()
        return { current: [], history: [] }
      })
      .then(data => {
        const allMatchings = [...(data.current || []), ...(data.history || [])]
        const found = allMatchings.find((m: Matching) => m.id === matchingId)
        if (found) {
          setMatching(found)
          // 决定谁先说话（简单规则：用户先说）
          setTurn('user')
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('加载配对信息失败:', err)
        setLoading(false)
      })
  }, [user, matchingId])

  // 获取消息
  useEffect(() => {
    if (!matchingId) return

    fetch(`/api/discussions/${matchingId}/messages`)
      .then(res => {
        if (res.ok) return res.json()
        return []
      })
      .then(data => {
        if (user) {
          const msgs = data.map((m: Message) => ({
            ...m,
            isCurrentUser: m.userId === user.id
          }))
          setMessages(msgs)

          // 计算当前轮到谁
          const userMsgs = msgs.filter((m: Message) => m.userId === user.id).length
          const partnerMsgs = msgs.length - userMsgs
          setTurn(userMsgs <= partnerMsgs ? 'user' : 'partner')
        }
      })
      .catch(err => {
        console.error('加载消息失败:', err)
      })
  }, [matchingId, user])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 发送消息
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !matching) return
    if (turn === 'partner') {
      alert('还没轮到对方说话，请稍候...')
      return
    }

    setSending(true)
    try {
      const res = await fetch(`/api/discussions/${matchingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage.trim(),
          userId: user.id,
        }),
      })

      if (res.ok) {
        const message = await res.json()
        setMessages(prev => [...prev, {
          ...message,
          isCurrentUser: true,
          userName: user.name,
        }])
        setNewMessage('')
        // 切换到对方回合
        setTurn('partner')
      }
    } catch (err) {
      console.error('发送消息失败:', err)
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
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

  if (!matching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">配对不存在</p>
        <Link href="/discussions" className="text-blue-600 hover:underline mt-2 block">
          返回讨论列表
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)] flex flex-col">
      {/* 头部 */}
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/discussions"
          className="text-gray-600 hover:text-gray-900"
        >
          ← 返回
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            与 {matching.partner.name || '书友'} 的讨论
          </h1>
          <p className="text-sm text-gray-500">
            📚 {matching.book.title} - {matching.book.author}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${
          turn === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {turn === 'user' ? '轮到你说' : '等待对方'}
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>还没有消息</p>
            <p className="text-sm mt-2">开始讨论这本书吧！</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${
                message.isCurrentUser ? 'order-2' : 'order-1'
              }`}>
                {!message.isCurrentUser && (
                  <p className="text-xs text-gray-500 ml-1 mb-1">
                    {message.userName || '书友'}
                  </p>
                )}
                <div className={`px-4 py-2 rounded-lg ${
                  message.isCurrentUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className={`text-xs text-gray-400 mt-1 ${
                  message.isCurrentUser ? 'text-right mr-1' : 'ml-1'
                }`}>
                  {new Date(message.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="mt-4">
        <div className="flex gap-3">
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={turn === 'user' ? '输入你的想法...' : '等待对方回复...'}
            disabled={turn === 'partner' || sending}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={2}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || turn === 'partner' || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            {sending ? '发送中...' : '发送'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 提示：对话模式需要轮流发言，请等待对方回复后再发送新消息
        </p>
      </div>
    </div>
  )
}
