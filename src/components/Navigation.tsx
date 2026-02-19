import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import heroImage from "@/assets/hero-singer.jpg";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Biography", href: "#biography" },
  { name: "Aura", href: "#aura" },
  { name: "Music", href: "#music" },
  { name: "Band", href: "#band" },
  { name: "Live Gigs", href: "#live-gigs" },
  { name: "Contact", href: "#contact" },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 lg:glass bg-transparent ${isScrolled ? "py-3 sm:py-4" : "py-4 sm:py-6"
          }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <nav className="flex items-center justify-center lg:justify-center">
            {/* Desktop Navigation - Centered */}
            <ul className="hidden lg:flex items-center gap-8 xl:gap-12">
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <a
                    href={link.href}
                    className="group relative py-2 text-xs xl:text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-500"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-500" />
                  </a>
                </motion.li>
              ))}
            </ul>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden absolute right-4 sm:right-6 p-2 text-foreground hover:text-primary transition-colors duration-300"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu with Hero Background */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Image Background */}
            <div className="absolute inset-0">
              <img
                src={heroImage}
                alt="Background"
                className="w-full h-full object-cover scale-110"
              />
              {/* Grey Overlay */}
              <div className="absolute inset-0 bg-background/85" />
            </div>

            <nav className="relative h-full flex flex-col items-center justify-center gap-8 sm:gap-10">
              {navLinks.map((link, index) => (
                <div key={link.name} className="overflow-hidden">
                  <motion.a
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-4xl sm:text-5xl font-serif text-white hover:text-primary transition-colors duration-500 tracking-wide"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ scale: 1.05, x: 10 }}
                  >
                    <span className="italic opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-2xl mr-4 font-light text-primary/50">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    {link.name}
                  </motion.a>
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
