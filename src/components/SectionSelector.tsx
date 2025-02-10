import { cn } from "@/lib/utils";
import { BarChart3, Table } from "lucide-react";

interface SectionSelectorProps {
  activeSection: "table" | "analytics";
  onSectionChange: (section: "table" | "analytics") => void;
}

export function SectionSelector({
  activeSection,
  onSectionChange,
}: SectionSelectorProps) {
  return (
    <div className="inline-flex items-center justify-center p-1.5 bg-[hsl(var(--muted))] rounded-full shadow-sm">
      <button
        onClick={() => onSectionChange("table")}
        className={cn(
          "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all",
          "hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] hover:shadow-md",
          "active:scale-95",
          activeSection === "table"
            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md"
            : "text-[hsl(var(--muted-foreground))]"
        )}
      >
        <Table className="w-4 h-4" />
        <span>Projects</span>
      </button>
      <button
        onClick={() => onSectionChange("analytics")}
        className={cn(
          "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all",
          "hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] hover:shadow-md",
          "active:scale-95",
          activeSection === "analytics"
            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md"
            : "text-[hsl(var(--muted-foreground))]"
        )}
      >
        <BarChart3 className="w-4 h-4" />
        <span>Analytics</span>
      </button>
    </div>
  );
}
