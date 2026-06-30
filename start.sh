#!/bin/bash
# ZZR Store - 同时启动后端和前端
# 用于 WSL 环境

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 启动 ZZR Store..."

# 启动后端
echo "📡 启动后端 API..."
cd "$SCRIPT_DIR/backend"
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8001 &
BACKEND_PID=$!

# 等待后端就绪
sleep 2

# 启动前端
echo "🌐 启动前端..."
cd "$SCRIPT_DIR"
npx vite --host 127.0.0.1 --port 5173 --open &
FRONTEND_PID=$!

echo ""
echo "✅ ZZR Store 已启动"
echo "   前端: http://127.0.0.1:5173/zzr-store/"
echo "   后端: http://127.0.0.1:8001"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 捕获退出信号，同时停止两个进程
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
