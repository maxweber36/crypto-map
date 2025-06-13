'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp, BarChart3, RefreshCw } from 'lucide-react'
import { btcApi, BTCHistoryData } from '@/services/api'

interface PriceChartProps {
  currentPrice?: number
}

export default function PriceChart({ currentPrice }: PriceChartProps) {
  const [historyData, setHistoryData] = useState<BTCHistoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartType, setChartType] = useState<'line' | 'area'>('area')

  /**
   * 获取历史价格数据
   */
  const fetchHistoryData = async () => {
    try {
      setError(null)
      setLoading(true)
      const data = await btcApi.getPriceHistory()
      setHistoryData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取历史数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 格式化图表数据
   */
  const formatChartData = (data: BTCHistoryData[]) => {
    return data.map((item) => ({
      ...item,
      // 格式化时间显示（只显示月-日 时:分）
      shortDate: new Date(item.timestamp).toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      // 格式化完整时间
      fullDate: new Date(item.timestamp).toLocaleString('zh-CN'),
    }))
  }

  /**
   * 自定义工具提示
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {data.fullDate}
          </p>
          <p className="text-lg font-semibold text-bitcoin-600 dark:text-bitcoin-400">
            ${payload[0].value.toLocaleString('zh-CN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      )
    }
    return null
  }

  /**
   * 计算价格趋势
   */
  const calculateTrend = () => {
    if (historyData.length < 2) return { trend: 'neutral', change: 0 }
    
    const firstPrice = historyData[0].price
    const lastPrice = historyData[historyData.length - 1].price
    const change = ((lastPrice - firstPrice) / firstPrice) * 100
    
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      change: Math.abs(change),
    }
  }

  /**
   * 获取图表颜色
   */
  const getChartColor = () => {
    const { trend } = calculateTrend()
    switch (trend) {
      case 'up':
        return '#10b981' // green-500
      case 'down':
        return '#ef4444' // red-500
      default:
        return '#f97316' // bitcoin-500
    }
  }

  // 初始加载数据
  useEffect(() => {
    fetchHistoryData()
    
    // 每5分钟刷新一次历史数据
    const interval = setInterval(fetchHistoryData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const chartData = formatChartData(historyData)
  const { trend, change } = calculateTrend()
  const chartColor = getChartColor()

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ 图表数据加载失败</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <button
            onClick={fetchHistoryData}
            className="px-4 py-2 bg-bitcoin-500 text-white rounded-lg hover:bg-bitcoin-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-bitcoin-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            7天价格走势
          </h2>
          {trend !== 'neutral' && (
            <div className="flex items-center space-x-1">
              <TrendingUp 
                className={`h-4 w-4 ${
                  trend === 'up' ? 'text-green-500 rotate-0' : 'text-red-500 rotate-180'
                }`} 
              />
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {change.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 图表类型切换 */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                chartType === 'area'
                  ? 'bg-white dark:bg-gray-600 text-bitcoin-600 dark:text-bitcoin-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-bitcoin-600'
              }`}
            >
              面积图
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                chartType === 'line'
                  ? 'bg-white dark:bg-gray-600 text-bitcoin-600 dark:text-bitcoin-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-bitcoin-600'
              }`}
            >
              线形图
            </button>
          </div>
          
          {/* 刷新按钮 */}
          <button
            onClick={fetchHistoryData}
            className="p-2 text-gray-500 hover:text-bitcoin-500 transition-colors"
            title="刷新图表数据"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 图表容器 */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="shortDate" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 1000', 'dataMax + 1000']}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#colorPrice)"
                dot={false}
                activeDot={{ r: 4, fill: chartColor }}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="shortDate" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 1000', 'dataMax + 1000']}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: chartColor }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 数据统计 */}
      {historyData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">最高价</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                ${Math.max(...historyData.map(d => d.price)).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">最低价</div>
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                ${Math.min(...historyData.map(d => d.price)).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">平均价</div>
              <div className="text-lg font-semibold text-bitcoin-600 dark:text-bitcoin-400">
                ${Math.round(historyData.reduce((sum, d) => sum + d.price, 0) / historyData.length).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}