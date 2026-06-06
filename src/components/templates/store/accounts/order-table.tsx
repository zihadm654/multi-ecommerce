import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import React from "react";
import { DataTableCore } from "@/components/base/data-table/data-table-core";
import { DataTablePagination } from "@/components/base/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/base/data-table/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "@/components/base/store/order/columns";
import { useCustomerOrders } from "@/hooks/store/use-checkout";

export default function OrdersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [_rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // We need to manually manage pagination state for the controlled component
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isPending, error } = useCustomerOrders({
    limit: 10,
    offset: 0,
  });

  const orders = data?.orders ?? [];

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Failed to load orders. Please try again later.
          </p>
          <p className="text-destructive text-xs">{error.message}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="space-y-2">
          <p className="font-medium">No orders yet</p>
          <p className="text-muted-foreground text-sm">
            When you place an order, it will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        columnFilters={columnFilters}
        onColumnFilterChange={(columnId, value) => {
          setColumnFilters((prev) => {
            const filtered = prev.filter((f) => f.id !== columnId);
            if (value !== "" && value !== undefined && value !== null) {
              filtered.push({ id: columnId, value });
            }
            return filtered;
          });
        }}
        allColumns={columns.map((col) => ({
          id: (col as any).accessorKey || (col as any).id,
          label: ((col as any).header as string) || (col as any).id,
          visible: true,
          toggle: () => {},
        }))}
      />
      <DataTableCore
        columns={columns}
        data={orders}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        pageCount={Math.ceil(orders.length / pagination.pageSize)}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        enableRowSelection={true}
        onRowSelection={setRowSelection}
      />
      <DataTablePagination
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        pageCount={Math.ceil(orders.length / pagination.pageSize)}
        total={orders.length}
        onPageChange={setPagination}
      />
    </div>
  );
}
