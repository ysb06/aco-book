from enum import Enum


class DBContext(Enum):
    Excel = ("Excel", "./aco_db.xlsx")
    Sqlite = ("SQLite", "sqlite:///./aco.db")


class EnvContext(Enum):
    Debug = "Local Debug"
    Local = "Local Server"
    GCP = "Google Cloud Platform App Engine"


class Context:
    def __init__(self) -> None:
        self.__environment = EnvContext.Debug
        self.__database = DBContext.Sqlite
        # 추후 변하지 않는 형태로 변환
    
    @property
    def database_url(self) -> str:
        return self.__database.value[1]


CONTEXT = Context()
