import smtplib
import random
import threading
from email.mime.text import MIMEText
from datetime import datetime, timedelta, timezone

# --- CONFIG: 改成你的 126 邮箱 ---
SMTP_HOST = "smtp.126.com"
SMTP_PORT = 25
SMTP_USER = "zzr2282328134@126.com"
SMTP_PASS = "FZwnC37v4xXvHyMR"
# ---

# 验证码存储 { email: { code, expires_at } }
_codes: dict[str, dict] = {}
_lock = threading.Lock()

# 清理过期验证码（每 5 分钟清理一次）
def _cleanup():
    now = datetime.now(timezone.utc)
    with _lock:
        expired = [k for k, v in _codes.items() if v["expires_at"] < now]
        for k in expired:
            del _codes[k]
    t = threading.Timer(300, _cleanup)
    t.daemon = True
    t.start()

# 清理函数，由 main.py 在 startup 时调用
def start_cleanup():
    t = threading.Timer(60, _cleanup)
    t.daemon = True
    t.start()


def send_verification_code(email: str) -> bool:
    """发送验证码到指定邮箱，返回是否成功"""
    code = str(random.randint(100000, 999999))

    msg = MIMEText(
        f"您的 ZZR 验证码是：{code}\n\n"
        f"验证码有效期为 5 分钟，请勿泄露给他人。\n\n"
        f"如果不是您本人操作，请忽略此邮件。",
        "plain", "utf-8"
    )
    msg["Subject"] = "ZZR 邮箱验证码"
    msg["From"] = SMTP_USER
    msg["To"] = email

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)

        with _lock:
            _codes[email] = {
                "code": code,
                "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5),
            }
        return True
    except Exception as e:
        print(f"Failed to send email to {email}: {e}")
        return False


def verify_code(email: str, code: str) -> bool:
    """验证验证码是否正确且在有效期内"""
    with _lock:
        data = _codes.get(email)
        if not data:
            return False
        if datetime.now(timezone.utc) > data["expires_at"]:
            del _codes[email]
            return False
        if data["code"] != code:
            return False
        del _codes[email]
        return True
