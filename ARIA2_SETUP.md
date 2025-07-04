# Aria2 下载服务配置指南

本项目已集成 Aria2 下载服务，用于处理种子文件和磁力链接的下载。

## 服务组件

### 1. Aria2 下载引擎
- **容器名**: `ssrbangumi-aria2`
- **镜像**: `p3terx/aria2-pro:latest`
- **RPC 端口**: `6800`
- **BT 监听端口**: `6888`
- **下载目录**: `./downloads`

### 2. AriaNg Web UI (可选)
- **容器名**: `ssrbangumi-ariang`
- **镜像**: `p3terx/ariang:latest`
- **Web 端口**: `6880`
- **访问地址**: `http://localhost:6880`

## 快速启动

### 1. 启动服务
```bash
# 启动所有服务（包括 aria2）
docker-compose up -d

# 仅启动 aria2 相关服务
docker-compose up -d aria2 ariang
```

### 2. 访问 Web UI
打开浏览器访问: `http://localhost:6880`

### 3. 配置连接
在 AriaNg 中配置 Aria2 RPC 连接：
- **主机**: `localhost`
- **端口**: `6800`
- **协议**: `http`
- **密钥**: `your_secret_token_here`（建议修改）

## 安全配置

### 修改 RPC 密钥
1. 编辑 `docker-compose.yml` 文件
2. 修改 `RPC_SECRET` 环境变量的值
3. 重启容器：`docker-compose restart aria2`

### 自定义配置
1. 复制配置文件模板：
   ```bash
   cp aria2.conf.example aria2.conf
   ```
2. 编辑 `aria2.conf` 文件
3. 在 `docker-compose.yml` 中挂载配置文件：
   ```yaml
   volumes:
     - ./aria2.conf:/config/aria2.conf
   ```

## API 集成

### RPC 接口
Aria2 提供 JSON-RPC 接口，可以通过以下方式调用：

```javascript
// 添加下载任务
const response = await fetch('http://localhost:6800/jsonrpc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'aria2.addUri',
    id: '1',
    params: [
      'token:your_secret_token_here',
      ['magnet:?xt=urn:btih:...'], // 磁力链接或种子URL
      {
        dir: '/downloads/anime', // 下载目录
        'max-connection-per-server': '5',
        split: '5'
      }
    ]
  })
});
```

### 常用 RPC 方法
- `aria2.addUri`: 添加 URL 下载
- `aria2.addTorrent`: 添加种子文件
- `aria2.tellStatus`: 获取下载状态
- `aria2.tellActive`: 获取活跃下载
- `aria2.pause`: 暂停下载
- `aria2.unpause`: 恢复下载
- `aria2.remove`: 删除下载任务

## 目录结构

```
SSRBangumi/
├── downloads/          # 下载文件存储目录
│   ├── anime/         # 动漫下载
│   ├── complete/      # 完成的下载
│   └── incomplete/    # 未完成的下载
├── aria2.conf.example # Aria2 配置文件模板
└── docker-compose.yml # Docker 编排文件
```

## 故障排除

### 1. 端口冲突
如果端口被占用，可以修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "6801:6800"  # 修改主机端口
  - "6889:6888"
```

### 2. 权限问题
确保下载目录有正确的权限：
```bash
sudo chown -R 1000:1000 downloads/
sudo chmod -R 755 downloads/
```

### 3. 查看日志
```bash
# 查看 aria2 日志
docker-compose logs aria2

# 实时查看日志
docker-compose logs -f aria2
```

## 性能优化

### 1. 磁盘缓存
增加磁盘缓存可以提高下载性能：
```yaml
environment:
  - DISK_CACHE=128M  # 默认 64M
```

### 2. 连接数配置
根据网络环境调整连接数：
```yaml
environment:
  - MAX_CONCURRENT_DOWNLOADS=10  # 同时下载任务数
  - MAX_CONNECTION_PER_SERVER=16 # 单服务器连接数
```

### 3. BT 优化
对于 BT 下载，可以启用 DHT 和 PEX：
```yaml
environment:
  - ENABLE_DHT=true
  - ENABLE_PEX=true
```

## 集成到 SSRBangumi

在 RSS 调度器中，可以通过 Aria2 RPC 接口自动下载检测到的种子文件：

1. 在 RSS 解析时检测种子链接
2. 调用 Aria2 RPC 添加下载任务
3. 监控下载进度
4. 下载完成后进行后续处理（重命名、移动文件等）

这样就实现了从 RSS 订阅到自动下载的完整流程。