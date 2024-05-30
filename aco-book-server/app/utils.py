from typing import Any, Dict, List, Union
from sqlalchemy.orm import DeclarativeMeta

def generate_standard_response(data: Union[List[DeclarativeMeta], List[Dict[Any, Any]]]):
    if len(data) == 0:
        return {"data": [], "columns": [], "dtypes": []}
    
    if isinstance(data[0], dict) == False:
        data = convert_general_format(data)
    
    coloumns = []
    dtypes = {}
    for key, value in data[0].items():
        coloumns.append(key)
        dtypes[key] = str(type(value).__name__)
    response_body = {"data": data, "columns": coloumns, "dtypes": dtypes}

    return response_body

def convert_general_format(data: List[DeclarativeMeta]):
    return [{col.name: getattr(element, col.name) for col in element.__table__.columns} for element in data]

def convert_dict_format(data: List[DeclarativeMeta]):
    result = {col.name: [] for col in data[0].__table__.columns}
    for element in data:
        for col in element.__table__.columns:
            result[col.name].append(getattr(element, col.name))
    
    return result