"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

import FlavorWordsOverlay from "@/components/FlavorWordsOverlay";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

const HERO_FLAVOR_WORDS = ["Accurate", "Repeatable", "Defensible", "Clear", "Trusted"];

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

type SectorSlide = {
  name: string;
  label: string;
  description: string;
  deliverables: string[];
  color: string;
};

const sectorSlides: SectorSlide[] = [
  {
    name: "Real Estate & Property",
    label: "Real Estate",
    description: "Aerial orthomosaics, 3D models, and marketing-ready imagery for listings, due diligence, and site documentation.",
    deliverables: ["Orthomosaic maps", "Aerial photography", "3D site models", "Property boundary overlays"],
    color: "#1a1a14",
  },
  {
    name: "Solar & Energy",
    label: "Solar",
    description: "Thermal analysis, panel inspection, and shade studies to maximize energy yield and identify defects.",
    deliverables: ["Thermal panel inspection", "Shade analysis", "Irradiance mapping", "Defect identification"],
    color: "#1a1714",
  },
  {
    name: "Agriculture",
    label: "Agriculture",
    description: "Crop health monitoring, drainage analysis, and precision mapping for informed field management.",
    deliverables: ["NDVI vegetation indices", "Drainage mapping", "Elevation models", "Crop stress detection"],
    color: "#141a14",
  },
  {
    name: "Construction & Development",
    label: "Construction",
    description: "Progress monitoring, grading verification, and volumetric tracking from pre-build through completion.",
    deliverables: ["Progress documentation", "Volumetric calculations", "Grading verification", "As-built surveys"],
    color: "#1a1a17",
  },
  {
    name: "Roofing & Building Envelope",
    label: "Roofing",
    description: "Thermal imaging and high-resolution inspection to assess condition without setting foot on the roof.",
    deliverables: ["Thermal roof scans", "Moisture detection", "Condition reports", "Measurement extraction"],
    color: "#1a1417",
  },
  {
    name: "Infrastructure & Utilities",
    label: "Infrastructure",
    description: "Corridor mapping, tower inspection, and asset documentation for utilities and transportation networks.",
    deliverables: ["Corridor mapping", "Tower inspection", "Right-of-way surveys", "Asset inventories"],
    color: "#14171a",
  },
  {
    name: "Environmental & Conservation",
    label: "Environmental",
    description: "Habitat mapping, erosion monitoring, and ecological surveys with minimal site disturbance.",
    deliverables: ["Habitat classification", "Erosion monitoring", "Vegetation analysis", "Baseline documentation"],
    color: "#141a17",
  },
  {
    name: "Insurance & Claims",
    label: "Insurance",
    description: "Pre- and post-loss documentation, damage assessment, and defensible evidence for claims processing.",
    deliverables: ["Damage assessment", "Pre-loss baselines", "Measurement verification", "Evidence packages"],
    color: "#1a1714",
  },
  {
    name: "Municipal & Government",
    label: "Municipal",
    description: "Planning support, code enforcement documentation, and public infrastructure assessment.",
    deliverables: ["Zoning documentation", "Floodplain mapping", "Infrastructure audits", "Planning overlays"],
    color: "#17141a",
  },
];

const howItWorks = [
  { num: "01", title: "Scope", desc: "Define the problem. We assess your site and objectives." },
  { num: "02", title: "Capture", desc: "Collect the data. RTK-grade accuracy, every flight." },
  { num: "03", title: "Deliver", desc: "Receive the truth. Actionable data, defensible results." },
];

const trustPillars = [
  { title: "RTK-Grade Accuracy", desc: "±2cm horizontal precision. Ground control verified." },
  { title: "Thermal Imaging", desc: "Radiometric data capture. Delta-T analysis. Not just pretty heat maps." },
  { title: "Survey-Grade Processing", desc: "PixPro photogrammetry. QGIS analysis. Data you can stake decisions on." },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/", aria: "Follow JSDetail on Instagram" },
  { label: "YouTube", href: "https://www.youtube.com/", aria: "Watch JSDetail on YouTube" },
  { label: "LinkedIn", href: "https://www.linkedin.com/", aria: "Connect with JSDetail on LinkedIn" },
];

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

function useScrollReveal<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) setVisible(true); },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);
  return [ref, visible];
}

export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [navVisible, setNavVisible] = useState(false);
  const spiralPathRef = useRef<SVGPathElement | null>(null);
  const [spiralDrawn, setSpiralDrawn] = useState(false);
  const ratioFrameRef = useRef<SVGPathElement | null>(null);
  const [frameDrawn, setFrameDrawn] = useState(false);
  const ratioSegmentRefs = useRef<Array<SVGPathElement | null>>([]);
  const [ratioSegmentsDrawn, setRatioSegmentsDrawn] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const [philRef, philVisible] = useScrollReveal<HTMLElement>();
  const [howRef, howVisible] = useScrollReveal<HTMLElement>();
  const [trustRef, trustVisible] = useScrollReveal<HTMLElement>();
  const [aboutRef, aboutVisible] = useScrollReveal<HTMLElement>();
  const [contactRef, contactVisible] = useScrollReveal<HTMLElement>();

  // Nav scroll behavior
  useEffect(() => {
    const evaluateVisibility = () => {
      const heroHeight = heroRef.current?.offsetHeight ?? 0;
      setNavVisible(heroHeight === 0 ? window.scrollY > 0 : window.scrollY >= heroHeight * 0.8);
    };
    evaluateVisibility();
    window.addEventListener("scroll", evaluateVisibility, { passive: true });
    window.addEventListener("resize", evaluateVisibility);
    return () => {
      window.removeEventListener("scroll", evaluateVisibility);
      window.removeEventListener("resize", evaluateVisibility);
    };
  }, []);

  // Ratio frame draw
  useEffect(() => {
    const frameEl = ratioFrameRef.current;
    if (!frameEl) return;
    const length = frameEl.getTotalLength();
    frameEl.style.setProperty('--ratio-frame-length', String(length));
    setFrameDrawn(false);
    const frame = requestAnimationFrame(() => setFrameDrawn(true));
    return () => { cancelAnimationFrame(frame); frameEl.style.removeProperty('--ratio-frame-length'); setFrameDrawn(false); };
  }, []);

  // Ratio segments draw
  useEffect(() => {
    const segments = ratioSegmentRefs.current.filter((s): s is SVGPathElement => Boolean(s));
    if (!segments.length) return;
    const removeInlineDash = (s: SVGPathElement) => { s.style.removeProperty('stroke-dasharray'); s.style.removeProperty('stroke-dashoffset'); };
    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'stroke-dashoffset') return;
      const target = event.currentTarget as SVGPathElement | null;
      if (!target) return;
      removeInlineDash(target);
      target.removeEventListener('transitionend', handleTransitionEnd);
    };
    const primed = segments.map((s) => {
      const len = s.getTotalLength();
      s.style.setProperty('--ratio-segment-length', `${len}`);
      s.style.strokeDasharray = `${len}`;
      s.style.strokeDashoffset = `${len}`;
      s.addEventListener('transitionend', handleTransitionEnd);
      return s;
    });
    if (!frameDrawn) { setRatioSegmentsDrawn(false); return () => { primed.forEach((s) => { s.removeEventListener('transitionend', handleTransitionEnd); s.style.removeProperty('--ratio-segment-length'); removeInlineDash(s); }); }; }
    const af = requestAnimationFrame(() => setRatioSegmentsDrawn(true));
    return () => { cancelAnimationFrame(af); primed.forEach((s) => { s.removeEventListener('transitionend', handleTransitionEnd); s.style.removeProperty('--ratio-segment-length'); removeInlineDash(s); }); setRatioSegmentsDrawn(false); };
  }, [frameDrawn]);

  // Spiral draw
  useEffect(() => {
    const pathEl = spiralPathRef.current;
    if (!pathEl) return;
    const length = pathEl.getTotalLength();
    pathEl.style.setProperty('--spiral-length', String(length));
    setSpiralDrawn(false);
    const frame = requestAnimationFrame(() => setSpiralDrawn(true));
    return () => { cancelAnimationFrame(frame); pathEl.style.removeProperty('--spiral-length'); setSpiralDrawn(false); };
  }, []);

  // Overlay activation after animations complete
  useEffect(() => {
    if (!frameDrawn || !ratioSegmentsDrawn || !spiralDrawn) return;
    const timeout = window.setTimeout(() => setOverlayActive(true), 2200);
    return () => window.clearTimeout(timeout);
  }, [frameDrawn, ratioSegmentsDrawn, spiralDrawn]);

  ratioSegmentRefs.current = [];

  return (
    <>
      {/* HEADER */}
      <header className={joinClasses(styles.header, navVisible && styles.headerVisible)}>
        <div className={styles.headerInner}>
          <Link href="#home" className={styles.logoLink}>
            <span className="sr-only">JSDetail home</span>
            <div className={styles.logoWrap}>
              <Image src="/Images/webp/JS_Detail_Typography.webp" alt="JSDetail" width={1920} height={1080} priority quality={95} sizes="(max-width: 640px) 140px, 220px" className={styles.logoImage} style={{ width: "100%", height: "100%" }} />
            </div>
          </Link>
          <nav className={styles.nav} aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className={styles.navLink} onClick={(e) => { e.preventDefault(); document.getElementById(link.href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" }); }}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.page}>
        {/* 1. HERO */}
        <section ref={heroRef} id="home" className={joinClasses(styles.section, styles.heroSection)}>
          <div className={styles.heroStage}>
            <div className={styles.heroFrame}>
              <Image src="/Images/webp/JS_Detail_Typography.webp" alt="JSDetail logo" width={1920} height={1080} priority quality={95} sizes="(max-width: 768px) 70vw, (max-width: 1280px) 48vw, 720px" className={styles.heroLogo} style={{ width: "100%", height: "100%" }} />
              <div className={styles.heroSpiral} aria-hidden="true">
                <svg className={styles.heroSpiralSvg} viewBox="0 0 1582 998" role="presentation">
                  <g fill="none" stroke="currentColor">
                    <path ref={ratioFrameRef} className={joinClasses(styles.heroRatioFrame, frameDrawn && styles.heroRatioFrameActive)} d="M1 997L1 1L1581 1L1581 997L1 997" />
                    {RATIO_SEGMENTS.map(({ d, delay }, index) => (
                      <path key={d} ref={(el) => { ratioSegmentRefs.current[index] = el; }} className={joinClasses(styles.heroRatioSegment, ratioSegmentsDrawn && styles.heroRatioSegmentActive)} d={d} style={{ transitionDelay: `${delay}s` }} />
                    ))}
                    <path className={styles.heroRatioBoxes} d="M1 997V1H973M1 997H1205M973 1H1581V621M1581 621V997H1205M1581 621H981M1205 997L1205 621M1111 621L1111 762M1205 705H1111M981 1V997M1205 762H981M1143 762V705M1143 732H1111" />
                    <path ref={spiralPathRef} className={joinClasses(styles.heroRatioSpiral, spiralDrawn && styles.heroSpiralActive)} d="M1 997C1 687 214.6 1 973 1C1158.33 5 1581 157 1581 621C1581 621 1581 997 1205 997C1133 997 981 950 981 765C981 726.5 1023 621 1111 621C1139.5 621 1205 638 1205 705C1205.33 724.667 1188.5 762 1143.5 762C1131.83 761.667 1111 753.9 1111 731.5" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </div>
            </div>
            <FlavorWordsOverlay className={styles.heroFlavorOverlay} words={HERO_FLAVOR_WORDS} active={overlayActive} />
            <p className={styles.heroTagline}>Perspective with Purpose</p>
          </div>
        </section>

        {/* 2. PHILOSOPHY STRIP */}
        <section ref={philRef} className={joinClasses(styles.philosophyStrip, philVisible && styles.philosophyVisible)}>
          <blockquote className={styles.philosophyQuote}>
            We don&rsquo;t sell pixels. We don&rsquo;t sell points. We sell <span className={styles.goldAccent}>truth</span>.
          </blockquote>
        </section>

        {/* 3. SERVICES SLIDER */}
        <section id="services" className={styles.sliderSection}>
          <div className={styles.sliderInner}>
            <header className={styles.sliderHeader}>
              <span className={styles.sliderEyebrow}>Services by Sector</span>
              <h2>Find Your Solution</h2>
              <p>Select a sector to see how JSDetail delivers precision data tailored to your industry.</p>
            </header>
            <div className={styles.sliderTrack} role="list">
              {sectorSlides.map((sector, index) => {
                const isActive = activeSlide === index;
                return (
                  <button key={sector.name} type="button" role="listitem" className={joinClasses(styles.sliderCard, isActive && styles.sliderCardActive)} onClick={() => setActiveSlide(index)} aria-pressed={isActive} aria-label={`Sector: ${sector.name}`} style={{ "--card-bg": sector.color } as React.CSSProperties}>
                    <span aria-hidden="true" className={styles.sliderName}>{sector.label}</span>
                    <div className={styles.sliderDetails}>
                      <strong>{sector.name}</strong>
                      <p className={styles.sliderDesc}>{sector.description}</p>
                      <ul className={styles.sliderDeliverables}>
                        {sector.deliverables.map((d) => <li key={d}>{d}</li>)}
                      </ul>
                      <a href="#contact" className={styles.estimateButton} onClick={(e) => { e.stopPropagation(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}>
                        Get Estimate
                      </a>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section ref={howRef} className={joinClasses(styles.section, styles.howSection, howVisible && styles.howVisible)}>
          <div className={styles.sectionHeading}>
            <h2>How It Works</h2>
          </div>
          <div className={styles.howGrid}>
            {howItWorks.map((step, i) => (
              <div key={step.num} className={styles.howStep} style={{ transitionDelay: `${i * 0.2}s` }}>
                <span className={styles.howNum}>{step.num}</span>
                <h3 className={styles.howTitle}>{step.title}</h3>
                <p className={styles.howDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. EQUIPMENT / TRUST */}
        <section ref={trustRef} className={joinClasses(styles.section, styles.trustSection, trustVisible && styles.trustVisible)}>
          <div className={styles.sectionHeading}>
            <h2>Built for Confidence</h2>
          </div>
          <div className={styles.trustGrid}>
            {trustPillars.map((pillar, i) => (
              <div key={pillar.title} className={styles.trustCard} style={{ transitionDelay: `${i * 0.15}s` }}>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. ABOUT */}
        <section ref={aboutRef} id="about" className={joinClasses(styles.section, styles.aboutSection, aboutVisible && styles.aboutVisible)}>
          <div className={styles.sectionHeading}>
            <h2>About</h2>
          </div>
          <div className={styles.aboutFlow}>
            <p>JS Detail was built around a simple idea: complex problems require disciplined systems, not just tools. With more than 25 years in high-performance operations&mdash;from executive leadership to architecture and engineering&mdash;the foundation is precision, repeatability, and defensible results.</p>
            <hr className={styles.goldRule} />
            <p>The technology is not the product. The product is clarity. When the data is honest, the results speak for themselves. We don&rsquo;t beautify. We don&rsquo;t manipulate. We capture what&rsquo;s there and present it with discipline.</p>
            <hr className={styles.goldRule} />
            <p>Every project follows the same rigor: defined objectives, controlled variables, documented processes, defensible results. The same standards whether it&rsquo;s a residential roof inspection or a 200-acre agricultural survey.</p>
          </div>
        </section>

        {/* 7. CONTACT */}
        <section ref={contactRef} id="contact" className={joinClasses(styles.section, styles.contactSection, contactVisible && styles.contactVisible)}>
          <div className={styles.sectionHeading}>
            <h2>Contact</h2>
          </div>
          <div className={styles.contactGrid}>
            <div className={styles.contactIntro}>
              <p>Ready to see what precision data can do for your project? Reach out and we&rsquo;ll scope it together.</p>
              <p className={styles.contactEmail}>
                <a href="mailto:info@jsdetail.com">info@jsdetail.com</a>
              </p>
              <p className={styles.contactNote}>We respond within 24 hours.</p>
            </div>
            <form className={styles.contactForm} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formRow}>
                <label htmlFor="name">Name</label>
                <input id="name" type="text" required />
              </div>
              <div className={styles.formRow}>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required />
              </div>
              <div className={styles.formRow}>
                <label htmlFor="sector">Sector</label>
                <select id="sector" className={styles.formSelect}>
                  <option value="">Select a sector…</option>
                  {sectorSlides.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className={styles.formRow}>
                <label htmlFor="message">Message</label>
                <textarea id="message" rows={5} />
              </div>
              <button type="submit" className={styles.submitButton}>Send Message</button>
            </form>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.logoWrapSmall}>
              <Image src="/Images/webp/JS_Detail_Typography.webp" alt="JSDetail" width={1920} height={1080} quality={95} sizes="(max-width: 640px) 160px, 220px" className={styles.logoImage} style={{ width: "100%", height: "100%" }} />
            </div>
            <p>Perspective with Purpose</p>
          </div>
          <div className={styles.footerNav}>
            {navLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
          </div>
          <div className={styles.footerSocial}>
            {socialLinks.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.aria}>{social.label}</a>)}
          </div>
          <a className={styles.backToTop} href="#home">Back to Top</a>
        </div>
        <p className={styles.copyline}>&copy; {new Date().getFullYear()} JSDetail LLC. All rights reserved.</p>
      </footer>
    </>
  );
}
