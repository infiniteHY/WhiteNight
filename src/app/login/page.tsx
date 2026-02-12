'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const AUTH_URL = 'https://go.second.me/oauth/'
const CLIENT_ID = 'b7c35d87-4b9e-47af-919c-048ee06e4f34'
const REDIRECT_URI = encodeURIComponent('http://localhost:3000/api/auth/callback/secondme')

function LoginForm() {
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const processedRef = useRef(false)

  const errorParam = searchParams.get('error')
  const detailParam = searchParams.get('detail')

  const generateState = () => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  const handleLogin = () => {
    const state = generateState()
    sessionStorage.setItem('oauth_state', state)
    const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&state=${state}`
    window.location.href = authUrl
  }

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    if (errorParam) {
      let errorMsg = errorParam
      if (detailParam) {
        try {
          const decoded = decodeURIComponent(detailParam)
          errorMsg += ': ' + decoded.substring(0, 500)
        } catch {
          errorMsg += ': ' + detailParam
        }
      }
      setTimeout(() => setError(errorMsg), 0)
    }
  }, [errorParam, detailParam])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">读书会</h1>
          <p className="mt-2 text-gray-600">登录你的账号</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">授权失败</p>
            <p className="text-sm mt-1 break-all">{error}</p>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            使用 SecondMe 登录
          </button>
          <p className="text-xs text-gray-500 mt-3 text-center">
            点击按钮跳转到 SecondMe 授权
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          登录即表示你同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">读书会</h1>
          <p className="mt-2 text-gray-600">登录你的账号</p>
        </div>
        <div className="mt-8 text-center text-gray-500">
          加载中...
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginForm />
    </Suspense>
  )
}
