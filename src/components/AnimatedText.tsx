import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const textVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const motionTags = {
  span: motion.span,
  p: motion.p,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
} as const;

type MotionTag = keyof typeof motionTags;

interface AnimatedTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: MotionTag;
}

export const AnimatedText = ({ children, as: Tag = "span", ...props }: AnimatedTextProps) => {
  const { i18n } = useTranslation();
  const Component = motionTags[Tag] ?? motion.span;

  return (
    <Component
      key={i18n.language}
      variants={textVariants}
      initial="initial"
      animate="animate"
      {...props}
    >
      {children}
    </Component>
  );
};
