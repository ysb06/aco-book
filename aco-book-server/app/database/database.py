import enum

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    create_engine,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import DeclarativeMeta, relationship, sessionmaker


Base: DeclarativeMeta = declarative_base()


class Currency(enum.Enum):
    USD = "USD"
    KRW = "KRW"
    JPY = "JPY"


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

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String)


class FinancialRecord(Base):
    __tablename__ = "financial_records"

    # 컬럼 정의
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(DateTime, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String)
    detail = Column(String)
    asset = Column(String)
    payment_amount = Column(Float, nullable=False)
    currency = Column(Enum(Currency))
    approved_amount = Column(Float)
    note = Column(String)

    # User 테이블과의 관계
    user = relationship("User")

    def get_columns():
        return [col.name for col in FinancialRecord.__table__.columns]

db = Database()
