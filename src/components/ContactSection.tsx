import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Phone, Mail, Instagram, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatedText } from "@/components/AnimatedText";

const contactMethods = [
  {
    icon: Mail,
    label: "contact@vasilangelov.com",
    href: "mailto:contact@vasilangelov.com",
  },
  {
    icon: Phone,
    label: "+389 70 000 000",
    href: "tel:+38970000000",
  },
  {
    icon: Instagram,
    label: "@vasillangelov",
    href: "https://www.instagram.com/vasillangelov/?hl=en",
  },
  {
    icon: Youtube,
    label: "@VasilAngelovv",
    href: "https://www.youtube.com/@VasilAngelovv",
  },
];

export const ContactSection = () => {
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
      id="contact"
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
          CONNECT
        </motion.h2>
      </div>

      <div className="md:hidden relative z-10 container mx-auto px-6 py-16">

        {/* Header - Matching Desktop Vibe */}
        <div className="flex flex-col items-center mb-12 relative text-center">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "40px" }}
            className="h-[2px] bg-primary mb-6"
          />
          <AnimatedText as="span" className="text-[10px] tracking-[0.3em] uppercase text-primary mb-3 font-medium">{t("contact.bookingsEnquiries")}</AnimatedText>
          <h2 className="text-4xl font-serif text-white font-bold leading-tight mb-4">
            <AnimatedText>{t("contact.letsMakeIt")}</AnimatedText>
          </h2>
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xs mx-auto">
            <AnimatedText>{t("contact.availableDesktop")}</AnimatedText>
          </p>
        </div>

        {/* Contact Grid - 2x2 Layout to mimic desktop grid */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.label}
              href={method.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col items-center justify-center p-6 border border-white/5 bg-white/[0.02] rounded-sm hover:bg-white/[0.05] transition-all aspect-square"
            >
              <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-4 text-white/80 group-hover:text-primary group-hover:border-primary/50 transition-all">
                <method.icon size={18} />
              </div>
              <span className="text-[10px] tracking-widest uppercase text-white/60 text-center">
                <AnimatedText>{method.label.includes("@") ? t("contact.email") : method.label.startsWith("+") ? t("contact.phone") : t("contact.social")}</AnimatedText>
              </span>
            </motion.a>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-[10px] text-white/20 tracking-widest uppercase">© 2026 Vasil Angelov</p>
        </div>

      </div>

      <div className="hidden md:block relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 text-center">
        {/* Header */}
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
            <AnimatedText>{t("contact.bookingsEnquiries")}</AnimatedText>
          </motion.span>
          <motion.h2
            className="hero-text text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground font-bold tracking-tight mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <AnimatedText>{t("contact.letsMakeIt")}</AnimatedText>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg sm:text-xl font-light tracking-wide max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <AnimatedText>{t("contact.availableDesktop")}</AnimatedText>
          </motion.p>
        </div>

        {/* Contact Details - Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8 mb-24 max-w-7xl mx-auto">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.label}
              href={method.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-500">
                <method.icon size={28} className="text-white/80 group-hover:text-primary transition-colors duration-500 sm:w-8 sm:h-8" />
              </div>
              <span className="text-base sm:text-lg font-medium tracking-widest uppercase text-foreground group-hover:text-primary transition-colors duration-300">
                {method.label}
              </span>
            </motion.a>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/30 font-medium">
            © 2026 Vasil Angelov
          </p>
        </motion.div>
      </div>
    </section>
  );
};
