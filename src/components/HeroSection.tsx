import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import heroImage from "@/assets/hero-singer.jpg";

export const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      id="home"
      className="relative h-[100svh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        style={{
          transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px) scale(1.1)`,
        }}
      >
        <img
          src={heroImage}
          alt="Vasil Angelov"
          className="w-full h-full object-cover object-[center_20%] sm:object-[center_30%] md:object-[center_25%] lg:object-[center_18%]"
        />
        {/* Cinematic Gradient Overlay - strategically placed to keep face visible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsla(220, 15%, 5%, 0.75) 0%, hsla(220, 15%, 5%, 0.1) 20%, hsla(220, 15%, 5%, 0.05) 40%, hsla(220, 15%, 5%, 0.3) 60%, hsla(220, 15%, 5%, 0.85) 80%, hsla(220, 15%, 5%, 1) 100%)",
          }}
        />
        {/* Dramatic Vignette - keeps focus on center/upper portion */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at center 30%, transparent 0%, hsla(220, 15%, 5%, 0.7) 100%)",
          }}
        />
      </motion.div>

      {/* Floating Particles */}
      {isLoaded &&
        [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1000),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 800),
              opacity: 0,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut",
            }}
          />
        ))}

      {/* Content - Positioned at bottom to avoid covering face */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-end pb-12 sm:pb-16 md:pb-20 lg:pb-24 xl:pb-20 2xl:pb-24 h-full pt-20 sm:pt-24 md:pt-28 lg:pt-32 xl:pt-36">

        {/* Main Title Group */}
        <div className="flex flex-col items-center justify-center gap-0 sm:gap-1 mb-4 sm:mb-6 md:mb-7 lg:mb-8 xl:mb-10">
          {/* VASIL */}
          <div className="overflow-hidden">
            <motion.h1
              className="font-serif text-[16vw] sm:text-[14vw] md:text-[11vw] lg:text-[9vw] xl:text-[8vw] 2xl:text-[7.5vw] leading-[0.85] font-bold tracking-tighter text-white"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              VASIL
            </motion.h1>
          </div>

          {/* ANGELOV */}
          <div className="overflow-hidden">
            <motion.h1
              className="font-serif text-[16vw] sm:text-[14vw] md:text-[11vw] lg:text-[9vw] xl:text-[8vw] 2xl:text-[7.5vw] leading-[0.85] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/60"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1.2,
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              ANGELOV
            </motion.h1>
          </div>
        </div>

        {/* Separator / Accent */}
        <motion.div
          className="w-20 sm:w-24 md:w-28 lg:w-32 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mb-4 sm:mb-6 md:mb-7 lg:mb-8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        {/* Description Tagline */}
        <motion.p
          className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-light text-white/90 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-9 lg:mb-10 leading-relaxed tracking-wide px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <span className="italic font-serif font-bold text-primary text-xl sm:text-2xl md:text-3xl pr-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Beyond
          </span>
          the stage. <br className="hidden sm:block" />
          A voice that defines the moment.
        </motion.p>

        {/* Premium CTA Button - Single Explore */}
        <motion.div
          className="flex items-center justify-center w-full sm:w-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.a
            href="#biography"
            className="group relative flex rounded-sm items-center gap-2.5 md:gap-3 px-10 sm:px-12 md:px-14 py-4 sm:py-4.5 md:py-5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground tracking-[0.2em] uppercase text-xs sm:text-sm overflow-hidden w-full sm:w-auto max-w-xs sm:max-w-none justify-center font-medium shadow-xl hover:shadow-primary/30 min-h-[52px] transition-all duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="absolute inset-0 bg-white/15 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 skew-x-12" />
            <Compass
              size={20}
              className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45"
            />
            <span className="relative z-10 font-semibold">Explore</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};