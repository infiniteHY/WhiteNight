# 读书会 - SecondMe 集成应用

本项目是一个读书会应用，集成 SecondMe OAuth 登录，支持选书、配对讨论、读书笔记功能。

## 功能特性

- **用户认证**: 使用 SecondMe OAuth 登录
- **选书系统**: 从外部数据库搜索书籍，每月选择 8 本书进行投票
- **配对机制**: 系统自动配对用户，优先匹配未讨论过的书友
- **讨论功能**: 实时对话讨论，存档备查
- **笔记输出**: 撰写读书笔记，支持导出

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- NextAuth.js

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth 认证相关
│   │   ├── books/          # 书籍搜索 API
│   │   ├── discussions/    # 讨论 API
│   │   └── notes/          # 笔记 API
│   ├── books/              # 选书页面
│   ├── discussions/        # 讨论列表页面
│   ├── login/              # 登录页面
│   ├── matchings/          # 配对页面
│   ├── notes/             # 笔记页面
│   └── page.tsx           # 首页
├── components/
│   ├── AuthProvider.tsx
│   └── Navbar.tsx
├── lib/
│   ├── auth.ts             # NextAuth 配置
│   └── prisma.ts           # Prisma Client
└── types/
    └── next-auth.d.ts
```

## 环境变量

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/reading_club"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# SecondMe OAuth
SECONDME_CLIENT_ID="your-client-id"
SECONDME_CLIENT_SECRET="your-client-secret"
SECONDME_REDIRECT_URI="http://localhost:3000/api/auth/callback/secondme"
SECONDME_API_URL="https://api.second.me"
```

## 启动步骤

```bash
# 1. 安装依赖
npm install

# 2. 设置数据库
# 确保 PostgreSQL 已运行，并配置 DATABASE_URL
npx prisma db push

# 3. 启动开发服务器
npm run dev
```

## SecondMe 开发者配置

在 https://develop.second.me 创建应用，设置：
- Redirect URI: `http://localhost:3000/api/auth/callback/secondme`
- Scopes: `profile`, `identity`
