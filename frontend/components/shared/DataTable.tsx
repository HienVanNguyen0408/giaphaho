'use client';

import { ReactNode } from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  loading = false,
  emptyMessage = 'Không có dữ liệu',
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <>
                {[...Array(3)].map((_, rowIdx) => (
                  <tr key={rowIdx} className="animate-pulse">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-5 py-3.5">
                        <div className="h-4 bg-stone-100 rounded-md" />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-stone-400 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id != null ? String(row.id) : rowIdx}
                  className={`hover:bg-stone-50 transition-colors ${rowIdx % 2 === 1 ? 'bg-stone-50/40' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-5 py-3.5 text-stone-700">
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
