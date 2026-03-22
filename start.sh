#!/bin/bash

# 毛豆积分系统启动脚本

cd "$(dirname "$0")"

echo "🚀 启动毛豆积分系统..."
echo ""

/usr/local/bin/node server.js
