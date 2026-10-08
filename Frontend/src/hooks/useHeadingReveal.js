import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useHeadingReveal(options = {}) {
    const containerRef = useRef(null);

    const {
        lineSelector = '.reveal-line',
        eyebrowSelector = '.reveal-eyebrow',
        subtitleSelector = '.reveal-subtitle',
        yPercent = 125,
        stagger = 0.14,
        duration = 1.05,
        ease = 'power4.out',
        start = 'top 85%',
        rotateX = 25,
        blur = true,
        delay = 0,
        once = true,
    } = options;

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const prefersReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            const eyebrow = el.querySelector(eyebrowSelector);
            const lines = el.querySelectorAll(lineSelector);
            const subtitle = el.querySelector(subtitleSelector);

            if (!lines.length && !eyebrow && !subtitle) return;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start,
                    once,
                    toggleActions: 'play none none none',
                },
                delay,
            });

            if (eyebrow) {
                tl.fromTo(
                    eyebrow,
                    {
                        yPercent: 120,
                        opacity: 0,
                        ...(blur ? { filter: 'blur(4px)' } : {}),
                    },
                    {
                        yPercent: 0,
                        opacity: 1,
                        ...(blur ? { filter: 'blur(0px)' } : {}),
                        duration: 0.7,
                        ease: 'power3.out',
                    }
                );
            }

            if (lines.length > 0) {
                tl.fromTo(
                    lines,
                    {
                        yPercent,
                        rotateX,
                        rotateZ: -1.2,
                        opacity: 0,
                        transformOrigin: 'right bottom -30px',
                        ...(blur ? { filter: 'blur(8px)' } : {}),
                    },
                    {
                        yPercent: 0,
                        rotateX: 0,
                        rotateZ: 0,
                        opacity: 1,
                        ...(blur ? { filter: 'blur(0px)' } : {}),
                        duration,
                        ease,
                        stagger,
                    },
                    eyebrow ? '<0.08' : 0
                );
            }

            if (subtitle) {
                tl.fromTo(
                    subtitle,
                    {
                        y: 28,
                        opacity: 0,
                        ...(blur ? { filter: 'blur(3px)' } : {}),
                    },
                    {
                        y: 0,
                        opacity: 1,
                        ...(blur ? { filter: 'blur(0px)' } : {}),
                        duration: 0.8,
                        ease: 'power3.out',
                    },
                    '<0.25'
                );
            }
        }, el);

        return () => ctx.revert();
    }, [
        lineSelector,
        eyebrowSelector,
        subtitleSelector,
        yPercent,
        stagger,
        duration,
        ease,
        start,
        rotateX,
        blur,
        delay,
        once,
    ]);

    return containerRef;
}