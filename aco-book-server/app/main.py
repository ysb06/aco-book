import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from .database import db
from .routers import users, token, assets, groups, records

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.DEBUG)


templates = Jinja2Templates(directory="templates")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@asynccontextmanager
async def lifespan(_: FastAPI):
    db.create_tables()
    yield
    db.dispose()


app = FastAPI(lifespan=lifespan, logger=logger, debug=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(users.router)
app.include_router(token.router)
app.include_router(groups.router)
app.include_router(assets.router)
app.include_router(records.router)

# 모든 출처 허용
# Todo: 추후 외부 서버 개발 시, CORS 설정 삭제 또는 수정 필요
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 특정 도메인으로 제한 가능
    allow_credentials=True,
    allow_methods=["GET", "POST", "UPDATE", "DELETE", "HEAD", "OPTIONS"],
    allow_headers=[
        "Access-Control-Allow-Headers",
        "Content-Type",
        "Authorization",
        "Content-Length",
        "X-CSRF-Token",
        "X-Requested-With",
        "Accept",
        "Accept-Version",
        "Content-MD5",
        "Date",
        "X-Api-Version",
    ],
)


@app.get("/", response_class=HTMLResponse)
def get_prototype_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
