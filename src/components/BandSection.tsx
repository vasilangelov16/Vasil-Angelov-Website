import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Play } from "lucide-react";

import guitaristImg from "@/assets/band-guitarist.jpg";
import keyboardistImg from "@/assets/band-keyboardist.jpg";
import drummerImg from "@/assets/band-drummer.jpg";
import gigVenue from "@/assets/gig-venue.jpg";
import gigPerformance from "@/assets/gig-performance.jpg";

const members = [
  {
    name: "Ivan Mitkovski",
    role: "Guitarist",
    image: guitaristImg,
    quote: "Strings that weep and roar in the same breath.",
  },
  {
    name: "Leon Mitev",
    role: "Keyboardist",
    image: keyboardistImg,
    quote: "Atmospheres woven from starlight and silence.",
  },
  {
    name: "Emil Milev",
    role: "Drums & Percussion",
    image: drummerImg,
    quote: "The heartbeat that drives the darkness forward.",
  },
];

const MemberCard = ({ member, index, isInView }: { member: typeof members[0]; index: number; isInView: boolean }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.3 + index * 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-xl">
        <motion.img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />

        {/* Border overlay */}
        <div className="absolute inset-0 border border-primary/10 group-hover:border-primary/30 transition-colors duration-500 rounded-sm" />
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="overflow-hidden">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
          >
            <span className="block text-[10px] tracking-[0.2em] uppercase text-primary mb-1 font-medium">
              {member.role}
            </span>
            <h3 className="text-2xl font-serif text-white tracking-wide mb-2">
              {member.name}
            </h3>
            {/* Added subtle quote for depth */}
            <p className="text-xs text-muted-foreground italic font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 border-l border-primary/50 pl-2">
              "{member.quote}"
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export const BandSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      id="band"
      ref={sectionRef}
      className="relative py-24 sm:py-32 lg:py-40 overflow-hidden"
    >
      {/* Background Shades */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, hsl(220, 15%, 5%) 0%, hsl(345, 20%, 8%) 30%, hsl(350, 18%, 7%) 70%, hsl(220, 15%, 5%) 100%)",
        }}
      />
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none select-none z-0 overflow-hidden flex justify-center items-center">
        <motion.h2
          style={{ y: textY, opacity: 0.05 }}
          className="text-[20vw] font-bold tracking-tighter text-foreground whitespace-nowrap font-serif leading-none"
        >
          ENSEMBLE
        </motion.h2>
      </div>

      {/* Decorative rose-gold orb */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-8 blur-[150px] pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(circle, hsl(15, 30%, 50%) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">

        {/* Section Header - Enhanced with Intro Text */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-end mb-16 lg:mb-32">
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
              The Ensemble
            </motion.span>
            <motion.h2
              className="text-4xl sm:text-6xl md:text-7xl font-serif text-white leading-[1.0] sm:leading-[0.95]"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Architects of <br /> <span className="text-white/40 italic">Sound.</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="md:pl-10 lg:pl-20 border-l border-white/10 pl-4 md:pl-0"
          >
            <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed">
              More than a backing band, this is a collective of virtuosos. Each member brings a distinct texture to the sonic landscape, weaving intricate harmonies and driving rhythms that elevate every performance into an immersive experience.
            </p>
          </motion.div>
        </div>

        {/* Members Grid - Wider Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 sm:gap-8 lg:gap-16">
          {members.map((member, index) => (
            <MemberCard key={member.name} member={member} index={index} isInView={isInView} />
          ))}
        </div>

        {/* Video Area */}
        <motion.div
          className="mt-20 sm:mt-32 border-t border-white/5 pt-16 sm:pt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex flex-col items-center mb-12 sm:mb-16">
            <span className="h-[1px] w-12 bg-white/10 mb-4" />
            <p className="text-center text-xs sm:text-sm tracking-[0.3em] uppercase text-white/50 font-medium">
              Live Sessions
            </p>
          </div>

          {/* Video Placeholder Grid - Wider max-width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Video Placeholder 1 */}
            <motion.div
              className="relative aspect-video rounded-sm overflow-hidden group cursor-pointer shadow-2xl"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={gigPerformance}
                alt="Live at Sofia Sessions"
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 border border-white/5 group-hover:border-primary/20 transition-colors duration-500 pointer-events-none z-20" />

              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm group-hover:scale-110 group-hover:bg-primary/80 group-hover:border-primary transition-all duration-300">
                  <Play size={20} className="text-white ml-1 sm:w-6 sm:h-6" fill="currentColor" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10">
                <span className="text-[10px] tracking-[0.2em] uppercase text-primary block mb-1">Session 01</span>
                <p className="text-xs sm:text-sm tracking-widest uppercase text-white font-medium">
                  Live at Sofia Sessions
                </p>
              </div>
            </motion.div>

            {/* Video Placeholder 2 */}
            <motion.div
              className="relative aspect-video rounded-sm overflow-hidden group cursor-pointer shadow-2xl"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={gigVenue}
                alt="Acoustic Performance"
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 border border-white/5 group-hover:border-primary/20 transition-colors duration-500 pointer-events-none z-20" />

              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm group-hover:scale-110 group-hover:bg-primary/80 group-hover:border-primary transition-all duration-300">
                  <Play size={20} className="text-white ml-1 sm:w-6 sm:h-6" fill="currentColor" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10">
                <span className="text-[10px] tracking-[0.2em] uppercase text-primary block mb-1">Session 02</span>
                <p className="text-xs sm:text-sm tracking-widest uppercase text-white font-medium">
                  Acoustic Performance
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
