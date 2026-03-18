import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = 'b7c35d87-4b9e-47af-919c-048ee06e4f34'
const CLIENT_SECRET = '705255886fd6fc61e50b2e98ca267fa5798fda3e469bf08c32630517c5a29dbb'
const REDIRECT_URI = 'https://white-night-vert.vercel.app/api/auth/callback/secondme'
const TOKEN_URL = 'https://app.mindos.com/gate/lab/api/oauth/token/code'
const USERINFO_URL = 'https://app.mindos.com/gate/lab/api/secondme/user/info'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  // state is used for OAuth validation in production but not currently checked
  const _state = searchParams.get('state')

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=no_code', request.url)
    )
  }

  try {
    // 1. 用 code 换取 access token
    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return NextResponse.redirect(
        new URL(`/login?error=token_failed&detail=${encodeURIComponent(errorText)}`, request.url)
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.data?.accessToken || tokenData.accessToken

    if (!accessToken) {
      console.error('No access token in response:', tokenData)
      return NextResponse.redirect(
        new URL('/login?error=no_token', request.url)
      )
    }

    // 2. 获取用户信息
    const userInfoResponse = await fetch(USERINFO_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text()
      console.error('Userinfo failed:', errorText)
      return NextResponse.redirect(
        new URL(`/login?error=userinfo_failed&detail=${encodeURIComponent(errorText)}`, request.url)
      )
    }

    const userInfo = await userInfoResponse.json()
    console.log('UserInfo response:', JSON.stringify(userInfo, null, 2))

    // SecondMe 返回的数据结构
    const profile = userInfo.data || userInfo

    console.log('Profile:', JSON.stringify(profile, null, 2))

    // 使用正确的字段名 - 根据日志，SecondMe 返回的是 userId (小写 d)
    const secondMeId = profile.userId ||
                      profile.user_id ||
                      profile.id ||
                      profile.sub ||
                      profile.uuid

    const userName = profile.name ||
                    profile.nickname ||
                    profile.userName

    const userAvatar = profile.avatar ||
                      profile.picture ||
                      profile.avatarUrl ||
                      profile.image

    console.log('Extracted:', { secondMeId, userName, userAvatar })

    if (!secondMeId) {
      return NextResponse.redirect(
        new URL('/login?error=no_user_id', request.url)
      )
    }

    // 3. 创建会话
    const response = NextResponse.redirect(new URL('/', request.url))

    response.cookies.set('secondme_id', secondMeId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    response.cookies.set('user_name', userName || 'User', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    if (userAvatar) {
      response.cookies.set('user_avatar', userAvatar, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    console.log('Login success for:', userName)

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.redirect(
      new URL(`/login?error=login_failed&detail=${encodeURIComponent(String(err))}`, request.url)
    )
  }
}
