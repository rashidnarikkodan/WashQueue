import type { Column } from "./types";
import TableRow from "./TableRow";
import EmptyState from "./EmptyState";

interface TableBodyProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  errorMsg?: string | null;
  emptyMessage?: string;
}

function TableBody<T>({
  columns,
  data,
  rowKey,
  errorMsg,
  emptyMessage,
}: TableBodyProps<T>) {
  return (
    <tbody className="divide-y divide-border/60">
      {data.length > 0 ? (
        data.map((row) => (
          <TableRow key={rowKey(row)} row={row} columns={columns} />
        ))
      ) : (
        <EmptyState
          colSpan={columns.length}
          message={emptyMessage}
          errorMsg={errorMsg}
        />
      )}
    </tbody>
  );
}

export default TableBody;
