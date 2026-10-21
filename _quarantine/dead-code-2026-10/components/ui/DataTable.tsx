'use client';
import { useState, useRef, type CSSProperties } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type RowData,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  getRowKey: (row: TData, idx: number) => string;
  className?: string;
  headerStyle?: CSSProperties;
  rowStyle?: (row: TData) => CSSProperties | undefined;
  rowTestId?: (row: TData) => string;
  pageSize?: number;
}

const VIRTUAL_THRESHOLD = 50;
const ESTIMATED_ROW_H = 36;
const VIRTUAL_H = 480;

export function DataTable<TData>({
  data,
  columns,
  getRowKey,
  className,
  headerStyle,
  rowStyle,
  rowTestId,
  pageSize = 50,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const isPaginated = data.length > pageSize;
  const useVirtual = !isPaginated && data.length > VIRTUAL_THRESHOLD;

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: (updater) => {
      setSorting(updater);
      if (isPaginated) setPagination(p => ({ ...p, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const tableRows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => (useVirtual ? scrollRef.current : null),
    estimateSize: () => ESTIMATED_ROW_H,
    overscan: 5,
    enabled: useVirtual,
  });

  const thead = (
    <thead>
      {table.getHeaderGroups().map(hg => (
        <tr key={hg.id}>
          {hg.headers.map(header => {
            const canSort = header.column.getCanSort();
            const sorted = header.column.getIsSorted();
            const meta = header.column.columnDef.meta;
            return (
              <th
                key={header.id}
                className={cn('pb-2 pr-4 last:pr-0 text-left', meta?.className)}
                style={{ ...headerStyle, cursor: canSort ? 'pointer' : 'default', userSelect: 'none' }}
                onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
              >
                <span className="inline-flex items-center gap-0.5">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  {canSort && (
                    sorted === 'asc' ? <ChevronUp size={9} />
                      : sorted === 'desc' ? <ChevronDown size={9} />
                        : <ChevronsUpDown size={9} style={{ opacity: 0.3 }} />
                  )}
                </span>
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );

  if (useVirtual) {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
    const paddingBottom = virtualItems.length > 0
      ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

    return (
      <div ref={scrollRef} style={{ height: VIRTUAL_H, overflowY: 'auto' }}>
        <table className={cn('w-full border-collapse', className)}>
          {thead}
          <tbody>
            {paddingTop > 0 && (
              <tr><td colSpan={columns.length} style={{ height: paddingTop, padding: 0 }} /></tr>
            )}
            {virtualItems.map(vItem => {
              const row = tableRows[vItem.index];
              return (
                <tr
                  key={getRowKey(row.original, vItem.index)}
                  style={rowStyle?.(row.original)}
                  data-testid={rowTestId?.(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className={cn('py-2 pr-4 last:pr-0', cell.column.columnDef.meta?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr><td colSpan={columns.length} style={{ height: paddingBottom, padding: 0 }} /></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <table className={cn('w-full border-collapse', className)}>
        {thead}
        <tbody>
          {tableRows.map((row, idx) => (
            <tr
              key={getRowKey(row.original, idx)}
              style={rowStyle?.(row.original)}
              data-testid={rowTestId?.(row.original)}
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className={cn('py-2 pr-4 last:pr-0', cell.column.columnDef.meta?.className)}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {isPaginated && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
            {pagination.pageIndex * pagination.pageSize + 1}–{Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} of {data.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              style={{ background: 'none', border: 'none', cursor: table.getCanPreviousPage() ? 'pointer' : 'default', color: 'rgba(255,255,255,0.5)', padding: '2px', opacity: table.getCanPreviousPage() ? 1 : 0.3, lineHeight: 0 }}
            >
              <ChevronLeft size={12} />
            </button>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
              {pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              style={{ background: 'none', border: 'none', cursor: table.getCanNextPage() ? 'pointer' : 'default', color: 'rgba(255,255,255,0.5)', padding: '2px', opacity: table.getCanNextPage() ? 1 : 0.3, lineHeight: 0 }}
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
