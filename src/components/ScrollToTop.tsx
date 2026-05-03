import React, { memo, useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

function ScrollToTopComponent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full bg-white/90 dark:bg-zinc-900/90 text-farm-olive dark:text-farm-cream border border-farm-olive/10 dark:border-white/10 shadow-lg backdrop-blur-md hover:-translate-y-1 transition-transform"
          aria-label="Sayfanın başına dön"
        >
          <ChevronUp size={20} className="mx-auto" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

const ScrollToTop = memo(ScrollToTopComponent);

export default ScrollToTop;
