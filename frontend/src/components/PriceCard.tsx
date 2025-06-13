'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react'
import { btcApi, BTCPriceData } from '@/services/api'

interface PriceCardProps {
  onPriceUpdate?: (price: number) => void
}

export default function PriceCard({ onPriceUpdate }: PriceCardProps) {
  const [priceData, setPriceData] = useState<BTCPriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastPrice, setLastPrice] = useState<number | null>(null)
  const [priceAnimation, setPriceAnimation] = useState<'up' | 'down' | null>(null)

  /**
   * 获取当前价格数据
   */
  const fetchPriceData = async () => {
    try {
      setError(null)
      const data = await btcApi.getCurrentPrice()
      
      // 价格变化动画
      if (lastPrice !== null && data.price !== lastPrice) {
        setPriceAnimation(data.price > lastPrice ? 'up' : 'down')
        setTimeout(() => setPriceAnimation(null), 500)
      }
      
      setLastPrice(data.price)
      setPriceData(data)
      onPriceUpdate?.(data.price)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 格式化价格显示
   */
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  /**
   * 格式化百分比变化
   */
  const formatPercentage = (change: number): string => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  /**
   * 格式化最后更新时间
   */
  const formatLastUpdated = (timestamp: number): string => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // 初始加载
  useEffect(() => {
    fetchPriceData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
          </div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ 数据加载失败</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <button
            onClick={fetchPriceData}
            className="px-4 py-2 bg-bitcoin-500 text-white rounded-lg hover:bg-bitcoin-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  if (!priceData) return null

  const isPositiveChange = priceData.change_24h >= 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-bitcoin-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            BTC 当前价格
          </h2>
        </div>
        <button
          onClick={fetchPriceData}
          className="p-2 text-gray-500 hover:text-bitcoin-500 transition-colors"
          title="刷新数据"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* 价格显示 */}
      <div className={`mb-4 ${priceAnimation === 'up' ? 'price-up' : priceAnimation === 'down' ? 'price-down' : ''}`}>
        <div className="text-4xl font-bold text-gray-900 dark:text-white number-animate">
          {formatPrice(priceData.price)}
        </div>
      </div>

      {/* 24小时变化 */}
      <div className="flex items-center space-x-2 mb-4">
        {isPositiveChange ? (
          <TrendingUp className="h-5 w-5 text-green-500" />
        ) : (
          <TrendingDown className="h-5 w-5 text-red-500" />
        )}
        <span
          className={`text-lg font-semibold ${
            isPositiveChange ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {formatPercentage(priceData.change_24h)}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          24小时变化
        </span>
      </div>

      {/* 最后更新时间 */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        最后更新: {formatLastUpdated(priceData.last_updated)}
      </div>
    </div>
  )
}