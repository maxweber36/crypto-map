'use client'

import { useState, useEffect } from 'react'
import { Bitcoin, Activity, Globe, Clock } from 'lucide-react'
import PriceCard from '@/components/PriceCard'
import PriceChart from '@/components/PriceChart'
import { btcApi } from '@/services/api'

export default function HomePage() {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  /**
   * 检查服务器状态
   */
  const checkServerStatus = async () => {
    try {
      const isHealthy = await btcApi.healthCheck()
      setServerStatus(isHealthy ? 'online' : 'offline')
    } catch (error) {
      setServerStatus('offline')
    }
  }

  /**
   * 处理价格更新
   */
  const handlePriceUpdate = (price: number) => {
    setCurrentPrice(price)
    setLastUpdate(new Date())
  }

  /**
   * 格式化时间显示
   */
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // 初始化检查服务器状态
  useEffect(() => {
    checkServerStatus()
    
    // 每分钟检查一次服务器状态
    const interval = setInterval(checkServerStatus, 60000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo 和标题 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-bitcoin-500 rounded-lg">
                <Bitcoin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  BTC 仪表看板
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  实时比特币价格监控
                </p>
              </div>
            </div>

            {/* 状态指示器 */}
            <div className="flex items-center space-x-4">
              {/* 服务器状态 */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  serverStatus === 'online' ? 'bg-green-500 animate-pulse-slow' :
                  serverStatus === 'offline' ? 'bg-red-500' :
                  'bg-yellow-500 animate-pulse'
                }`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {serverStatus === 'online' ? '服务正常' :
                   serverStatus === 'offline' ? '服务离线' :
                   '检查中...'}
                </span>
              </div>

              {/* 最后更新时间 */}
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>更新于 {formatTime(lastUpdate)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎信息 */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 rounded-xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <Activity className="h-6 w-6" />
              <h2 className="text-2xl font-bold">实时市场数据</h2>
            </div>
            <p className="text-bitcoin-100">
              获取最新的比特币价格信息和市场趋势分析
            </p>
            {currentPrice && (
              <div className="mt-4 text-3xl font-bold">
                当前价格: ${currentPrice.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            )}
          </div>
        </div>

        {/* 数据展示区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 价格卡片 */}
          <div className="lg:col-span-1">
            <PriceCard onPriceUpdate={handlePriceUpdate} />
          </div>

          {/* 价格图表 */}
          <div className="lg:col-span-2">
            <PriceChart currentPrice={currentPrice || undefined} />
          </div>
        </div>

        {/* 市场信息卡片 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 市场概况 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                市场概况
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">交易对</span>
                <span className="font-medium text-gray-900 dark:text-white">BTC/USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">数据来源</span>
                <span className="font-medium text-gray-900 dark:text-white">CoinGecko</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">更新频率</span>
                <span className="font-medium text-gray-900 dark:text-white">30秒</span>
              </div>
            </div>
          </div>

          {/* 技术指标 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                技术指标
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">趋势分析</span>
                <span className="font-medium text-green-600 dark:text-green-400">看涨</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">波动性</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">中等</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">支撑位</span>
                <span className="font-medium text-gray-900 dark:text-white">动态计算</span>
              </div>
            </div>
          </div>

          {/* 风险提示 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-6 w-6 text-red-500">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                风险提示
              </h3>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>• 加密货币投资存在高风险</p>
              <p>• 价格波动可能导致重大损失</p>
              <p>• 请谨慎投资，理性决策</p>
              <p>• 本工具仅供参考，不构成投资建议</p>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              © 2024 BTC 仪表看板. 数据来源: 
              <a 
                href="https://www.coingecko.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-bitcoin-500 hover:text-bitcoin-600 transition-colors"
              >
                CoinGecko API
              </a>
            </p>
            <p className="mt-1">
              仅供学习和参考使用，不构成投资建议
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}