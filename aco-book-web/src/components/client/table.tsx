"use client";

import { sendIdsRequest, sendObjectRequest } from "libraries/client/requests";
import { DataTableRaw } from "libraries/server/requests";
import {
  DataType,
  invertObject,
  isNumberObject,
  isString,
  isStringArray,
  toInputType,
} from "libraries/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type CellValue = string | number;

interface StandardDataTableProps {
  id: string;
  raw: DataTableRaw | null;
  path: string;
  schema?: string[];
}
export function DataTable({
  id,
  raw,
  path: route,
  schema,
}: StandardDataTableProps) {
  const router = useRouter();

  // State Variables
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [newRow, setNewRow] = useState<{ [key: string]: CellValue }>({});

  // Event Handlers
  const handleCheckboxChange = (id: number) => {
    const newSelections = new Set(selectedRows);
    if (newSelections.has(id)) {
      newSelections.delete(id);
    } else {
      newSelections.add(id);
    }
    setSelectedRows(newSelections);
  };

  let resultTable = <span>No Data...</span>;
  if (raw !== null) {
    resultTable = (
      <div className="overflow-auto max-h-[60vh]">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <TableHeader id={id + "-table-header"} columns={raw.columns} />
          <tbody>
            {raw.data.map((row, index) => (
              <TableRow
                key={index}
                columns={raw.columns}
                row={row}
                dtypes={raw.dtypes}
                checked={selectedRows.has(row.id as number)}
                onCheckboxChange={handleCheckboxChange}
              />
            ))}
            <TableNewRow
              dataInfo={{
                columns: raw.columns,
                dtypes: raw.dtypes,
              }}
              dataState={{ newData: newRow, setNewData: setNewRow }}
              schema={schema}
            />
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="shadow-md sm:rounded-lg">
      {resultTable}
      <div className="py-4 flex items-center justify-between">
        <DeleteButton route={route} targetRows={selectedRows} />
        <AddButton route={route} newRow={newRow} />
      </div>
    </div>
  );
}

interface TableRowProps {
  columns: string[];
  row: { [key: string]: string | number };
  dtypes: { [key: string]: DataType };
  checked: boolean;
  onCheckboxChange: (id: number) => void;
}
function TableRow({
  columns,
  row,
  dtypes,
  checked,
  onCheckboxChange,
}: TableRowProps) {
  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onCheckboxChange(row.id as number)}
        />
      </td>
      {columns.map((columnKey, index) => {
        const dtype = dtypes[columnKey];
        let value = row[columnKey];
        if (isNumberObject(dtype)) {
          return <TableData key={index} value={value} dtype={dtype} />;
        } else {
          return <TableData key={index} value={value} />;
        }
      })}
    </tr>
  );
}

interface TableDataProps {
  value: string | number;
  dtype?: { [key: string]: number };
}
function TableData({ value, dtype }: TableDataProps) {
  let displayValue = value;

  if (typeof value === "number") {
    displayValue = value.toLocaleString();
  }

  if (dtype !== undefined) {
    displayValue = `[${value}] ${invertObject(dtype)[value as number]}`;
  }
  return <td className="px-6 py-4">{displayValue}</td>;
}

interface DeleteButtonProps {
  route: string;
  targetRows: Set<number>;
}
function DeleteButton({ route, targetRows }: DeleteButtonProps) {
  const router = useRouter();
  const handleDeleteButton = async () => {
    if (targetRows.size > 0) {
      const result = await sendIdsRequest(route, "DELETE", targetRows);
      if (result.ok) {
        router.refresh();
      }
    }
  };

  return (
    <button
      onClick={handleDeleteButton}
      className="flex-grow px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 mr-2"
    >
      삭제
    </button>
  );
}

interface AddButtonProps {
  route: string;
  newRow: { [key: string]: CellValue };
}
function AddButton({ route, newRow }: AddButtonProps) {
  const router = useRouter();
  const handleAddButton = async () => {
    if (Object.keys(newRow).length > 0) {
      const result = await sendObjectRequest(route, "POST", newRow);
      if (result.ok) {
        router.refresh();
      }
    }
  };

  return (
    <button
      onClick={handleAddButton}
      className="flex-grow px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 ml-2"
    >
      추가
    </button>
  );
}

interface TableHeaderProps {
  id: string;
  columns: string[];
}
function TableHeader({ id, columns }: TableHeaderProps) {
  return (
    <thead
      id={id}
      className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
    >
      <tr>
        <th className="px-4 py-3"></th>
        {columns.map((column) => (
          <th key={column} className="px-6 py-3">
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

interface NewDataRowProps {
  dataInfo: {
    columns: string[];
    dtypes: { [key: string]: DataType };
  };
  dataState: {
    newData: { [key: string]: CellValue };
    setNewData: React.Dispatch<
      React.SetStateAction<{ [key: string]: CellValue }>
    >;
  };
  schema?: string[];
}
function TableNewRow({ dataInfo, dataState, schema = [] }: NewDataRowProps) {
  const { columns, dtypes } = dataInfo;
  const { newData, setNewData } = dataState;
  const handleDataChange = (column: string, value: CellValue) => {
    if (value === "" || value === undefined) {
      const { [column]: _, ...rest } = newData;
      setNewData(rest);
    } else {
      setNewData({ ...newData, [column]: value });
    }
  };
  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <td className="px-4 py-4" />
      {columns.map((column, index) => {
        if (schema.includes(column) === false) {
          return <td key={index} className="px-6 py-4" />;
        }
        const dtype = dtypes[column];
        if (isStringArray(dtype)) {
          return (
            <ListTableNewData
              key={index}
              types={dtype}
              column={column}
              onChange={handleDataChange}
            />
          );
        } else if (isNumberObject(dtype)) {
          return (
            <DictTableNewData
              key={index}
              types={dtype}
              column={column}
              onChange={handleDataChange}
            />
          );
        } else if (isString(dtype)) {
          return (
            <SimpleTableNewData
              key={index}
              type={toInputType(dtype)}
              column={column}
              placeholder={`[${column}]`}
              onChange={handleDataChange}
            />
          );
        } else {
          return <td key={index} className="px-6 py-4" />;
        }
      })}
    </tr>
  );
}

interface TableNewDataProps {
  column: string;
  onChange: (column: string, value: CellValue) => void;
}
interface SimpleTableNewDataProps extends TableNewDataProps {
  type: string;
  placeholder: string;
}
function SimpleTableNewData({
  type,
  column,
  placeholder,
  onChange,
}: SimpleTableNewDataProps) {
  const [value, setValue] = useState<string | number>("");
  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const parsedValue = type === "number" ? parseFloat(inputValue) : inputValue;
    setValue(event.target.value);
    onChange(column, parsedValue);
  };

  return (
    <td className="px-6 py-4">
      <input
        type={type}
        step={0.1}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        placeholder={placeholder}
        value={value}
        onChange={handleOnChange}
      />
    </td>
  );
}

interface ListTableNewDataProps extends TableNewDataProps {
  types: string[];
}
function ListTableNewData({ types, column, onChange }: ListTableNewDataProps) {
  const [value, setValue] = useState<string | number>("");

  const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(event.target.value);
    onChange(column, event.target.value);
  };

  return (
    <td className="px-6 py-4">
      <select
        value={value}
        onChange={handleOnChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
      >
        <option value="">Select value...</option>
        {types.map((type, index) => (
          <option key={index} value={type}>
            {type}
          </option>
        ))}
      </select>
    </td>
  );
}

interface DictTableNewDataProps extends TableNewDataProps {
  types: { [key: string]: number };
}
function DictTableNewData({ types, column, onChange }: DictTableNewDataProps) {
  const [value, setValue] = useState<string | number>("");

  const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(event.target.value);
    onChange(column, types[event.target.value]);
  };

  return (
    <td className="px-6 py-4">
      <select
        value={value}
        onChange={handleOnChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
      >
        <option value="">Select value...</option>
        {Object.keys(types).map((type, index) => (
          <option key={index} value={type}>
            {type}
          </option>
        ))}
      </select>
    </td>
  );
}
