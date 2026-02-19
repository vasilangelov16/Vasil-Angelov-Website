import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import biographyImage from "@/assets/biography-singer.jpg";

export const BiographySection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={containerRef} id="biography" className="relative py-24 sm:py-32 lg:py-56 overflow-hidden bg-background">

      {/* 3. Subtle Background Typography - Carousel Watermark */}
      <div className="absolute top-1/2 left-0 w-full pointer-events-none select-none z-0 overflow-hidden flex items-center -translate-y-1/2">
        <motion.div
          style={{ y: textY, opacity: 0.05 }}
          className="flex gap-20 whitespace-nowrap"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(4)].map((_, i) => (
            <h2 key={i} className="text-[15vw] font-bold tracking-tighter text-foreground font-serif leading-none">
              VASIL ANGELOV
            </h2>
          ))}
        </motion.div>
      </div>

      <div className="md:hidden relative z-10 container mx-auto px-6">
        <div className="flex flex-col gap-12">
          {/* 1. Header Section */}
          <div className="text-center space-y-4 pt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-primary font-serif italic text-2xl tracking-wider">The Voice</span>
              <h2 className="text-5xl font-serif text-white leading-none mt-2">
                Behind the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Movement</span>
              </h2>
            </motion.div>
            <div className="w-[1px] h-16 bg-gradient-to-b from-primary to-transparent mx-auto opacity-50" />
          </div>

          {/* 2. Image Section - Portrait Card */}
          <div className="relative mx-2">
            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-20 transform translate-y-4" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[3/4] overflow-hidden rounded-sm border border-white/10 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent opacity-90 z-10" />
              <img src={biographyImage} alt="Vasil" className="w-full h-full object-cover grayscale contrast-125" />

              {/* Integrated Quote on Image */}
              <div className="absolute bottom-8 left-6 right-6 z-20">
                <p className="font-serif italic text-2xl text-white leading-relaxed">
                  "Music is the <span className="text-primary">language of the soul</span>."
                </p>
              </div>
            </motion.div>
            {/* Decorative Element */}
            <div className="absolute -top-3 -right-3 w-20 h-20 border-t border-r border-primary/40 rounded-tr-3xl" />
            <div className="absolute -bottom-3 -left-3 w-20 h-20 border-b border-l border-primary/40 rounded-bl-3xl" />
          </div>

          {/* 3. Text Content - Refined & Artistic */}
          <div className="relative px-2">
            <div className="border-l-2 border-primary/30 pl-6 py-2 space-y-6">
              <p className="text-xl text-white font-serif italic leading-relaxed">
                "Vasil Angelov doesn't just perform; he <span className="text-primary">channels emotion</span>."
              </p>
              <p className="text-base text-muted-foreground font-light leading-relaxed">
                Born with a voice that carries both fire and tenderness, he transforms every stage into a sanctuary of sound.
              </p>
              <p className="text-base text-muted-foreground font-light leading-relaxed">
                From intimate acoustic sets to grand orchestral celebrations, his artistry is defined by one thing: <span className="text-white italic">connection</span>.
              </p>
              <p className="text-base text-muted-foreground font-light leading-relaxed">
                Not about perfection, but absolute presence.
              </p>
            </div>
          </div>

          {/* Signature */}
          <div className="pt-12 flex justify-center opacity-90 pb-10">
            <div className="text-center">
              <span className="font-script text-5xl text-white block transform -rotate-2">Vasil Angelov</span>
              <div className="h-[1px] w-12 bg-primary mx-auto mt-3" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 mt-3 block">Est. 2018</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block relative z-10 container mx-auto px-6 md:px-12 lg:px-20">

        {/* 4. Stronger Headline & 5. Accent Line */}
        <div className="flex flex-col items-start mb-20 lg:mb-32 relative">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100px" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-[2px] bg-primary mb-8" // Red accent line
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[0.9]"
          >
            The Voice <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 italic font-light mt-2 sm:mt-0">Behind the Movement</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

          {/* 6. Layering and Depth - Image Section */}
          <div className="lg:col-span-5 relative lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative z-20"
            >
              {/* Main Image */}
              <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-2xl relative">
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10 pointer-events-none" />
                <motion.img
                  style={{ scale: useTransform(scrollYProgress, [0, 1], [1, 1.1]) }}
                  src={biographyImage}
                  alt="Vasil Angelov"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>

              {/* 7. Slight Asymmetry - Offset Border */}
              <div className="absolute top-8 -right-8 w-full h-full border-[1px] border-white/20 z-0 hidden md:block rounded-sm" />

              {/* Floating Element for Depth */}
              <div className="absolute -bottom-10 -left-6 z-30 bg-card/90 backdrop-blur-md p-6 border-l-2 border-primary shadow-xl max-w-[200px] hidden md:block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">Est. 2018</span>
                <span className="font-serif italic text-lg text-white">"Soulful Resonance"</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-7 flex flex-col justify-center pt-10 lg:pt-0">

            {/* 2. Large Bold Quote - Dominates Layout */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16 relative"
            >
              <span className="absolute -top-12 -left-4 text-9xl text-primary/10 font-serif z-0">“</span>
              <p className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif leading-[1.2] sm:leading-[1.1] text-white/90 relative z-10">
                Music is the <span className="text-primary italic">language of the soul</span> — I simply translate.
              </p>
            </motion.div>

            {/* 1. Rich Narrative Content - Designed for richer story */}
            <div className="relative">
              {/* Vertical decorative line for structure */}
              <div className="absolute left-0 top-2 bottom-2 w-[1px] bg-gradient-to-b from-white/20 to-transparent hidden md:block" />

              <div className="md:pl-10 space-y-8 text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
                <p>
                  <strong className="text-white font-serif text-2xl tracking-wide">Vasil Angelov</strong> doesn't just perform; he channels emotion. Born with a voice that carries both fire and tenderness, he transforms every stage into a sanctuary of sound. His journey began not in the spotlight, but in the quiet moments of discovery, where he found that a melody could speak louder than words ever could.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <p>
                    From intimate acoustic sets in smoke-filled jazz clubs to grand orchestral celebrations under stadium lights, his artistry is defined by one thing: connection. It is not about perfection, but about absolute presence.
                  </p>
                  <p>
                    He crafts moments that linger, weaving stories of love, loss, and resilience. His philosophy is simple: Each note must be delivered with conviction, creating an atmosphere where the audience doesn't just listen — they <span className="text-white italic">feel</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* 8. Expressive Typography - Signature */}
            <div className="mt-20 flex justify-end">
              <div className="text-right">
                <span className="block font-serif italic text-4xl text-white/40 hover:text-white/80 transition-colors cursor-default">Vasil Angelov</span>
                <span className="block text-xs tracking-[0.5em] text-primary uppercase mt-2">The Artist</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section >
  );
};
