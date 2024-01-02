from typing import Any, Dict, Optional
from typing_extensions import Annotated, Doc
import jwt
from datetime import datetime, timezone
import hashlib
from fastapi import HTTPException


class VerificationFailedError(HTTPException):
    def __init__(self, text: str) -> None:
        super().__init__(401, text)


activated_sessions: Dict[str, int] = {}


def generate_token(user_id: int):
    token = jwt.encode(
        {"iat": datetime.now(tz=timezone.utc)}, "ms_key", algorithm="HS256"
    )
    activated_sessions[token] = user_id

    return token


def verify_token(token: str) -> int:
    user_id = -1

    # 차후 권한 관련 코드도 작성
    
    if token is None:
        raise VerificationFailedError("No Token")

    try:
        _ = jwt.decode(token, key="ms_key", algorithms=["HS256"])
        user_id = activated_sessions[token]
    except jwt.exceptions.InvalidSignatureError:
        raise VerificationFailedError("Token not valid")
    except KeyError:
        raise VerificationFailedError("No session for token")

    return user_id


def hash_password(password: str) -> str:
    # https://fastapi.tiangolo.com/tutorial/security/simple-oauth2/
    # 위 사이트를 참고해서 좀 더 보안을 고려한
    return hashlib.sha256(password.encode()).hexdigest()
