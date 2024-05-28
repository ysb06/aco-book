"use client";

import React, { FormEvent } from "react";

interface DataControlBoxProps {
  columns: string[];
}

export function DataControlBox({ columns }: DataControlBoxProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 sm:rounded-lg">
      <div className="flex items-center justify-between">
        <button className="flex-grow px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 mr-2">
          삭제
        </button>
        <button className="flex-grow px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 ml-2">
          추가
        </button>
      </div>
      <DataUpdateBox columns={columns} />
    </div>
  );
}

export function DataUpdateBox({ columns }: DataControlBoxProps) {
  const handleSubmitButton = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(event.currentTarget);
  };

  return (
    <form onSubmit={handleSubmitButton} className="mt-4 space-y-4">
      {columns.map((column) => (
        <div key={column} className="flex items-center">
          <label className="w-1/3 text-gray-700 dark:text-gray-300">
            {column}:
          </label>
          <input
            type="text"
            className="w-2/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={`Enter ${column}...`}
          />
        </div>
      ))}
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Save New Row
      </button>
    </form>
  );
}
