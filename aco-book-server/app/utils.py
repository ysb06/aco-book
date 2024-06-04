from typing import Any, Dict, List, Optional, Set, Union
from sqlalchemy.orm import DeclarativeMeta, Session
from sqlalchemy.sql.sqltypes import Enum
from sqlalchemy.sql.schema import ForeignKey
import enum
from datetime import datetime, timezone

def generate_standard_response(
    data: Union[List[DeclarativeMeta], List[Dict[Any, Any]]],
    db_type: Optional[DeclarativeMeta] = None,
    db: Optional[Session] = None,
):
    """모든 API 응답에 사용되는 표준 응답을 생성합니다. 현재는 변환된 데이터도 받지만 차후에는 쿼리 결과만 받도록 수정할 예정입니다.

    Args:
        data (Union[List[DeclarativeMeta], List[Dict[Any, Any]]]): 쿼리 완료된 데이터
        db_type (Optional[DeclarativeMeta], optional): 응답 결과에 속성과 타입을 명시할 때 제공. Defaults to None.
        db (Optional[Session], optional): 응답 결과에 외부키 관계를 명시할 때 제공. Defaults to None.

    Returns:
        _type_: _description_
    """
    if len(data) > 0 and isinstance(data[0], dict) == False:
        data = convert_general_format(data)

    response_body = {
        "data": data,
    }

    if db_type is not None:
        coloumns = db_type.__table__.columns.keys()
        response_body["columns"] = coloumns

        dtypes = {col.name: str(col.type) for col in db_type.__table__.columns}
        response_body["dtypes"] = dtypes
        for col in db_type.__table__.columns:
            if type(col.type) == Enum:
                dtypes[col.name] = col.type.enums
            elif db is not None and col.foreign_keys:
                dtypes[col.name] = get_foreign_sublist(db, col.foreign_keys)[0]
                # 일단 이중 Foreign Key는 고려하지 않음
            else:
                dtypes[col.name] = str(col.type)

    return response_body

def get_foreign_sublist(db: Session, foreign_keys: Set[ForeignKey]) -> List[Union[Dict[str, int], List[int]]]:
    sublist = []
    for foreign_key in foreign_keys:
        ref_table = foreign_key.column.table
        ref_col_id = foreign_key.column.key
        ref_col_name = 'name'

        if ref_col_name in ref_table.c:
            ref_entities = db.query(ref_table.c[ref_col_id], ref_table.c[ref_col_name]).all()
            ref_dict = {entity[1]: entity[0] for entity in ref_entities}
        else:
            ref_entities = db.query(ref_table.c[ref_col_id]).all()
            ref_dict = [entity[0] for entity in ref_entities]
        
        sublist.append(ref_dict)
    
    return sublist

# --------------------------------------------------

def convert_general_format(data: List[DeclarativeMeta]):
    result = []
    for element in data:
        row = {}
        for col in element.__table__.columns:
            value = getattr(element, col.name)
            if isinstance(value, enum.Enum):
                row[col.name] = value.name
                continue

            if isinstance(value, datetime):
                row[col.name] = value.isoformat()
                continue

            row[col.name] = value
        result.append(row)
    return result



def convert_dict_format(data: List[DeclarativeMeta]):
    result = {col.name: [] for col in data[0].__table__.columns}
    for element in data:
        for col in element.__table__.columns:
            result[col.name].append(getattr(element, col.name))

    return result

def parse_datetime(value: Union[int, str]):
    if isinstance(value, int):
        return datetime.fromtimestamp(value, timezone.utc)

    formats = [
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d"
    ]

    for fmt in formats:
        try:
            result = datetime.strptime(value, fmt).replace(tzinfo=timezone.utc)
            return result
        except ValueError:
            continue
    
    raise ValueError(f"Time data '{value}' does not match any of the formats.")