# SSRBangumi

一个基于 Next.js 的动漫追踪应用，使用 PostgreSQL 数据库。

## 技术栈

- **前端**: Next.js 15, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL with Prisma ORM
- **认证**: JWT + HTTP-only Cookies
- **容器化**: Docker & Docker Compose

## 快速开始

### 使用 Docker Compose（推荐）

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd SSRBangumi
   ```

2. **配置环境变量**
   ```bash
   cp .env.docker .env
   ```
   
   根据需要修改 `.env` 文件中的配置：
   - 数据库密码
   - JWT 密钥
   - NextAuth 密钥

3. **启动服务**
   ```bash
   # 启动所有服务（包括 pgAdmin）
   docker-compose up -d
   
   # 或者只启动应用和数据库
   docker-compose up -d postgres web
   ```

4. **访问应用**
   - 应用地址: http://localhost:3000
   - pgAdmin: http://localhost:8080 (可选)
     - 邮箱: admin@example.com
     - 密码: admin

5. **停止服务**
   ```bash
   docker-compose down
   ```

### 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动 PostgreSQL 数据库**
   ```bash
   docker-compose up -d postgres
   ```

3. **配置环境变量**
   ```bash
   cp .env.docker .env
   ```
   
   修改 `.env` 文件中的数据库连接信息。

4. **运行数据库迁移**
   ```bash
   npx prisma migrate dev
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 项目结构

```
SSRBangumi/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API 路由
│   │   │   └── auth/        # 认证相关 API
│   │   ├── login/           # 登录页面
│   │   ├── register/        # 注册页面
│   │   └── page.tsx         # 主页
│   └── lib/                 # 工具库
│       ├── auth.ts          # 认证工具
│       └── db.ts            # 数据库连接
├── prisma/
│   └── schema.prisma        # 数据库模型
├── docker-compose.yml       # Docker Compose 配置
├── Dockerfile              # Docker 镜像构建
└── README.md
```

## 数据库模型

### User（用户）
- id: 唯一标识
- username: 用户名
- email: 邮箱
- password: 密码（加密）
- createdAt: 创建时间
- updatedAt: 更新时间

### Anime（动漫）
- id: 唯一标识
- title: 标题
- description: 描述
- imageUrl: 封面图片
- status: 状态
- episodes: 总集数
- createdAt: 创建时间
- updatedAt: 更新时间

## API 接口

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

## 环境变量

| 变量名 | 描述 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_SECRET` | NextAuth.js 密钥 | `your-secret-key` |
| `NEXTAUTH_URL` | 应用 URL | `http://localhost:3000` |
| `JWT_SECRET` | JWT 签名密钥 | `your-jwt-secret` |

## 部署

### 生产环境部署

1. **修改环境变量**
   - 更改所有密钥为安全的随机字符串
   - 设置正确的 `NEXTAUTH_URL`
   - 配置生产数据库连接

2. **构建和启动**
   ```bash
   docker-compose up -d
   ```

### 注意事项

- 生产环境中请务必更改所有默认密钥
- 建议使用外部 PostgreSQL 服务（如 AWS RDS）
- 配置适当的备份策略
- 启用 HTTPS

## 开发指南

### 添加新的数据库模型

1. 修改 `prisma/schema.prisma`
2. 运行 `npx prisma migrate dev --name <migration-name>`
3. 运行 `npx prisma generate`

### 添加新的 API 路由

在 `src/app/api/` 目录下创建新的路由文件。

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 PostgreSQL 容器是否正在运行
   - 验证 `DATABASE_URL` 配置

2. **Prisma 迁移失败**
   - 确保数据库可访问
   - 检查迁移文件是否有语法错误

3. **Docker 构建失败**
   - 清理 Docker 缓存: `docker system prune`
   - 重新构建: `docker-compose build --no-cache`

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
