"""
ZZR Store 配置
"""
import os

# ========== JWT ==========
JWT_SECRET = "zzr-st…2026"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30

# ========== 支付 ==========
# PayJS 配置（留空则自动降级为模拟支付）
PAYJS_MCHID = os.environ.get("PAYJS_MCHID", "")
PAYJS_KEY = os.environ.get("PAYJS_KEY", "")
# 异步通知地址，部署后改为实际域名
PAYJS_NOTIFY_URL = os.environ.get("PAYJS_NOTIFY_URL", "")

# 是否启用模拟支付（当 PayJS 未配置时自动启用）
MOCK_PAY_ENABLED = True
