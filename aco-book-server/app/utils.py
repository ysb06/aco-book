from typing import List
from sqlalchemy.orm import DeclarativeMeta

def convert_general_format(data: List[DeclarativeMeta]):
    return [{col.name: getattr(element, col.name) for col in element.__table__.columns} for element in data]

def convert_dict_format(data: List[DeclarativeMeta]):
    result = {col.name: [] for col in data[0].__table__.columns}
    for element in data:
        for col in element.__table__.columns:
            result[col.name].append(getattr(element, col.name))
    
    return result