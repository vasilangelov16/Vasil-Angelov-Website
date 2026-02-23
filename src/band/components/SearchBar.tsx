import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { APPLE_SPRING, APPLE_TAP } from "@/band/constants";

export const SearchBar = memo(
  ({
    value,
    onChange,
    onClear,
  }: {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
  }) => (
    <motion.div
      className="relative flex items-center min-h-[44px] bg-white border border-gray-200/80 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-200/60 focus-within:shadow-sm transition-all duration-200"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Search
        className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none shrink-0"
        aria-hidden
      />
      <input
        type="text"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search songs..."
        aria-label="Search songs"
        autoComplete="off"
        className="flex-1 min-w-0 pl-9 pr-11 py-3 sm:py-2.5 bg-transparent border-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-base touch-manipulation"
      />
      <AnimatePresence>
        {value && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={APPLE_SPRING}
            className="absolute inset-y-0 right-0 flex items-center pr-1.5"
          >
            <motion.button
              type="button"
              onClick={onClear}
              whileTap={APPLE_TAP}
              aria-label="Clear search"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 touch-manipulation transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
);
SearchBar.displayName = "SearchBar";
