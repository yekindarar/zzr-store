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
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const el = ref.current;
        if (!el) return;

        // Initial hidden state
        gsap.set(el, { opacity: 0, y: 40 });

        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          end: 'bottom 15%',
          invalidateOnRefresh: true,
          onEnter: () => {
            // Scrolling down past top 85% → enter from below
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              delay: delay / 1000,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          },
          onLeave: () => {
            // Scrolling down past bottom 15% → hide downward
            gsap.to(el, {
              opacity: 0,
              y: 40,
              duration: 0.6,
              ease: 'power2.in',
              overwrite: 'auto',
            });
          },
          onEnterBack: () => {
            // Scrolling up past bottom 15% → enter from above
            gsap.set(el, { y: -40 });
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              delay: delay / 1000,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          },
          onLeaveBack: () => {
            // Scrolling up past top 85% → hide upward
            gsap.to(el, {
              opacity: 0,
              y: -40,
              duration: 0.6,
              ease: 'power2.in',
              overwrite: 'auto',
            });
          },
        });
      });
    });

    return () => { cancelled = true; };
  }, [delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
