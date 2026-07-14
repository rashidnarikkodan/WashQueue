import { Search as SearchIcon } from "lucide-react";

interface SearchProps {
  value: string;
  onChange: (q: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const Search = ({
  value,
  onChange,
  placeholder = "Search...",
  label = "Search",
  className = "",
}: SearchProps) => (
  <div className={`space-y-2 w-full text-left ${className}`}>
    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
      {label}
    </span>
    <div className="relative">
      <SearchIcon
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={16}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-muted border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#DCE1FB] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/75"
      />
    </div>
  </div>
);

export default Search;
