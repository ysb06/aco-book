type CellValue = string | number;
type Row = CellValue[];
type ColumnData = Row[];
type GeneralDataType = Array<{ [key: string]: CellValue }>;
type DictDataType = { [key: string]: ColumnData };

interface DictDataTableProps {
  data?: DictDataType;
}

interface DataTableProps {
  data?: GeneralDataType | undefined;
}

export function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) {
    return <div>Loading...</div>;
  }
  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-hidden shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-6 py-3">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              {columns.map((column) => (
                <td key={column} className="px-6 py-4">
                  {row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export function EditableDataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) {
    return <div>Loading...</div>;
  }
  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-hidden shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3"></th>
            {columns.map((column) => (
              <th key={column} className="px-6 py-3">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td className="px-4 py-4"><input type="checkbox"/></td>
              {columns.map((column) => (
                <td key={column} className="px-6 py-4">
                  {row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DictDataTable({ data }: DictDataTableProps) {
  if (data == undefined) {
    return <div>Loading...</div>;
  } else {
    const columns = Object.keys(data);
    const rows = Object.values(data);

    return (
      <div className="overflow-hidden shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-3">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((elements, index_1) => (
              <tr
                key={index_1}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                {elements.map((cell, index_2) => (
                  <td key={index_2} className="px-6 py-4">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
