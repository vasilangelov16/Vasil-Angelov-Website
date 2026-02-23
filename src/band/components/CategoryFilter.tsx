import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { APPLE_SPRING, APPLE_TAP } from "@/band/constants";
import type { RepertoireCategory } from "@/band/types";
import { CATEGORY_COLORS, REPERTOIRE_CATEGORIES } from "@/band/types";

export const CategoryFilter = memo(
  ({
    value,
    onChange,
    className,
  }: {
    value: RepertoireCategory;
    onChange: (v: RepertoireCategory) => void;
    className?: string;
  }) => (
    <div
      className={cn("flex gap-1.5 overflow-x-auto pb-1 -mx-1 hide-scrollbar", className)}
      role="tablist"
      aria-label="Filter by category"
    >
      {REPERTOIRE_CATEGORIES.map((cat) => {
        const colors = cat.value !== "all" ? CATEGORY_COLORS[cat.value] : null;
        return (
          <motion.button
            key={cat.value}
            type="button"
            role="tab"
            aria-selected={value === cat.value}
            aria-label={`Filter: ${cat.label}`}
            onClick={() => onChange(cat.value)}
            whileTap={APPLE_TAP}
            transition={APPLE_SPRING}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors touch-manipulation whitespace-nowrap",
              cat.value === "all"
                ? value === "all"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                : value === cat.value
                  ? cn(colors?.bgActive, "text-white")
                  : cn(colors?.bg, colors?.text, "hover:opacity-90")
            )}
          >
            {cat.label}
          </motion.button>
        );
      })}
    </div>
  )
);
CategoryFilter.displayName = "CategoryFilter";
