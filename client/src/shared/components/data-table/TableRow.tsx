import type { Column } from "./types";

interface TableRowProps<T> {
  row: T;
  columns: Column<T>[];
}

function TableRow<T>({ row, columns }: TableRowProps<T>) {
  return (
    <tr className="hover:bg-muted/10 transition-colors">
      {columns.map((col) => {
        const content = col.cell
          ? col.cell(row)
          : col.accessor !== undefined
          ? String(row[col.accessor] ?? "")
          : null;

        return (
          <td
            key={col.id}
            className={`py-4 px-6 ${
              col.align === "right"
                ? "text-right"
                : col.align === "center"
                ? "text-center"
                : ""
            }`}
          >
            {content}
          </td>
        );
      })}
    </tr>
  );
}

export default TableRow;
