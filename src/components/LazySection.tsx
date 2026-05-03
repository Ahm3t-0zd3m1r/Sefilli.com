import React, { memo, useEffect, useRef, useState, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  placeholderHeight?: string;
}

const LazySectionComponent: React.FC<LazySectionProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '200px 0px',
  placeholderHeight = '200px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const currentSection = sectionRef.current;
    if (!currentSection) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(currentSection);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return (
    <div
      ref={sectionRef}
      style={{ minHeight: isVisible ? 'auto' : placeholderHeight, contentVisibility: isVisible ? 'visible' : 'auto' }}
    >
      {isVisible ? children : <div className="animate-pulse bg-gray-100 dark:bg-zinc-900 rounded-[32px] w-full h-full" />}
    </div>
  );
};

const LazySection = memo(LazySectionComponent);

export default LazySection;
