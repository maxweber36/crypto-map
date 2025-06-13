import axios from 'axios'

// API 基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    console.log(`发起请求: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log(`请求成功: ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    console.error('响应错误:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// 数据类型定义
export interface BTCPriceData {
  price: number
  change_24h: number
  last_updated: number
}

export interface BTCHistoryData {
  timestamp: number
  date: string
  price: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// API 方法
export const btcApi = {
  /**
   * 获取当前 BTC 价格
   */
  getCurrentPrice: async (): Promise<BTCPriceData> => {
    try {
      const response = await apiClient.get<ApiResponse<BTCPriceData>>('/api/btc/price')
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || '获取价格数据失败')
      }
      
      return response.data.data
    } catch (error) {
      console.error('获取当前价格失败:', error)
      throw error
    }
  },

  /**
   * 获取 BTC 价格历史数据
   */
  getPriceHistory: async (): Promise<BTCHistoryData[]> => {
    try {
      const response = await apiClient.get<ApiResponse<BTCHistoryData[]>>('/api/btc/history')
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || '获取历史数据失败')
      }
      
      return response.data.data
    } catch (error) {
      console.error('获取价格历史失败:', error)
      throw error
    }
  },

  /**
   * 健康检查
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/health')
      return response.status === 200
    } catch (error) {
      console.error('健康检查失败:', error)
      return false
    }
  },
}

export default apiClient