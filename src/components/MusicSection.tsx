import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Play, Music } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatedText } from "@/components/AnimatedText";

import songThumb1 from "@/assets/song-thumb-1.jpg";
import songThumb2 from "@/assets/song-thumb-2.jpg";
import songThumb3 from "@/assets/song-thumb-3.jpg";
import songThumb4 from "@/assets/song-thumb-4.jpg";
import songThumb5 from "@/assets/song-thumb-5.jpg";
import songThumb6 from "@/assets/song-thumb-6.jpg";

const songs = [
  {
    title: "Bez Izvini",
    subtitleKey: "single" as const,
    year: "2024",
    thumbnail: songThumb1,
    youtubeUrl: "https://youtu.be/gV6YWTQl4NU?si=yOg-CfUgNVWXKUlm",
    featured: true,
  },
  {
    title: "Posle 2",
    subtitleKey: "single" as const,
    year: "2024",
    thumbnail: songThumb4,
    youtubeUrl: "https://youtu.be/n2nyTo8C3JQ?si=nIiGI2lXSjYJGa9o",
  },
  {
    title: "3 vo 1",
    subtitleKey: "single" as const,
    year: "2023",
    thumbnail: songThumb2,
    youtubeUrl: "https://youtu.be/6CJE5tu1PC8?si=abNDeNHTABTYlQ5n",
  },
  {
    title: "Nocturno",
    subtitleKey: "liveSession" as const,
    year: "2021",
    thumbnail: songThumb3,
    youtubeUrl: "https://youtu.be/oD5A9bR0MLc?si=tTDNCAGh4VpI2u2X",
  },
  {
    title: "I Have Nothing",
    subtitleKey: "cover" as const,
    year: "2023",
    thumbnail: songThumb5,
    youtubeUrl: "https://youtu.be/HAdLt8QA8jY?si=3dXqJ_gF8vbi63qY",
  },
  {
    title: "Ruski rulet",
    subtitleKey: "tribute" as const,
    year: "2022",
    thumbnail: songThumb6,
    youtubeUrl: "https://youtu.be/lsyziaqLT8w?si=KE0QI0xT5UkyvrMn",
  },
];

// Helper to define type
const getSongs = () => songs;

const SongCard = ({ song, index, isInView, subtitleKey, year }: { song: ReturnType<typeof getSongs>[0]; index: number; isInView: boolean; subtitleKey: string; year: string }) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const isFeatured = song.featured;

  return (
    <motion.a
      href={song.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block relative overflow-hidden rounded-sm cursor-pointer shadow-lg shrink-0 snap-center w-[85vw] sm:w-[350px] md:w-auto ${isFeatured ? "aspect-video md:col-span-2 md:row-span-2 md:aspect-[16/9]" : "aspect-video"}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <motion.img
        src={song.thumbnail}
        alt={song.title}
        className="absolute inset-0 w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
      <div className="absolute inset-0 border border-white/5 group-hover:border-primary/30 transition-colors duration-500 z-20 pointer-events-none rounded-sm" />


      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 flex flex-col justify-end z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <h3 className={`font-serif text-white mb-1 leading-tight tracking-wide group-hover:text-primary transition-colors duration-300 ${isFeatured ? "text-2xl sm:text-3xl md:text-4xl" : "text-lg sm:text-xl"}`}>
          {song.title}
        </h3>
        <p className="text-[10px] sm:text-xs tracking-[0.1em] uppercase text-white/70 font-medium group-hover:text-white transition-colors">
          <AnimatedText>{t(`music.${subtitleKey}`)} · {year}</AnimatedText>
        </p>
      </div>

      {/* Play Icon - Centered */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
        <div className={`rounded-full bg-primary/90 flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-500 ${isFeatured ? "w-16 h-16 sm:w-20 sm:h-20" : "w-12 h-12"}`}>
          <Play size={isFeatured ? 28 : 20} className="text-white ml-1" fill="currentColor" />
        </div>
      </div>
    </motion.a>
  );
};

export const MusicSection = () => {
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
      id="music"
      ref={sectionRef}
      className="relative py-24 sm:py-32 lg:py-40 overflow-hidden bg-background"
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, hsl(230, 20%, 4%) 0%, hsl(350, 25%, 6%) 40%, hsl(350, 20%, 5%) 80%, hsl(230, 20%, 4%) 100%)",
        }}
      />

      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Animated Gradient Orbs & Lighting */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none opacity-20"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(circle, hsl(260, 40%, 30%) 0%, transparent 70%)" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none opacity-15"
        animate={{ scale: [1, 1.1, 1], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ background: "radial-gradient(circle, hsl(320, 30%, 30%) 0%, transparent 70%)" }}
      />

      {/* Aesthetic Lighting Beam */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-30 pointer-events-none blur-3xl"
        style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" }}
      />

      {/* Scrolling Background Text */}
      <div className="absolute top-1/2 left-0 w-full pointer-events-none select-none z-0 overflow-hidden flex items-center -translate-y-1/2">
        <motion.div
          style={{ y: textY, opacity: 0.05 }}
          className="flex gap-12 sm:gap-20 whitespace-nowrap"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(4)].map((_, i) => (
            <h2 key={i} className="text-[15vw] font-bold tracking-tighter text-foreground font-serif leading-none">
              DISCOGRAPHY   LATEST RELEASES
            </h2>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">

        {/* Section Header - Enhanced Layout */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-end mb-16 sm:mb-24">
          <div>
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
              <AnimatedText>{t("music.theSound")}</AnimatedText>
            </motion.span>
            <motion.h2
              className="text-4xl sm:text-6xl md:text-7xl font-serif text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <AnimatedText>{t("music.discography")}</AnimatedText>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="md:pl-10 lg:pl-20 border-l border-white/10 pl-4 md:pl-0"
          >
            <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed mb-6">
              <AnimatedText>{t("music.intro")}</AnimatedText>
            </p>
            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors text-sm uppercase tracking-widest font-medium p-2 -ml-2 sm:ml-0 hidden sm:inline-flex"
            >
              <Music size={16} />
              <AnimatedText>{t("music.listenSpotify")}</AnimatedText>
            </a>
            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex sm:hidden items-center gap-2 justify-center w-full bg-white/5 border border-white/10 py-3 mt-2 rounded-sm text-primary hover:text-white transition-colors text-xs uppercase tracking-widest font-medium"
            >
              <Music size={14} />
              <AnimatedText>{t("music.listenSpotify")}</AnimatedText>
            </a>
          </motion.div>
        </div>

        {/* Song Grid - Asymmetrical Layout */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-8 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
          {songs.map((song, index) => (
            <SongCard
              key={song.title}
              song={song}
              index={index}
              isInView={isInView}
              subtitleKey={song.subtitleKey}
              year={song.year}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16 sm:mt-24 border-t border-white/5 pt-12 sm:pt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <a
            href="https://www.youtube.com/@VasilAngelovv/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 sm:px-10 py-4 border border-white/10 text-foreground tracking-[0.2em] uppercase text-xs sm:text-sm hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 font-medium rounded-sm w-full sm:w-auto justify-center"
          >
            <Play size={14} className="group-hover:text-primary transition-colors duration-300" />
            <AnimatedText as="span">{t("music.viewAllYouTube")}</AnimatedText>
          </a>
        </motion.div>
      </div>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
