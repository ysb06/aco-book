export type DataType = string | string[] | { [key: string]: number };

const DB_TO_INPUT_TYPE: { [key: string]: string } = {
  VARCHAR: "text",
  INTEGER: "number",
  FLOAT: "number",
  BOOLEAN: "checkbox",
  DATETIME: "datetime-local",
  DATE: "date",
  TIME: "time",
};

export function toInputType(dbtype: string): string {
  return DB_TO_INPUT_TYPE[dbtype.split("(")[0]] || "text";
}

export function isString(value: any): value is string {
  return typeof value === "string";
}

export function isStringArray(value: any): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

export function isNumberObject(value: any): value is { [key: string]: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((item) => typeof item === "number")
  );
}

export function isDataType(value: any): value is DataType {
  return isString(value) || isStringArray(value) || isNumberObject(value);
}

// ------------------------------------------------------------

export function invertObject(obj: { [key: string]: number }): {
  [key: number]: string;
} {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {} as { [key: string]: string });
}
