import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useMotionValue, animate, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { languages, type LanguageCode } from "@/i18n";
import { cn } from "@/lib/utils";
import { AnimatedText } from "@/components/AnimatedText";

const navKeys = [
  { key: "home", href: "#home" },
  { key: "biography", href: "#biography" },
  { key: "aura", href: "#aura" },
  { key: "music", href: "#music" },
  { key: "band", href: "#band" },
  { key: "liveGigs", href: "#live-gigs" },
  { key: "contact", href: "#contact" },
] as const;

const LanguageSwitcher = ({ variant = "default" }: { variant?: "default" | "mobile" }) => {
  const { i18n, t } = useTranslation();
  const current = (i18n.language === "mk" ? "mk" : "en") as LanguageCode;
  const next = current === "en" ? "mk" : "en";
  const ariaLabel = next === "en" ? t("lang.switchToEnglish") : t("lang.switchToMacedonian");
  const label = languages.find((l) => l.code === current)?.label ?? current.toUpperCase();

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      className={cn(
        "text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors",
        variant === "mobile" && "text-sm py-2 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
      )}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {label}
    </button>
  );
};

const SPRING = { type: "spring" as const, stiffness: 400, damping: 30 };
const SPRING_SMOOTH = { type: "spring" as const, stiffness: 300, damping: 35 };

const BLUR_EASE = [0.25, 0.1, 0.25, 1] as const;

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const BackdropBlur = ({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) => {
  const blur = useMotionValue(0);
  const opacity = useMotionValue(0);
  const blurStyle = useTransform(blur, (v) => `blur(${v}px)`);

  useEffect(() => {
    const duration = 0.45;
    const blurCtrl = animate(blur, isOpen ? 4 : 0, { duration, ease: BLUR_EASE });
    const opacityCtrl = animate(opacity, isOpen ? 1 : 0, { duration, ease: BLUR_EASE });
    return () => {
      blurCtrl.stop();
      opacityCtrl.stop();
    };
  }, [isOpen, blur, opacity]);

  return (
    <motion.div
      className="absolute inset-0 cursor-pointer"
      style={{
        backgroundColor: "hsl(var(--background) / 0.2)",
        backdropFilter: blurStyle,
        WebkitBackdropFilter: blurStyle,
        opacity,
      }}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: GRAIN_SVG }}
      />
    </motion.div>
  );
};

export const Navigation = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const touchStartY = useRef(0);
  const scrollThreshold = 60;

  const handleBackdropClick = () => setIsMobileMenuOpen(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 60) setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 50);
      const isMobileView = window.innerWidth < 1024;

      if (isMobileView && y > scrollThreshold) {
        setIsHeaderVisible(y <= lastScrollY.current);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
      };
    }
    return undefined;
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-[10000] lg:glass bg-transparent",
          isScrolled ? "py-3 sm:py-4" : "py-4 sm:py-6"
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: isHeaderVisible ? 0 : -120,
          opacity: 1,
        }}
        transition={SPRING_SMOOTH}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 pr-[max(1rem,env(safe-area-inset-right,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))] lg:pr-12">
          <nav className="flex items-center justify-between lg:justify-center relative w-full">
            {/* Spacer for mobile - pushes hamburger to the right */}
            <div className="flex-1 min-w-0 lg:flex-none lg:hidden" aria-hidden />

            {/* Desktop Navigation - Centered */}
            <ul className="hidden lg:flex items-center gap-6 md:gap-8 xl:gap-12">
              {navKeys.map((link, index) => (
                <motion.li
                  key={link.key}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <a
                    href={link.href}
                    className="group relative py-2 text-xs xl:text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-500"
                  >
                    <AnimatedText>{t(`nav.${link.key}`)}</AnimatedText>
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-500" />
                  </a>
                </motion.li>
              ))}
            </ul>

            {/* Desktop Language Switcher - Top Right */}
            <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2">
              <LanguageSwitcher />
            </div>

            {/* Mobile: Hamburger - in flow for reliable placement across screen sizes */}
            <div className="flex lg:hidden items-center justify-end shrink-0 min-w-[44px] min-h-[44px] -mr-1">
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -m-2 text-foreground hover:text-primary transition-colors duration-300 touch-manipulation"
                aria-label="Toggle menu"
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu - Always mounted, blur animates in/out gradually */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-[9999] lg:hidden overscroll-contain",
              !isMobileMenuOpen && "pointer-events-none"
            )}
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              minHeight: "100dvh",
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-hidden={!isMobileMenuOpen}
          >
            <BackdropBlur onClick={handleBackdropClick} isOpen={isMobileMenuOpen} />

            {/* Nav content - unified fade, no waterfall */}
            <AnimatePresence mode="wait">
              {isMobileMenuOpen && (
                <motion.nav
                  key="nav"
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                >
                  <div className="flex flex-col items-center justify-center gap-5 sm:gap-6 md:gap-8 pointer-events-auto">
                    {navKeys.map((link) => (
                      <a
                        key={link.key}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-center text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl font-serif text-white hover:text-primary transition-colors duration-300 tracking-wide py-2 min-h-[44px] flex items-center justify-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                      >
                        {t(`nav.${link.key}`)}
                      </a>
                    ))}
                  </div>
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto">
                    <LanguageSwitcher variant="mobile" />
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </>
  );
};
