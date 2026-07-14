import type { SelectFilter, ToggleFilter } from "./types";

interface FilterBarProps {
  selectFilters?: SelectFilter[];
  toggleFilters?: ToggleFilter[];
}

const FilterBar = ({
  selectFilters = [],
  toggleFilters = [],
}: FilterBarProps) => (
  <>
    {selectFilters.map((filter) => (
      <div key={filter.id} className="space-y-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
          {filter.label}
        </span>
        <select
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="w-full bg-muted border border-transparent rounded-xl px-3 py-2.5 text-sm text-[#DCE1FB] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold cursor-pointer"
        >
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    ))}

    {toggleFilters.length > 0 && (
      <div className="md:col-span-2 flex flex-row items-center gap-5 pb-1 select-none">
        {toggleFilters.map((filter) => (
          <div
            key={filter.id}
            onClick={() => filter.onChange(!filter.value)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 flex items-center ${
                filter.value
                  ? (filter.activeColor ?? "bg-primary/25 border border-primary/30")
                  : "bg-muted"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shadow transition-transform duration-200 ${
                  filter.value
                    ? `translate-x-4 ${filter.thumbActiveColor ?? "bg-[#ADC6FF]"}`
                    : "bg-[#8C909F]"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {filter.label}
            </span>
          </div>
        ))}
      </div>
    )}
  </>
);

export default FilterBar;
