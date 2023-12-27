from enum import Enum
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, DeclarativeMeta

Base: DeclarativeMeta = declarative_base()
print(type(Base))

class Database:
    def __init__(self) -> None:
        self.engine = create_engine(
            "sqlite:///./core.db", connect_args={"check_same_thread": False}
        )
        self.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )
    
    def create_tables(self):
        Base.metadata.create_all(bind=self.engine)
    
    def dispose(self):
        self.SessionLocal.close_all()
        self.engine.dispose()
        

    def get_db(self):
        db = self.SessionLocal()
        try:
            yield db
        finally:
            db.close()
    



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String)
