"""
ZZR Store 配置
"""
import os

# ========== JWT ==========
JWT_SECRET = "***"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30

# ========== SMTP / 邮箱 ==========
SMTP_HOST = os.environ.get("ZZR_SMTP_HOST", "smtp.126.com")
SMTP_PORT = int(os.environ.get("ZZR_SMTP_PORT", "25"))
SMTP_USER = os.environ.get("ZZR_SMTP_USER", "zzr2282328134@126.com")
SMTP_PASS = os.environ.get("ZZR_SMTP_PASS", "FZwnC37v4xXvHyMR")

# ========== 支付 ==========
# YunGouOS 配置（留空则自动降级为模拟支付）
YUNGOUOS_MCHID = os.environ.get("YUNGOUOS_MCHID", "")
YUNGOUOS_KEY = os.environ.get("YUNGOUOS_KEY", "")
# 异步通知地址，部署后改为实际域名
YUNGOUOS_NOTIFY_URL = os.environ.get("YUNGOUOS_NOTIFY_URL", "")

# 是否启用模拟支付（当 YunGouOS 未配置时自动启用）
MOCK_PAY_ENABLED = True
