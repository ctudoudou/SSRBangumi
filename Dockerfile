# 使用官方 Node.js 运行时作为基础镜像
FROM node:18-alpine

# 安装系统依赖
RUN apk add --no-cache libc6-compat netcat-openbsd

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制启动脚本
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# 复制源代码
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建应用
RUN npm run build

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 设置启动脚本权限
RUN chown nextjs:nodejs ./start.sh

# 创建上传目录
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

# 设置环境变量
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

USER nextjs

EXPOSE 3000

# 使用启动脚本
CMD ["sh", "/app/start.sh"]