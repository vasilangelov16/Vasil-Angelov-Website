import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-singer.png";
import { AnimatedText } from "@/components/AnimatedText";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** lg — parallax and center-weighted crop only when viewport is wide enough */
const LG_MEDIA = "(min-width: 1024px)";

export const HeroSection = () => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWideViewport, setIsWideViewport] = useState(
    () => typeof window !== "undefined" && window.matchMedia(LG_MEDIA).matches,
  );

  const parallaxEnabled = isWideViewport && !prefersReducedMotion;

  useEffect(() => {
    setIsLoaded(true);
    const mq = window.matchMedia(LG_MEDIA);
    const syncWide = () => setIsWideViewport(mq.matches);
    syncWide();
    mq.addEventListener("change", syncWide);

    const handleMouseMove = (e: MouseEvent) => {
      if (!window.matchMedia(LG_MEDIA).matches) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      mq.removeEventListener("change", syncWide);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 z-0 will-change-transform"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          transform: parallaxEnabled
            ? `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px) scale(1.1)`
            : "translate(0, 0) scale(1.06)",
        }}
      >
        {/*
          Subject is on the left in-frame; empty space is on the right. Higher horizontal % shifts the
          crop so the person sits further left on screen and viewport center lands on the dark void —
          centered headline/subtitle/CTA no longer sit over the body. Values step by breakpoint.
        */}
        <img
          src={heroImage}
          alt="Vasil Angelov"
          className="h-full w-full object-cover object-[32%_26%] min-[400px]:object-[34%_25%] sm:object-[36%_24%] md:object-[40%_23%] lg:object-[46%_22%] xl:object-[50%_20%] 2xl:object-[52%_18%]"
          sizes="100vw"
          decoding="async"
          fetchPriority="high"
        />
        {/* Mobile / tablet: keep left third clear for the portrait; grade toward center for type */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background: [
              "linear-gradient(90deg, hsla(220, 15%, 5%, 0.12) 0%, hsla(220, 15%, 5%, 0.08) 26%, hsla(220, 15%, 5%, 0.28) 52%, hsla(220, 15%, 5%, 0.55) 100%)",
              "linear-gradient(180deg, hsla(220, 15%, 5%, 0.65) 0%, hsla(220, 15%, 5%, 0.06) 30%, hsla(220, 15%, 5%, 0.05) 48%, hsla(220, 15%, 5%, 0.28) 72%, hsla(220, 15%, 5%, 0.82) 100%)",
            ].join(","),
          }}
        />
        {/* Desktop: vertical grade; horizontal handled by image anchor + vignette */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(180deg, hsla(220, 15%, 5%, 0.75) 0%, hsla(220, 15%, 5%, 0.1) 20%, hsla(220, 15%, 5%, 0.05) 40%, hsla(220, 15%, 5%, 0.3) 60%, hsla(220, 15%, 5%, 0.85) 80%, hsla(220, 15%, 5%, 1) 100%)",
          }}
        />
        {/* Vignette: gentle on small screens so the subject stays visible */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "radial-gradient(ellipse 125% 88% at 18% 34%, transparent 0%, hsla(220, 15%, 5%, 0.28) 58%, hsla(220, 15%, 5%, 0.62) 100%)",
          }}
        />
        {/* Desktop vignette biased toward the void (right of subject), not viewport center */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "radial-gradient(ellipse 92% 72% at 58% 30%, transparent 0%, hsla(220, 15%, 5%, 0.55) 100%)",
          }}
        />
      </motion.div>

      {/* Legibility only where type sits — ellipse biased right so the left portrait stays clear */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] lg:hidden"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 62vw 70% at 58% 46%, hsla(220, 15%, 5%, 0.34) 0%, hsla(220, 15%, 5%, 0.1) 48%, transparent 68%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse min(48rem, 72vw) 76% at 54% 44%, hsla(220, 15%, 5%, 0.22) 0%, hsla(220, 15%, 5%, 0.06) 52%, transparent 70%)",
        }}
      />

      {/* Floating Particles */}
      {isLoaded &&
        [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute z-[2] h-1 w-1 rounded-full bg-primary/40"
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

      {/* Content — vertically & horizontally centered in viewport; top padding clears fixed nav */}
      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-20 text-center sm:px-6 sm:pb-6 sm:pt-24 md:pt-28 lg:px-8 lg:pt-32 xl:pt-36">
        <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-5 sm:gap-6 md:gap-7 lg:gap-8">
          {/* Main Title Group */}
          <div className="flex flex-col items-center justify-center gap-0 sm:gap-1">
            {/* VASIL */}
            <div className="overflow-hidden">
              <motion.h1
                className="font-serif text-[16vw] sm:text-[14vw] md:text-[11vw] lg:text-[9vw] xl:text-[8vw] 2xl:text-[7.5vw] leading-[0.85] font-bold tracking-tighter text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.55)]"
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
                className="font-serif text-[16vw] sm:text-[14vw] md:text-[11vw] lg:text-[9vw] xl:text-[8vw] 2xl:text-[7.5vw] leading-[0.85] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/60 drop-shadow-[0_2px_20px_rgba(0,0,0,0.45)]"
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
            className="h-px w-20 bg-gradient-to-r from-transparent via-primary to-transparent sm:w-24 md:w-28 lg:w-32"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />

          {/* Description Tagline */}
          <motion.p
            className="mx-auto max-w-xs px-2 text-base font-light leading-relaxed tracking-wide text-white/90 sm:max-w-md sm:px-0 sm:text-lg md:max-w-lg md:text-xl lg:max-w-xl lg:text-xl xl:max-w-2xl xl:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <AnimatedText as="span" className="italic font-serif font-bold text-primary text-xl sm:text-2xl md:text-3xl pr-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {t("hero.taglineBeyond")}
            </AnimatedText>
            <AnimatedText>{t("hero.taglineRest")}</AnimatedText> <br className="hidden sm:block" />
            <AnimatedText>{t("hero.taglineVoice")}</AnimatedText>
          </motion.p>

          {/* Premium CTA Button - Single Explore */}
          <motion.div
            className="flex w-full items-center justify-center sm:w-auto"
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
              <AnimatedText as="span" className="relative z-10 font-semibold">{t("hero.explore")}</AnimatedText>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};