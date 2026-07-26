"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  label: string;
  format?: (value: number, row: T) => string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
}

interface ResultsTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  title?: string;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
}

export function ResultsTable<T extends Record<string, unknown>>({
  columns,
  data,
  pageSize = 10,
  title,
  onExportCSV,
  onExportExcel,
}: ResultsTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const totalPages = Math.ceil(data.length / pageSize);

  let sortedData = [...data];
  if (sortKey) {
    sortedData.sort((a, b) => {
      const aVal = Number(a[sortKey]) || 0;
      const bVal = Number(b[sortKey]) || 0;
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }

  const pageData = sortedData.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="glass-effect rounded-xl overflow-hidden">
      {title && (
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
          <div className="flex gap-2">
            {onExportCSV && (
              <button
                onClick={onExportCSV}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-outline"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-outline"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-6 py-4 label-caps text-on-surface-variant uppercase tracking-wider",
                    col.sortable && "cursor-pointer select-none",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={cn(
                    "flex items-center gap-1",
                    col.align === "right" && "justify-end",
                    col.align === "center" && "justify-center"
                  )}>
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-[10px]">
                        {sortDir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {pageData.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-primary/5 transition-colors group"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-6 py-4 font-data text-on-surface",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center"
                    )}
                  >
                    {col.format
                      ? col.format(Number(row[col.key]), row)
                      : String(row[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-outline-variant/10 flex items-center justify-between">
          <p className="font-data text-xs text-on-surface-variant">
            Showing {page * pageSize + 1}–
            {Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="border-outline-variant/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="border-outline-variant/30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
