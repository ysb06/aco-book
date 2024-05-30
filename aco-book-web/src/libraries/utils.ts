enum PythonToInputType {
  int = "number",
  float = "number",
  str = "text",
  bool = "checkbox",
}

export function toInputType(pythonType: string): string {
  return (
    PythonToInputType[pythonType as keyof typeof PythonToInputType] || "text"
  );
}
