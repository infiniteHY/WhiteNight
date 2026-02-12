# Zeabur 部署指南

## 1. 准备工作

### 1.1 注册 Zeabur
1. 访问 https://zeabur.com 注册账号
2. 推荐使用 GitHub 账号登录

### 1.2 创建 PostgreSQL 数据库
1. 在 Zeabur 后台点击 "Add Database"
2. 选择 "PostgreSQL"
3. 记录生成的 DATABASE_URL

## 2. 部署步骤

### 2.1 连接 GitHub 仓库
1. 在 Zeabur 后台点击 "New Project"
2. 选择 "Deploy from GitHub"
3. 授权并选择本仓库

### 2.2 配置环境变量
在 Zeabur 项目设置中添加以下环境变量：

```env
# Database (从 PostgreSQL 数据库获取)
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="https://your-project.zeabur.app"
NEXTAUTH_SECRET="openssl rand -base64 32"

# SecondMe OAuth (在 https://develop.second.me 获取)
SECONDME_CLIENT_ID="your-client-id"
SECONDME_CLIENT_SECRET="your-client-secret"
SECONDME_REDIRECT_URI="https://your-project.zeabur.app/api/auth/callback/secondme"
SECONDME_API_URL="https://api.second.me"
```

### 2.3 更新 SecondMe 开发者配置
在 https://develop.second.me 修改：
- Redirect URI: `https://your-project.zeabur.app/api/auth/callback/secondme`

## 3. 部署完成

1. Zeabur 会自动部署
2. 部署完成后访问 `https://your-project.zeabur.app`
3. 登录后测试完整功能

## 4. 常见问题

### Q: 数据库需要迁移吗？
A: Zeabur 会在首次部署时自动运行 `npx prisma db push`

### Q: 如何更新部署？
A: 推送代码到 GitHub，Zeabur 会自动重新部署

### Q: 域名配置？
A: 在 Zeabur 后台的 "Domains" 中添加自定义域名
