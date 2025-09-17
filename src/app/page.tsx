'use client';

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./page.module.css";

const HIGHLIGHTS = [
  {
    title: "Timeline control",
    description:
      "Chain tweens with intuitive delays to choreograph how sections appear as the page loads.",
  },
  {
    title: "Scoped selectors",
    description:
      "gsap.context keeps animations isolated to this route so you can scale without leaks.",
  },
  {
    title: "Reusable patterns",
    description:
      "Data attributes drive which elements animate, making it easy to extend the sequence.",
  },
  {
    title: "Production ready",
    description:
      "Start shipping a polished experience with sensible defaults and zero config surprises.",
  },
] as const;

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(heroRef);
      const timeline = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.8 },
      });

      timeline
        .from(q('[data-animate="headline"]'), {
          y: 40,
          opacity: 0,
          stagger: 0.12,
        })
        .from(
          q('[data-animate="card"]'),
          { y: 30, opacity: 0, stagger: 0.1 },
          "-=0.3",
        )
        .from(
          q('[data-animate="button"]'),
          { y: 20, opacity: 0, stagger: 0.08 },
          "-=0.4",
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className={styles.main}>
      <div ref={heroRef} className={styles.hero}>
        <div className={styles.copy}>
          <span data-animate="headline" className={styles.kicker}>
            Next.js + GSAP
          </span>
          <h1 data-animate="headline" className={styles.title}>
            Smooth motion for your next idea
          </h1>
          <p data-animate="headline" className={styles.lead}>
            Kickstart a modern React experience with a clean Next.js foundation and a
            production-ready GSAP setup. Extend the animation timeline to choreograph the
            rest of your UI.
          </p>
          <div className={styles.actions}>
            <a
              data-animate="button"
              className={styles.primary}
              href="https://greensock.com/docs/v3/GSAP"
              target="_blank"
              rel="noreferrer noopener"
            >
              Explore GSAP Docs
            </a>
            <a
              data-animate="button"
              className={styles.secondary}
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noreferrer noopener"
            >
              Review Next.js Guides
            </a>
          </div>
        </div>
        <div className={styles.grid}>
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.title}
              data-animate="card"
              className={styles.card}
            >
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
