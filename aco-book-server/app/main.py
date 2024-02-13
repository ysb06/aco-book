import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .database import db
from .routers import users, token, records

logger = logging.getLogger(__name__)


templates = Jinja2Templates(directory="templates")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@asynccontextmanager
async def lifespan(_: FastAPI):
    db.create_tables()
    yield
    db.dispose()


app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(users.router)
app.include_router(token.router)
app.include_router(records.router)


@app.get("/", response_class=HTMLResponse)
def get_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
