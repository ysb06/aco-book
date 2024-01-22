from database import *
from contextlib import asynccontextmanager

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(_: FastAPI):
    db.create_tables()
    yield
    db.dispose()


db = Database()