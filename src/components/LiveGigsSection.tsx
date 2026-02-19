import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Play, ExternalLink, FolderOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatedText } from "@/components/AnimatedText";

import gigVenue from "@/assets/gig-venue.jpg";
import gigPerformance from "@/assets/gig-performance.jpg";

const venueNames = [
  "Club Oxygen", "The Grand Hall", "Velvet Lounge", "Midnight Arena",
  "Crystal Ballroom", "Nova Stage", "Eclipse Club", "Amber Hall",
  "Private Events", "Corporate Galas", "Wedding Celebrations", "Festival Stages",
];

export const LiveGigsSection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      id="live-gigs"
      ref={sectionRef}
      className="relative py-24 sm:py-32 lg:py-40 overflow-hidden bg-background"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-background to-background" />

      {/* Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none select-none z-0 overflow-hidden flex justify-center items-center">
        <motion.h2
          style={{ y: textY, opacity: 0.05 }}
          className="text-[20vw] font-bold tracking-tighter text-foreground whitespace-nowrap font-serif leading-none"
        >
          LIVE GIGS
        </motion.h2>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 sm:mb-24 relative">
          <motion.div
            className="h-[2px] bg-primary mb-6"
            initial={{ width: 0 }}
            animate={isInView ? { width: "60px" } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.span
            className="inline-block text-xs sm:text-sm tracking-[0.4em] uppercase text-primary-foreground/60 mb-3 font-medium"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <AnimatedText>{t("liveGigs.onStage")}</AnimatedText>
          </motion.span>
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-serif text-white text-center leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <AnimatedText>{t("liveGigs.liveGigs")}</AnimatedText>
          </motion.h2>
          <motion.p
            className="text-center text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <AnimatedText>{t("liveGigs.intro")}</AnimatedText>
          </motion.p>
        </div>

      </div>

      {/* Rolling Venue Banner */}
      <motion.div
        className="mb-20 sm:mb-24 overflow-hidden border-y border-white/5 py-10 bg-black/20 w-full"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="relative w-full">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
          <motion.div
            className="flex gap-16 sm:gap-24 items-center w-max"
            animate={{ x: [0, -1000] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...venueNames, ...venueNames].map((name, i) => (
              <div key={i} className="flex items-center gap-16 sm:gap-24">
                <span className="text-xl sm:text-2xl font-serif italic text-white/40 whitespace-nowrap hover:text-primary hover:opacity-100 transition-all duration-300 cursor-default">
                  {name}
                </span>
                <span className="text-primary/20 text-xs">✦</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile Design - Refined & Desktop Aligned */}
      <div className="md:hidden relative z-10 container mx-auto px-6 py-10">


        {/* Content - Stacked 16:9 Cards (Same as Desktop aspect ratio) */}
        <div className="space-y-6 mb-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative aspect-video rounded-sm overflow-hidden group shadow-lg border border-white/5"
          >
            <img src={gigPerformance} alt="Live" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 border border-white/10 m-2 pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                <Play size={20} className="text-white ml-1" fill="currentColor" />
              </div>
            </div>

            <div className="absolute bottom-4 left-4">
              <AnimatedText as="span" className="text-[8px] tracking-[0.2em] uppercase text-primary block mb-1">{t("liveGigs.highlight")}</AnimatedText>
              <p className="text-xs tracking-widest uppercase text-white font-medium"><AnimatedText>{t("liveGigs.livePerformance")}</AnimatedText></p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative aspect-video rounded-sm overflow-hidden group shadow-lg border border-white/5"
          >
            <img src={gigVenue} alt="Venue" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 border border-white/10 m-2 pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                <Play size={20} className="text-white ml-1" fill="currentColor" />
              </div>
            </div>

            <div className="absolute bottom-4 left-4">
              <AnimatedText as="span" className="text-[8px] tracking-[0.2em] uppercase text-primary block mb-1">{t("liveGigs.backstage")}</AnimatedText>
              <p className="text-xs tracking-widest uppercase text-white font-medium"><AnimatedText>{t("liveGigs.behindScenes")}</AnimatedText></p>
            </div>
          </motion.div>
        </div>

        {/* Minimal Actions - Consistent with Desktop Buttons but stacked */}
        <div className="flex flex-col gap-4 items-center">
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-3 bg-primary/10 border border-primary/20 text-primary uppercase text-[10px] tracking-[0.2em] hover:bg-primary/20 transition-all rounded-sm w-full justify-center"
          >
            <FolderOpen size={14} />
            <AnimatedText as="span">{t("liveGigs.pressKit")}</AnimatedText>
          </a>
          <a
            href="#contact"
            className="flex items-center gap-3 px-8 py-3 border border-white/10 text-white/80 uppercase text-[10px] tracking-[0.2em] hover:bg-white/5 transition-all rounded-sm w-full justify-center"
          >
            <ExternalLink size={14} />
            <AnimatedText as="span">{t("liveGigs.bookAPerformance")}</AnimatedText>
          </a>
        </div>

      </div>

      <div className="hidden md:block relative z-10 container mx-auto px-4 sm:px-6 lg:px-12">

        {/* Video + Performance Image */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 sm:mb-24">
          {/* Video Placeholder 1 */}
          <motion.div
            className="relative aspect-video rounded-sm overflow-hidden group cursor-pointer shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <img
              src={gigPerformance}
              alt="Live performance highlight"
              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
            <div className="absolute inset-0 border border-white/5 group-hover:border-primary/20 transition-colors duration-500 pointer-events-none z-20" />


            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm group-hover:scale-110 group-hover:bg-primary/80 group-hover:border-primary transition-all duration-300">
                <Play size={24} className="text-white ml-1" fill="currentColor" />
              </div>
            </div>

            <div className="absolute bottom-6 left-6 z-10">
              <AnimatedText as="span" className="text-[10px] tracking-[0.2em] uppercase text-primary block mb-1">{t("liveGigs.highlight")}</AnimatedText>
              <p className="text-sm tracking-widest uppercase text-white font-medium">
                <AnimatedText>{t("liveGigs.livePerformance")}</AnimatedText>
              </p>
            </div>
          </motion.div>

          {/* Video Placeholder 2 */}
          <motion.div
            className="relative aspect-video rounded-sm overflow-hidden group cursor-pointer shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <img
              src={gigVenue}
              alt="Behind the scenes"
              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
            <div className="absolute inset-0 border border-white/5 group-hover:border-primary/20 transition-colors duration-500 pointer-events-none z-20" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm group-hover:scale-110 group-hover:bg-primary/80 group-hover:border-primary transition-all duration-300">
                <Play size={24} className="text-white ml-1" fill="currentColor" />
              </div>
            </div>

            <div className="absolute bottom-6 left-6 z-10">
              <AnimatedText as="span" className="text-[10px] tracking-[0.2em] uppercase text-primary block mb-1">{t("liveGigs.backstage")}</AnimatedText>
              <p className="text-sm tracking-widest uppercase text-white font-medium">
                <AnimatedText>{t("liveGigs.behindScenes")}</AnimatedText>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Links — Press Kit + Social */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 sm:px-10 py-4 bg-primary/5 border border-primary/20 text-primary-foreground tracking-[0.2em] uppercase text-xs sm:text-sm font-medium hover:bg-primary/10 transition-colors duration-300 rounded-sm"
          >
            <FolderOpen size={16} className="text-primary" />
            <AnimatedText as="span" className="text-foreground group-hover:text-white transition-colors">{t("liveGigs.pressKit")}</AnimatedText>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 border border-white/10 text-foreground tracking-[0.2em] uppercase text-xs sm:text-sm font-medium hover:bg-white/5 hover:border-white/20 transition-colors duration-300 rounded-sm"
          >
            <ExternalLink size={16} />
            <AnimatedText>{t("liveGigs.bookAPerformance")}</AnimatedText>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
