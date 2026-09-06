import type React from "react"
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import type { Column } from "@/shared/components/data-table/types"
import type { VehicleClass, VehicleCategory } from "../types"

interface GetClassColumnsOptions {
  categories: VehicleCategory[]
  onToggleStatus: (row: VehicleClass, e: React.MouseEvent) => void
  onEdit: (row: VehicleClass, e: React.MouseEvent) => void
  onDelete: (row: VehicleClass, e: React.MouseEvent) => void
}

export const getClassColumns = ({
  categories,
  onToggleStatus,
  onEdit,
  onDelete,
}: GetClassColumnsOptions): Column<VehicleClass>[] => [
  {
    id: "name",
    header: "Class Name",
    accessor: "name",
    cell: (row) => <span className="font-bold text-slate-100">{row.name}</span>,
  },
  {
    id: "category",
    header: "Category",
    cell: (row) => {
      const parentCat = categories.find((c) => c.id === row.categoryId)
      return <span className="text-slate-350 text-slate-300">{parentCat?.name ?? "Unknown"}</span>
    },
  },
  {
    id: "description",
    header: "Description",
    cell: (row) => (
      <span className="text-slate-400 text-xs line-clamp-1 max-w-[200px]" title={row.description}>
        {row.description || "-"}
      </span>
    ),
  },
  {
    id: "slug",
    header: "Slug / Code",
    accessor: "slug",
    cell: (row) => <span className="font-mono text-slate-400 text-xs">{row.slug}</span>,
  },
  {
    id: "order",
    header: "Display Order",
    accessor: "order",
    align: "center",
    cell: (row) => <span className="text-slate-400">{row.order}</span>,
  },
  {
    id: "status",
    header: "Status",
    align: "center",
    cell: (row) => (
      <span
        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
          row.isActive
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
            : "bg-red-500/10 text-red-400 border-red-500/25"
        }`}
      >
        {row.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    align: "right",
    cell: (row) => (
      <div className="flex items-center justify-end gap-2.5">
        <button
          onClick={(e) => onToggleStatus(row, e)}
          className="p-1.5 text-slate-400 hover:text-[#ADC6FF] hover:bg-[#2E3447]/60 rounded-lg transition-colors cursor-pointer"
          title={row.isActive ? "Deactivate Class" : "Activate Class"}
        >
          {row.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
        <button
          onClick={(e) => onEdit(row, e)}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-[#2E3447]/60 rounded-lg transition-colors cursor-pointer"
          title="Edit Class"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={(e) => onDelete(row, e)}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#2E3447]/60 rounded-lg transition-colors cursor-pointer"
          title="Delete Class"
        >
          <Trash2 size={13} />
        </button>
      </div>
    ),
  },
]
