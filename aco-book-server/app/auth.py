from typing import Any, Dict, Optional, Tuple
import jwt
from datetime import datetime, timezone, timedelta
import hashlib
from fastapi import HTTPException


class VerificationFailedError(HTTPException):
    def __init__(self, text: str) -> None:
        super().__init__(401, text)


def generate_token(user_id: int, expire_time: int = 60) -> str:
    current_dt = datetime.now(tz=timezone.utc)
    token = jwt.encode(
        {
            "iss": "aco",
            "iat": current_dt,
            "exp": current_dt + timedelta(minutes=expire_time),
            "user_id": user_id,
        },
        "ms_key",
        algorithm="HS256",
    )
    # Todo: 차후 그룹 정보도 함께 넣는 것을 고려
    return token


def verify_token(token: Optional[str]) -> int:
    user_id = -1
    if token is None:
        raise VerificationFailedError("No Token")

    try:
        decoded_token = jwt.decode(token, key="ms_key", algorithms=["HS256"])
        user_id = decoded_token["user_id"]
    except jwt.InvalidSignatureError:
        raise VerificationFailedError("Token not valid")
    except jwt.ExpiredSignatureError:
        raise VerificationFailedError("Token expired")

    return user_id


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()
