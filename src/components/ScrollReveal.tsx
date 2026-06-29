import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'section' | 'div';
}

export default function ScrollReveal({ children, delay = 0, className = '', as: Tag = 'div' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    import('gsap').then(({ default: gsap }) => {
      if (cancelled) return;

      const el = ref.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const tl = gsap.timeline();
            tl.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              delay: delay / 1000,
              ease: 'power3.out',
            });
            observer.unobserve(el);
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      observer.observe(el);
    });

    return () => { cancelled = true; };
  }, [delay]);

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0, transform: 'translateY(40px)' }}>
      {children}
    </Tag>
  );
}
