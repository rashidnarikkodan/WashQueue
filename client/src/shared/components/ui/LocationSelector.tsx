import { MapPin, ChevronDown } from "lucide-react";

interface LocationSelectorProps {
  className?: string;
}

export default function LocationSelector({ className = "" }: LocationSelectorProps) {
  return (
    <div className={`flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${className}`}>
      <MapPin className="h-3.5 w-3.5 text-primary" />
      <span>Kavanur, Malappuram</span>
      <ChevronDown className="h-3 w-3" />
    </div>
  );
}
