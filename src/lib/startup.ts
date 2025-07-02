import rssScheduler from './rss-scheduler'

// 应用启动时初始化RSS调度器
export function initializeApp() {
  console.log('正在初始化应用...')
  
  // 检查是否在 Node.js 环境中运行
  if (typeof window === 'undefined' && typeof process !== 'undefined') {
    // 启动RSS调度器
    rssScheduler.start()
  } else {
    console.log('跳过 RSS 调度器初始化（非 Node.js 环境）')
  }
  
  console.log('应用初始化完成')
}

// 应用关闭时清理资源
export function cleanupApp() {
  console.log('正在清理应用资源...')
  
  // 停止RSS调度器
  rssScheduler.stop()
  
  console.log('应用资源清理完成')
}