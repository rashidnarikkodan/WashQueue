import type { Column } from "./types"

interface TableHeaderProps<T> {
  columns: Column<T>[]
}

function TableHeader<T>({ columns }: TableHeaderProps<T>) {
  return (
    <thead>
      <tr className="bg-muted/30 border-b border-border/70 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
        {columns.map((col) => (
          <th
            key={col.id}
            className={`py-4 px-6 ${
              col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
            }`}
            style={col.width ? { width: col.width } : undefined}
          >
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export default TableHeader
