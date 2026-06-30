"""
PAYJS 支付模块
Native 扫码支付（主扫）
文档: https://payjs.cn/docs/api/native.html
签名算法: https://payjs.cn/docs/api/sign.html
"""
import hashlib
import json
from urllib.parse import urlencode
import urllib.request
import urllib.error
from typing import Optional

from . import config

PAYJS_API_NATIVE = "https://payjs.cn/api/native"
PAYJS_API_CHECK = "https://payjs.cn/api/check"


def _sign(params: dict, key: str) -> str:
    """PAYJS 签名算法：参数按 key 排序后拼接 &key=xxx，MD5 后转大写"""
    filtered = {k: v for k, v in params.items() if v != "" and k != "sign"}
    sorted_keys = sorted(filtered.keys())
    raw = "&".join(f"{k}={filtered[k]}" for k in sorted_keys)
    raw += f"&key={key}"
    return hashlib.md5(raw.encode("utf-8")).hexdigest().upper()


def _post_json(url: str, params: dict) -> Optional[dict]:
    """POST application/x-www-form-urlencoded 并解析 JSON 响应"""
    data = urlencode(params).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"[PAYJS] HTTP request failed: {e}")
        return None


def is_configured() -> bool:
    """检查 PayJS 是否已配置"""
    return bool(config.PAYJS_MCHID and config.PAYJS_KEY)


def native_pay(
    total_fee: int,
    out_trade_no: str,
    body: str = "ZZR Store",
    attach: str = "",
    notify_url: str = "",
) -> Optional[dict]:
    """
    Native 扫码支付（主扫）
    
    Args:
        total_fee: 金额，单位：分
        out_trade_no: 商户订单号
        body: 订单标题，最长 64 字符
        attach: 自定义数据，回调时原样返回
        notify_url: 异步通知地址
    
    Returns:
        成功: {"return_code": 1, "return_msg": "SUCCESS", "qrcode": "weixin://...", ...}
        失败: {"return_code": 0, "return_msg": "错误信息"}
        None: 网络错误
    """
    mchid = config.PAYJS_MCHID
    key = config.PAYJS_KEY
    notify_url = notify_url or config.PAYJS_NOTIFY_URL

    if not mchid or not key:
        return {"return_code": 0, "return_msg": "PAYJS 未配置"}

    params = {
        "mchid": mchid,
        "total_fee": str(total_fee),
        "out_trade_no": out_trade_no,
        "body": body[:64],
    }
    if attach:
        params["attach"] = attach
    if notify_url:
        params["notify_url"] = notify_url

    params["sign"] = _sign(params, key)
    return _post_json(PAYJS_API_NATIVE, params)


def check_pay(out_trade_no: str) -> Optional[dict]:
    """
    查询订单支付状态
    
    Returns:
        已支付: {"return_code": 1, "status": 1, "out_trade_no": "...", "total_fee": "..."}
        未支付: {"return_code": 1, "status": 0, ...}
    """
    mchid = config.PAYJS_MCHID
    key = config.PAYJS_KEY

    if not mchid or not key:
        return {"return_code": 0, "return_msg": "PAYJS 未配置"}

    params = {
        "mchid": mchid,
        "out_trade_no": out_trade_no,
    }
    params["sign"] = _sign(params, key)
    return _post_json(PAYJS_API_CHECK, params)


def verify_notify(params: dict) -> bool:
    """
    验证异步通知签名
    
    Args:
        params: PayJS 回调 POST 的所有参数（含 sign）
    
    Returns:
        True 签名有效，False 签名无效
    """
    key = config.PAYJS_KEY
    if not key:
        return False
    sign = params.pop("sign", "")
    if not sign:
        return False
    expected = _sign(params, key)
    return sign == expected
