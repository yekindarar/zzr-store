"""
YunGouOS 支付模块
微信 Native 扫码支付（主扫）
文档: https://open.pay.yungouos.com
"""
import hashlib
import json
from urllib.parse import urlencode
import urllib.request
from typing import Optional

from . import config

YUNGOUOS_API_NATIVE = "https://api.pay.yungouos.com/api/pay/wxpay/nativePay"
YUNGOUOS_API_QUERY = "https://api.pay.yungouos.com/api/pay/wxpay/getOrderInfo"


def _sign(params: dict, key: str) -> str:
    """
    YunGouOS 签名算法：
    1. 参数按 key 排序
    2. 拼接成 key1=value1&key2=value2&key=商户密钥
    3. MD5 加密后转大写
    """
    filtered = {k: v for k, v in params.items() if v != "" and k != "sign"}
    sorted_keys = sorted(filtered.keys())
    raw = "&".join(f"{k}={filtered[k]}" for k in sorted_keys)
    raw += "&key=" + key
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
        print(f"[YUNGOUOS] HTTP request failed: {e}")
        return None


def is_configured() -> bool:
    """检查 YunGouOS 是否已配置"""
    return bool(config.YUNGOUOS_MCHID and config.YUNGOUOS_KEY)


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
        body: 订单标题
        attach: 附加数据，回调时原样返回
        notify_url: 异步通知地址
    
    Returns:
        成功: {"code": 0, "data": {"code_url": "weixin://wxpay/...", "order_no": "...", "total_fee": "..."}}
        失败: {"code": 非0, "msg": "错误信息"}
        None: 网络错误
    """
    mchid = config.YUNGOUOS_MCHID
    key = config.YUNGOUOS_KEY
    notify_url = notify_url or config.YUNGOUOS_NOTIFY_URL

    if not mchid or not key:
        return {"code": -1, "msg": "YunGouOS 未配置"}

    params = {
        "mch_id": mchid,
        "out_trade_no": out_trade_no,
        "total_fee": str(total_fee),
        "body": body,
    }
    if attach:
        params["attach"] = attach
    if notify_url:
        params["notify_url"] = notify_url

    params["sign"] = _sign(params, key)
    return _post_json(YUNGOUOS_API_NATIVE, params)


def query_order(out_trade_no: str) -> Optional[dict]:
    """
    查询订单支付状态
    
    Returns:
        成功: {"code": 0, "data": {"out_trade_no": "...", "status": 0/1, "total_fee": "...", ...}}
        失败: {"code": 非0, "msg": "..."}
    """
    mchid = config.YUNGOUOS_MCHID
    key = config.YUNGOUOS_KEY

    if not mchid or not key:
        return {"code": -1, "msg": "YunGouOS 未配置"}

    params = {
        "mch_id": mchid,
        "out_trade_no": out_trade_no,
    }
    params["sign"] = _sign(params, key)
    return _post_json(YUNGOUOS_API_QUERY, params)


def verify_notify(params: dict) -> bool:
    """
    验证异步通知签名
    
    Args:
        params: YunGouOS 回调 POST 的所有参数
    
    Returns:
        True 签名有效
    """
    key = config.YUNGOUOS_KEY
    if not key:
        return False
    sign = params.pop("sign", "")
    if not sign:
        return False
    expected = _sign(params, key)
    return sign == expected
