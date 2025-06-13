#!/bin/bash

# BTC 仪表看板启动脚本

echo "🚀 启动 BTC 仪表看板..."

# 检查是否安装了必要的依赖
check_dependencies() {
    echo "📋 检查依赖..."
    
    # 检查 Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3 未安装，请先安装 Python3"
        exit 1
    fi
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装，请先安装 npm"
        exit 1
    fi
    
    echo "✅ 依赖检查完成"
}

# 安装后端依赖
install_backend_deps() {
    echo "📦 安装后端依赖..."
    cd backend
    
    # 创建虚拟环境（如果不存在）
    if [ ! -d "venv" ]; then
        echo "🔧 创建 Python 虚拟环境..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 安装依赖
    pip install -r requirements.txt
    
    cd ..
    echo "✅ 后端依赖安装完成"
}

# 安装前端依赖
install_frontend_deps() {
    echo "📦 安装前端依赖..."
    cd frontend
    
    # 安装 npm 依赖
    npm install
    
    cd ..
    echo "✅ 前端依赖安装完成"
}

# 启动后端服务
start_backend() {
    echo "🔧 启动后端服务..."
    cd backend
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 启动 Flask 应用
    python app.py &
    BACKEND_PID=$!
    
    cd ..
    echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
}

# 启动前端服务
start_frontend() {
    echo "🔧 启动前端服务..."
    cd frontend
    
    # 启动 Next.js 开发服务器
    npm run dev &
    FRONTEND_PID=$!
    
    cd ..
    echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"
}

# 等待服务启动
wait_for_services() {
    echo "⏳ 等待服务启动..."
    sleep 5
    
    # 检查后端服务
    if curl -s http://localhost:5001/health > /dev/null; then
        echo "✅ 后端服务运行正常 (http://localhost:5001)"
    else
        echo "⚠️  后端服务可能未正常启动"
    fi
    
    echo "🌐 前端服务地址: http://localhost:3000"
    echo "🔧 后端服务地址: http://localhost:5001"
}

# 清理函数
cleanup() {
    echo "\n🛑 正在停止服务..."
    
    # 停止后端服务
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ 后端服务已停止"
    fi
    
    # 停止前端服务
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ 前端服务已停止"
    fi
    
    echo "👋 再见！"
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 主执行流程
main() {
    check_dependencies
    install_backend_deps
    install_frontend_deps
    start_backend
    start_frontend
    wait_for_services
    
    echo "\n🎉 BTC 仪表看板启动完成！"
    echo "📱 请在浏览器中访问: http://localhost:3000"
    echo "💡 按 Ctrl+C 停止服务"
    
    # 保持脚本运行
    while true; do
        sleep 1
    done
}

# 运行主函数
main