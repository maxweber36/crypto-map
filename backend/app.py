from flask import Flask, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# CoinGecko API 基础URL
COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"


def get_btc_current_price():
  """获取当前BTC价格"""
  try:
    url = f"{COINGECKO_BASE_URL}/simple/price"
    params = {
      'ids': 'bitcoin',
      'vs_currencies': 'usd',
      'include_24hr_change': 'true',
      'include_last_updated_at': 'true'
    }
    
    headers = {
      'Accept': 'application/json',
      'x-cg-demo-api-key': 'CG-kCrjRyoZtWw1Z2eMs12ueDmQ',
    }

    response = requests.get(url, params=params, timeout=10, headers=headers)
    response.raise_for_status()
    
    data = response.json()
    bitcoin_data = data.get('bitcoin', {})
    
    return {
      'price': bitcoin_data.get('usd'),
      'change_24h': bitcoin_data.get('usd_24h_change'),
      'last_updated': bitcoin_data.get('last_updated_at')
    }
  except Exception as e:
    logger.error(f"获取BTC当前价格失败: {e}")
    return None


def get_btc_price_history():
  """获取BTC最近7天价格历史"""
  try:
    url = f"{COINGECKO_BASE_URL}/coins/bitcoin/market_chart"

    headers = {
      'Accept': 'application/json',
      'x-cg-demo-api-key': 'CG-kCrjRyoZtWw1Z2eMs12ueDmQ',
    }
    params = {
      'vs_currency': 'usd',
      'days': '7',
    }
    
    response = requests.get(url, params=params, timeout=10, headers=headers)
    response.raise_for_status()
    
    data = response.json()
    prices = data.get('prices', [])
    
    # 格式化数据
    formatted_prices = []
    for price_data in prices:
      timestamp = price_data[0]
      price = price_data[1]
      
      # 转换时间戳为可读格式
      dt = datetime.fromtimestamp(timestamp / 1000)
      formatted_prices.append({
        'timestamp': timestamp,
        'date': dt.strftime('%Y-%m-%d %H:%M'),
        'price': round(price, 2)
      })
    
    return formatted_prices
  except Exception as e:
    logger.error(f"获取BTC价格历史失败: {e}")
    return None


@app.route('/api/btc/price', methods=['GET'])
def get_current_price():
  """获取当前BTC价格API接口"""
  try:
    price_data = get_btc_current_price()
    
    if price_data is None:
      return jsonify({
        'success': False,
        'message': '获取价格数据失败'
      }), 500
    
    return jsonify({
      'success': True,
      'data': price_data
    })
  except Exception as e:
    logger.error(f"API错误: {e}")
    return jsonify({
      'success': False,
      'message': '服务器内部错误'
    }), 500


@app.route('/api/btc/history', methods=['GET'])
def get_price_history():
  """获取BTC价格历史API接口"""
  try:
    history_data = get_btc_price_history()
    
    if history_data is None:
      return jsonify({
        'success': False,
        'message': '获取历史数据失败'
      }), 500
    
    return jsonify({
      'success': True,
      'data': history_data
    })
  except Exception as e:
    logger.error(f"API错误: {e}")
    return jsonify({
      'success': False,
      'message': '服务器内部错误'
    }), 500


@app.route('/health', methods=['GET'])
def health_check():
  """健康检查接口"""
  return jsonify({
    'status': 'healthy',
    'timestamp': datetime.now().isoformat()
  })


if __name__ == '__main__':
  logger.info("启动BTC仪表看板后端服务...")
  app.run(debug=True, host='0.0.0.0', port=5001)