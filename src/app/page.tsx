"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

import FlavorWordsOverlay from "@/components/FlavorWordsOverlay";

const navLinks = [{ href: "#home", label: "Home" }];

const HERO_FLAVOR_WORDS = ["Cinematic", "Precise", "Adaptive", "Human", "Scalable"];

const RATIO_SEGMENTS = [
  { d: 'M1 997L1205 997', delay: 0.05 },
  { d: 'M1205 997L1205 621', delay: 0.35 },
  { d: 'M1581 621L981 621', delay: 0.55 },
  { d: 'M981 1L981 997', delay: 0.85 },
  { d: 'M1 1L973 1', delay: 0.95 },
  { d: 'M973 1L1581 1', delay: 1.05 },
  { d: 'M1581 1L1581 621', delay: 1.2 },
  { d: 'M1581 621L1581 997', delay: 1.35 },
  { d: 'M1205 705L1111 705', delay: 1.45 },
  { d: 'M1111 621L1111 762', delay: 1.55 },
  { d: 'M1205 762L981 762', delay: 1.65 },
  { d: 'M1143 762L1143 705', delay: 1.75 },
  { d: 'M1143 732L1111 732', delay: 1.85 },
] as const;


type SliderProfile = {
  name: string;
  label: string;
  role: string;
  image: string;
  width: number;
  height: number;
};

const sliderProfiles: SliderProfile[] = [
  {
    name: "About Me",
    label: "About",
    role: "Your Visual Storyteller",
    image: "/Images/img-slider/About_Me.jpg",
    width: 2666,
    height: 2000,
  },
  {
    name: "Real Estate",
    label: "Estate",
    role: "Premium Property Tours",
    image: "/Images/img-slider/Realestate.jpg",
    width: 2000,
    height: 2000,
  },
  {
    name: "Culinary Stories",
    label: "Stories",
    role: "Stylized Food Narratives",
    image: "/Images/img-slider/Food.jpg",
    width: 2000,
    height: 2000,
  },
  {
    name: "Aerial Perspective",
    label: "Perspective",
    role: "Signature Drone Cinematics",
    image: "/Images/img-slider/Drone.png",
    width: 1024,
    height: 1024,
  },
] as const;

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/", aria: "Follow JSDetail on Instagram" },
  { label: "YouTube", href: "https://www.youtube.com/", aria: "Watch JSDetail on YouTube" },
  { label: "LinkedIn", href: "https://www.linkedin.com/", aria: "Connect with JSDetail on LinkedIn" },
];

const joinClasses = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(" ");
export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const promoSectionRef = useRef<HTMLElement | null>(null);
  const [navVisible, setNavVisible] = useState(false);
  const spiralPathRef = useRef<SVGPathElement | null>(null);
  const [spiralDrawn, setSpiralDrawn] = useState(false);
  const ratioFrameRef = useRef<SVGPathElement | null>(null);
  const [frameDrawn, setFrameDrawn] = useState(false);
  const ratioSegmentRefs = useRef<Array<SVGPathElement | null>>([]);
  const [ratioSegmentsDrawn, setRatioSegmentsDrawn] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [promoActive, setPromoActive] = useState(false);

  useEffect(() => {
    const evaluateVisibility = () => {
      const heroHeight = heroRef.current?.offsetHeight ?? 0;
      if (heroHeight === 0) {
        setNavVisible(window.scrollY > 0);
        return;
      }
      setNavVisible(window.scrollY >= heroHeight * 0.8);
    };

    const handleScroll = () => evaluateVisibility();
    const handleResize = () => evaluateVisibility();

    evaluateVisibility();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const section = promoSectionRef.current;
    if (!section || promoActive) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPromoActive(true);
        }
      },
      { threshold: 0.4, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [promoActive]);

  useEffect(() => {
    const frameEl = ratioFrameRef.current;
    if (!frameEl) {
      return;
    }

    const length = frameEl.getTotalLength();
    frameEl.style.setProperty('--ratio-frame-length', String(length));
    setFrameDrawn(false);

    const frame = requestAnimationFrame(() => {
      setFrameDrawn(true);
    });

    return () => {
      cancelAnimationFrame(frame);
      frameEl.style.removeProperty('--ratio-frame-length');
      setFrameDrawn(false);
    };
  }, []);

  useEffect(() => {
    const segments = ratioSegmentRefs.current.filter(
      (segment): segment is SVGPathElement => Boolean(segment),
    );

    if (!segments.length) {
      return;
    }

    const removeInlineDash = (segment: SVGPathElement) => {
      segment.style.removeProperty('stroke-dasharray');
      segment.style.removeProperty('stroke-dashoffset');
    };

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'stroke-dashoffset') {
        return;
      }
      const target = event.currentTarget as SVGPathElement | null;
      if (!target) {
        return;
      }
      removeInlineDash(target);
      target.removeEventListener('transitionend', handleTransitionEnd);
    };

    const primeSegments = segments.map((segment) => {
      const length = segment.getTotalLength();
      segment.style.setProperty('--ratio-segment-length', `${length}`);
      segment.style.strokeDasharray = `${length}`;
      segment.style.strokeDashoffset = `${length}`;
      segment.addEventListener('transitionend', handleTransitionEnd);
      return segment;
    });

    if (!frameDrawn) {
      setRatioSegmentsDrawn(false);
      return () => {
        primeSegments.forEach((segment) => {
          segment.removeEventListener('transitionend', handleTransitionEnd);
          segment.style.removeProperty('--ratio-segment-length');
          removeInlineDash(segment);
        });
      };
    }

    const animationFrame = requestAnimationFrame(() => {
      setRatioSegmentsDrawn(true);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      primeSegments.forEach((segment) => {
        segment.removeEventListener('transitionend', handleTransitionEnd);
        segment.style.removeProperty('--ratio-segment-length');
        removeInlineDash(segment);
      });
      setRatioSegmentsDrawn(false);
    };
  }, [frameDrawn]);

  useEffect(() => {
    const pathEl = spiralPathRef.current;
    if (!pathEl) {
      return;
    }

    const length = pathEl.getTotalLength();
    pathEl.style.setProperty('--spiral-length', String(length));
    setSpiralDrawn(false);

    const frame = requestAnimationFrame(() => {
      setSpiralDrawn(true);
    });

    return () => {
      cancelAnimationFrame(frame);
      pathEl.style.removeProperty('--spiral-length');
      setSpiralDrawn(false);
    };
  }, []);



  useEffect(() => {
    if (!frameDrawn || !ratioSegmentsDrawn || !spiralDrawn) {
      return;
    }
    const timeout = window.setTimeout(() => setOverlayActive(true), 2200);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [frameDrawn, ratioSegmentsDrawn, spiralDrawn]);

  ratioSegmentRefs.current = [];

  return (
    <>
      <header className={joinClasses(styles.header, navVisible && styles.headerVisible)}>
        <div className={styles.headerInner}>
          <Link href="#home" className={styles.logoLink}>
            <span className="sr-only">JSDetail home</span>
            <div className={styles.logoWrap}>
              <Image
                src="/Images/JS_Detail_Typography.png"
                alt="JSDetail"
                width={1920}
                height={1080}
                priority
                quality={95}
                sizes="(max-width: 640px) 140px, 220px"
                className={styles.logoImage}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </Link>
          <nav className={styles.nav} aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.page}>
        <section ref={heroRef} id="home" className={joinClasses(styles.section, styles.heroSection)}>
          <div className={styles.heroStage}>
            <div className={styles.heroFrame}>
              <Image
                src="/Images/JS_Detail_Typography.png"
                alt="JSDetail logo"
                width={1920}
                height={1080}
                priority
                quality={95}
                sizes="(max-width: 768px) 70vw, (max-width: 1280px) 48vw, 720px"
                className={styles.heroLogo}
                style={{ width: "100%", height: "100%" }}
              />
              <div className={styles.heroSpiral} aria-hidden="true">
                <svg
                  className={styles.heroSpiralSvg}
                  viewBox="0 0 1582 998"
                  role="presentation"
                >
                  <g fill="none" stroke="currentColor">
                    <path
                      ref={ratioFrameRef}
                      className={joinClasses(styles.heroRatioFrame, frameDrawn && styles.heroRatioFrameActive)}
                      d="M1 997L1 1L1581 1L1581 997L1 997"
                    />
                    {RATIO_SEGMENTS.map(({ d, delay }, index) => (
                      <path
                        key={d}
                        ref={(el) => {
                          ratioSegmentRefs.current[index] = el;
                        }}
                        className={joinClasses(
                          styles.heroRatioSegment,
                          ratioSegmentsDrawn && styles.heroRatioSegmentActive,
                        )}
                        d={d}
                        style={{ transitionDelay: `${delay}s` }}
                      />
                    ))}

                    <path
                      className={styles.heroRatioBoxes}
                      d="M1 997V1H973M1 997H1205M973 1H1581V621M1581 621V997H1205M1581 621H981M1205 997L1205 621M1111 621L1111 762M1205 705H1111M981 1V997M1205 762H981M1143 762V705M1143 732H1111"
                    />
                    <path
                      ref={spiralPathRef}
                      className={joinClasses(styles.heroRatioSpiral, spiralDrawn && styles.heroSpiralActive)}
                      d="M1 997C1 687 214.6 1 973 1C1158.33 5 1581 157 1581 621C1581 621 1581 997 1205 997C1133 997 981 950 981 765C981 726.5 1023 621 1111 621C1139.5 621 1205 638 1205 705C1205.33 724.667 1188.5 762 1143.5 762C1131.83 761.667 1111 753.9 1111 731.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </svg>
              </div>
            </div>
            <FlavorWordsOverlay
              className={styles.heroFlavorOverlay}
              words={HERO_FLAVOR_WORDS}
              active={overlayActive}
            />
          </div>
        </section>
        <section
          ref={promoSectionRef}
          className={joinClasses(styles.promoSection, promoActive && styles.promoSectionActive)}
        >
          <div className={styles.videoWrap}>
            <video
              className={styles.promoVideo}
              src="/Videos/pano_4k.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            />
            <div className={styles.overlay} />
            <div className={styles.textContent}>
              <h2>Full-Spectrum Visual Storytelling</h2>
              <p>
                Watch how we blend sweeping aerial perspective with intimate ground detail to craft narratives that
                hold attention and drive action.
              </p>
            </div>
          </div>
        </section>
        <section className={styles.sliderSection}>
          <div className={styles.sliderInner}>
            <header className={styles.sliderHeader}>
              <span className={styles.sliderEyebrow}>Portfolio Spotlight</span>
              <h2>Explore Signature Looks</h2>
              <p>
                Tap through four core story types&mdash;from personal branding to aerial flyovers&mdash;and see how JSDetail
                shapes each narrative with precision.
              </p>
            </header>
            <div className={styles.sliderTrack} role="list">
              {sliderProfiles.map((profile, index) => (
                <button
                  key={profile.name}
                  type="button"
                  role="listitem"
                  className={styles.sliderCard}
                  aria-label={`Showcase ${profile.name}, ${profile.role}`}
                >
                  <Image
                    src={profile.image}
                    alt={`${profile.name}, ${profile.role}`}
                    width={profile.width}
                    height={profile.height}
                    quality={95}
                    sizes="(max-width: 540px) 82vw, (max-width: 1024px) 42vw, 28vw"
                    className={styles.sliderImage}
                    priority={index === 0}
                    style={{ width: "100%", height: "100%" }}
                  />
                  <span aria-hidden="true" className={styles.sliderName}>{profile.label || profile.name}</span>
                  <span className={styles.sliderDetails}>
                    <strong>{profile.name}</strong>
                    <span>{profile.role}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.logoWrapSmall}>
              <Image
                src="/Images/JS_Detail_Typography.png"
                alt="JSDetail"
                width={1920}
                height={1080}
                quality={95}
                sizes="(max-width: 640px) 160px, 220px"
                className={styles.logoImage}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <p>Every angle. Every detail. One story.</p>
          </div>
          <div className={styles.footerNav}>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div className={styles.footerSocial}>
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.aria}
              >
                {social.label}
              </a>
            ))}
          </div>
          <a className={styles.backToTop} href="#home">
            Back to Top
          </a>
        </div>
        <p className={styles.copyline}>&copy; {new Date().getFullYear()} JSDetail. All rights reserved.</p>
      </footer>
    </>
  );
}
















