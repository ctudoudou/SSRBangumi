import { prisma } from './db'
import Parser from 'rss-parser'

interface RssItem {
  title?: string
  link?: string
  pubDate?: string
  contentSnippet?: string
  guid?: string
}

class RssScheduler {
  private parser: Parser
  private isRunning = false

  constructor() {
    this.parser = new Parser()
  }

  // 启动调度器
  start() {
    // 检查是否在 Node.js 环境中运行
    if (typeof window !== 'undefined' || typeof process === 'undefined') {
      console.log('RSS 调度器只能在 Node.js 环境中运行')
      return
    }

    if (this.isRunning) {
      console.log('RSS 调度器已经在运行中')
      return
    }
    
    console.log('启动 RSS 调度器...')
    this.isRunning = true
    
    // 立即执行一次检查
    this.checkAllFeeds()
    
    // 设置定时器，每分钟检查一次
    setInterval(() => {
      this.checkAllFeeds()
    }, 60 * 1000) // 60秒
    
    console.log('RSS 调度器已启动')
  }

  // 停止调度器
  stop() {
    this.isRunning = false
    console.log('RSS调度器已停止')
  }

  // 检查所有RSS源
  private async checkAllFeeds() {
    try {
      const now = new Date()
      
      // 获取需要更新的RSS源
      const feedsToUpdate = await prisma.rssFeed.findMany({
        where: {
          isActive: true,
          OR: [
            { lastChecked: null },
            {
              lastChecked: {
                lt: new Date(now.getTime() - 60 * 1000) // 至少1分钟前检查过
              }
            }
          ]
        }
      })

      for (const feed of feedsToUpdate) {
        // 检查是否到了更新时间
        if (feed.lastChecked) {
          const timeSinceLastCheck = now.getTime() - feed.lastChecked.getTime()
          const updateInterval = feed.updateFreq * 60 * 1000 // 转换为毫秒
          
          if (timeSinceLastCheck < updateInterval) {
            continue // 还没到更新时间
          }
        }

        await this.processFeed(feed)
      }
    } catch (error) {
      console.error('检查RSS源时出错:', error)
    }
  }

  // 处理单个RSS源
  private async processFeed(feed: any) {
    try {
      console.log(`正在处理RSS源: ${feed.name}`)
      
      const rssFeed = await this.parser.parseURL(feed.url)
      
      // 更新最后检查时间
      await prisma.rssFeed.update({
        where: { id: feed.id },
        data: { lastChecked: new Date() }
      })

      // 处理RSS项目
      for (const item of rssFeed.items) {
        await this.processRssItem(feed.id, item)
      }
      
      console.log(`RSS源 ${feed.name} 处理完成`)
    } catch (error) {
      console.error(`处理RSS源 ${feed.name} 时出错:`, error)
      
      // 即使出错也要更新最后检查时间，避免频繁重试
      await prisma.rssFeed.update({
        where: { id: feed.id },
        data: { lastChecked: new Date() }
      })
    }
  }

  // 处理单个RSS项目
  private async processRssItem(feedId: string, item: RssItem) {
    try {
      const guid = item.guid || item.link || `${feedId}-${item.title}`
      
      if (!guid) return

      // 检查是否已存在
      const existingItem = await prisma.rssItem.findUnique({
        where: { guid }
      })

      if (existingItem) return // 已存在，跳过

      // 创建新的RSS项目
      await prisma.rssItem.create({
        data: {
          title: item.title || '无标题',
          description: item.contentSnippet || '',
          link: item.link || '',
          pubDate: item.pubDate ? new Date(item.pubDate) : null,
          guid,
          rssFeedId: feedId,
          processed: false
        }
      })

      console.log(`新RSS项目已添加: ${item.title}`)
    } catch (error) {
      console.error('处理RSS项目时出错:', error)
    }
  }

  // 手动触发特定RSS源的更新
  async triggerFeedUpdate(feedId: string) {
    try {
      const feed = await prisma.rssFeed.findUnique({
        where: { id: feedId }
      })

      if (!feed) {
        throw new Error('RSS源不存在')
      }

      await this.processFeed(feed)
      return { success: true, message: 'RSS源更新完成' }
    } catch (error) {
      console.error('手动更新RSS源时出错:', error)
      return { success: false, message: error instanceof Error ? error.message : '更新失败' }
    }
  }

  // 获取未处理的RSS项目
  async getUnprocessedItems(limit = 50) {
    return await prisma.rssItem.findMany({
      where: { processed: false },
      include: {
        rssFeed: {
          select: {
            name: true,
            userId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  // 标记RSS项目为已处理
  async markItemAsProcessed(itemId: string) {
    return await prisma.rssItem.update({
      where: { id: itemId },
      data: { processed: true }
    })
  }
}

// 创建全局实例
const rssScheduler = new RssScheduler()

export { rssScheduler, RssScheduler }
export default rssScheduler