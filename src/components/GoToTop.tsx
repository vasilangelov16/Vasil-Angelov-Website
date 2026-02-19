import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

const SCROLL_THRESHOLD = 400;
const EASE_SMOOTH = [0.32, 0.72, 0, 1] as const;

export const GoToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = useCallback(() => {
    setIsVisible(window.scrollY > SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          className="fixed z-[1001] flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-transparent hover:bg-white/5 hover:border-primary/30 text-muted-foreground hover:text-primary transition-colors duration-300 touch-manipulation min-w-[48px] min-h-[48px] bottom-[max(2rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))]"
          aria-label="Scroll to top"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.35, ease: EASE_SMOOTH }}
        >
          <ChevronUp size={22} strokeWidth={2} aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
