#!/bin/bash

# 等待数据库启动
echo "等待数据库连接..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "数据库已连接"

# 运行 Prisma 迁移
echo "运行数据库迁移..."
npx prisma migrate deploy

# 生成 Prisma 客户端（如果需要）
echo "生成 Prisma 客户端..."
npx prisma generate

# 启动应用
echo "启动应用..."
npm start