
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Play } from "lucide-react";
import auraHero from "@/assets/aura-hero.jpg";
import auraMoment from "@/assets/aura-moment.jpg";
import auraAccent from "@/assets/aura-moment-2.jpg";

export const AuraSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 5]);

  return (
    <section
      id="aura"
      ref={sectionRef}
      className="relative py-20 sm:py-32 lg:py-56 overflow-hidden min-h-screen flex items-center"
    >
      {/* Background Shades */}
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

      {/* Decorative rose-gold orb - More Prominent & Interactive */}
      <motion.div
        className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(circle, hsl(15, 50%, 45%) 0%, transparent 70%)" }}
      />

      {/* Secondary Orb - Bottom Left for Balance */}
      <motion.div
        className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15], x: [0, 30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ background: "radial-gradient(circle, hsl(340, 40%, 35%) 0%, transparent 70%)" }}
      />

      {/* Subtle Rotating Ring - Mysticism */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] sm:w-[800px] sm:h-[800px] rounded-full border border-primary/10 pointer-events-none opacity-50"
        style={{ rotateX: 60, rotateY: 10 }}
        animate={{ rotateZ: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20">

        {/* Asymmetrical Layout - Breaking the Grid */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

          {/* Left Col: Narrative & Title */}
          <div className="lg:col-span-7 flex flex-col items-start relative z-20 pt-10 sm:pt-0">
            {/* Floating "AURA" Title - behind text on mobile, consistent size */}
            <h2 className="absolute -top-12 -left-4 sm:-top-20 sm:-left-10 text-[25vw] md:text-[18rem] font-serif font-bold text-white/25 pointer-events-none select-none leading-none z-0">
              AURA
            </h2>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8 sm:mb-12 relative z-10"
            >
              <span className="block text-primary tracking-[0.4em] text-xs sm:text-sm uppercase mb-3 pl-1">The Essence</span>
              <h3 className="text-4xl sm:text-5xl md:text-7xl font-serif text-white leading-[0.95] mb-6 sm:mb-8">
                Celebrating the <br />
                <span className="italic text-white/80">Feminine Spirit</span>
              </h3>
              <div className="h-[1px] w-24 sm:w-32 bg-gradient-to-r from-primary to-transparent" />
            </motion.div>

            <div className="space-y-6 sm:space-y-8 text-base sm:text-lg md:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl pl-0 sm:pl-4 border-l-0 sm:border-l border-white/10 relative z-10">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <strong className="text-white font-serif tracking-wide text-xl sm:text-2xl">Aura</strong> is a movement born from genuine respect and deep admiration. It is a celebration of the energy that drives, inspires, and transforms.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Through intimate gatherings and moments woven into every concert, Aura creates a space where elegance meets emotion. It is a promise that every woman feels seen, valued, and celebrated.
              </motion.p>

              {/* New Text Block: Poetic Conclusion */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-white/80 italic font-serif"
              >
                "It is a silent language, a dialogue of glances and gestures, where the unspoken becomes the most powerful verse of the song."
              </motion.p>
            </div>
          </div>

          {/* Right Col: Visual Layering */}
          <div className="lg:col-span-5 relative h-[500px] sm:h-[600px] lg:h-[800px] flex items-center justify-center lg:justify-end mt-8 lg:mt-0">

            {/* Main Image (Grounded & Elegant) */}
            <motion.div
              style={{ y }}
              className="absolute right-0 top-0 w-4/5 sm:w-3/4 h-3/4 sm:h-3/5 rounded-[2rem] overflow-hidden shadow-2xl z-10 border border-white/10"
            >
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10" />
              <img src={auraHero} alt="Aura Atmosphere" className="w-full h-full object-cover grayscale-[20%]" />
            </motion.div>

            {/* Foreground Element (Circular Video Portal) */}
            <motion.div
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, -60]), x: -40 }}
              className="absolute left-4 bottom-20 sm:bottom-32 w-48 h-48 sm:w-64 sm:h-64 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-20 border border-white/20 backdrop-blur-md bg-black/20 group cursor-pointer overflow-hidden"
            >
              <div className="relative w-full h-full">
                <img src={auraMoment} alt="Aura Film" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 scale-125" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />

                {/* Rotating Text Ring UI */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Rotating Ring */}
                  <div className="absolute inset-0 animate-[spin_10s_linear_infinite] group-hover:animate-[spin_5s_linear_infinite]">
                    <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                      <path id="textPath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                      <text className="fill-white/80 text-[11px] font-sans font-bold tracking-[0.2em] uppercase">
                        <textPath href="#textPath" startOffset="0%">
                          • Watch The Film • Watch The Film
                        </textPath>
                      </text>
                    </svg>
                  </div>

                  {/* Center Play Button */}
                  <div className="w-12 h-12 rounded-full bg-white backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Play size={18} className="text-black fill-black ml-1" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Third Image — Accent Behind Video */}
            <motion.div
              style={{ y: useTransform(scrollYProgress, [0, 1], [10, -30]) }}
              className="absolute left-35 sm:left-40 -bottom-16 sm:bottom-0 w-44 h-56 sm:w-56 sm:h-72 rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-[15] border border-white/15 rotate-[6deg] hover:rotate-0 transition-transform duration-700"
            >
              <img src={auraAccent} alt="Aura Moment" className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-10 -right-8 sm:-bottom-6 sm:-right-6 z-0">
              <span className="font-serif italic text-4xl sm:text-6xl text-white/10 rotate-90 origin-bottom-right block">Grace</span>
            </div>
          </div>
        </div>


        {/* Bottom Quote Mark */}
        <div className="mt-16 sm:mt-20 lg:mt-0 flex justify-center lg:justify-start">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/30 border border-white/10 px-4 sm:px-6 py-2 rounded-full backdrop-blur-md">
            Curated by Vasil Angelov
          </span>
        </div>
      </div>
    </section>
  );
};
