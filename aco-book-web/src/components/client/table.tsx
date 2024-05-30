"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { DataTableRaw } from "libraries/server/requests";
import { toInputType } from "libraries/utils";
import { sendObjectRequest, sendIdsRequest } from "libraries/client/requests";

interface StandardDataTableProps {
  id: string;
  raw: DataTableRaw | null;
  schema?: string[];
}
export function DataTable({ id, raw, schema: schema }: StandardDataTableProps) {
  const router = useRouter();

  // State Variables
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [newData, setNewData] = useState<{ [key: string]: CellValue }>({});

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
  const handleDeleteButton = async () => {
    if (raw !== null) {
      const result = await sendIdsRequest("groups/", selectedRows, "DELETE");
      if (result.ok) {
        setSelectedRows(new Set());
        router.refresh();
      }
    }
  };
  const handleAddButton = async () => {
    if (raw !== null) {
      const result = await sendObjectRequest("groups/", newData);
      if (result.ok) {
        setNewData({});
        router.refresh();
      }
    }
  };

  let resultTable = <span>No Data...</span>;
  if (raw !== null) {

    resultTable = (
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <TableHeader id={id + "-table-header"} columns={raw.columns} />
        <tbody>
          {raw.data.map((row, index) => (
            <TableRow
              key={index}
              row={row}
              columns={raw.columns}
              checked={selectedRows.has(row.id as number)}
              onCheckboxChange={handleCheckboxChange}
            />
          ))}
          <NewDataRow
            columns={raw.columns}
            dtypes={raw.dtypes}
            newData={newData}
            setNewData={setNewData}
            schema={schema}
          />
        </tbody>
      </table>
    );
  }

  return (
    <div className="overflow-hidden shadow-md sm:rounded-lg">
      {resultTable}
      <div className="py-4 flex items-center justify-between">
        <button
          onClick={handleDeleteButton}
          className="flex-grow px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 mr-2"
        >
          삭제
        </button>
        <button
          onClick={handleAddButton}
          className="flex-grow px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 ml-2"
        >
          추가
        </button>
      </div>
    </div>
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
  columns: string[];
  dtypes: { [key: string]: string };
  newData: { [key: string]: CellValue };
  setNewData: React.Dispatch<
    React.SetStateAction<{ [key: string]: CellValue }>
  >;
  schema?: string[];
}
function NewDataRow({
  columns,
  dtypes,
  newData,
  setNewData,
  schema = [],
}: NewDataRowProps) {
  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <td className="px-4 py-4" />
      {columns.map((column, index) => {
        if (schema.includes(column) === false) {
          return (
            <td key={index} className="px-6 py-4">
              <div />
            </td>
          );
        }
        const dtype = toInputType(dtypes[column]);
        return (
          <td key={index} className="px-6 py-4">
            <input
              type={dtype}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder={`Enter ${column}...`}
              onChange={(event) =>
                setNewData({ ...newData, [column]: event.target.value })
              }
              value={newData[column] ? newData[column] : ""}
            />
          </td>
        );
      })}
    </tr>
  );
}

interface TableRowProps {
  row: { [key: string]: string | number };
  columns: string[];
  checked: boolean;
  onCheckboxChange: (id: number) => void;
}
function TableRow({ row, columns, checked, onCheckboxChange }: TableRowProps) {
  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onCheckboxChange(row.id as number)}
        />
      </td>
      {columns.map((columnKey, index) => (
        <TableData key={index} value={row[columnKey]} />
      ))}
    </tr>
  );
}

interface TableDataProps {
  value: string | number;
}
function TableData({ value }: TableDataProps) {
  return <td className="px-6 py-4">{value}</td>;
}

interface DataControlBoxProps {
  columns: string[];
}

type CellValue = string | number;
type GeneralDataType = Array<{ [key: string]: CellValue }>;
interface TableRequest {
  selections: Set<number>;
  newData: { [key: string]: CellValue };
}
interface DataTableProps {
  id: string;
  data?: GeneralDataType | undefined;
  onRequestChanged?: (req: TableRequest) => void;
}

interface TableBodyProps {
  id: string;
  columns: string[];
  data: GeneralDataType;
  onRequestChanged?: (req: TableRequest) => void;
}

function TableBody({ id, columns, data, onRequestChanged }: TableBodyProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [newData, setNewData] = useState<{ [key: string]: CellValue }>({});
  const handleCheckboxChange = (id: number) => {};

  return (
    <tbody id={id}>
      {data.map((row, index) => (
        <tr
          key={index}
          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
        >
          <td className="px-4 py-4">
            <input
              type="checkbox"
              checked={selectedRows.has(row.id as number)}
              onChange={() => handleCheckboxChange(row.id as number)}
            />
          </td>
          {columns.map((column) => (
            <td key={column} className="px-6 py-4">
              {row[column]}
            </td>
          ))}
        </tr>
      ))}
      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
        {columns.map((column, index) => (
          <td key={index} className="px-6 py-4"></td>
        ))}
      </tr>
    </tbody>
  );
}