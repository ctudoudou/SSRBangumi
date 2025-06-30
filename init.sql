-- 初始化数据库脚本
-- 这个脚本会在 PostgreSQL 容器首次启动时执行

-- 创建数据库（如果不存在）
CREATE DATABASE ssr_bangumi;

-- 连接到数据库
\c ssr_bangumi;

-- 创建扩展（如果需要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 设置时区
SET timezone = 'Asia/Shanghai';

-- 插入一些示例动漫数据（可选）
-- 注意：这些数据会在 Prisma migrate 之后插入
-- 实际的表结构由 Prisma 管理