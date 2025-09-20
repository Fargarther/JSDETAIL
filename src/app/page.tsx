"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

import FlavorWordsOverlay from "@/components/FlavorWordsOverlay";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

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

const valuePillars = [
  {
    title: "Cinematic Storytelling",
    description:
      "Every project is crafted like a film. We do not just shoot scenes; we build a narrative. Through planning, dramatic composition, and masterful editing, we ensure your visuals are emotionally resonant and memorable.",
  },
  {
    title: "Every Angle Covered",
    description:
      "We are hybrid image-makers. Our drones capture the grand bird's-eye perspective while our ground cameras reveal human-scale detail. The result is a cohesive, 360-degree experience with a consistent style and quality.",
  },
  {
    title: "Precision & Detail",
    description:
      "Details matter. From macro shots that highlight texture to color grading that sets the perfect mood, we polish every pixel and frame so your visuals build trust and move viewers to act.",
  },
  {
    title: "Licensed & Insured",
    description:
      "Professionalism underpins everything. We are FAA Part 107 certified, fully insured, and meticulous about safety and compliance so you can rely on a team that protects your project and reputation.",
  },
];
const portfolioProjects = [
  {
    title: "Skyline Luxury Condos",
    category: "Aerial Tour",
    description:
      "A breathtaking 4K drone tour captured at golden hour. The sweeping shots highlighted the tower and its downtown surroundings, helping the developer pre-sell units faster than expected.",
  },
  {
    title: "Farm-to-Table Cuisine",
    category: "Food Photography",
    description:
      "A mouth-watering shoot for a farm-to-table bistro. Vibrant colors, styled plates, and texture-rich details powered a new menu launch and drove a spike in reservations.",
  },
  {
    title: "Innovative Gadget Launch",
    category: "Product Film",
    description:
      "A cinematic launch film that combined macro shots with lifestyle footage. Thousands of views and high engagement reinforced the product's quality and innovation.",
  },
  {
    title: "Heritage Bridge Inspection",
    category: "Industrial Mapping",
    description:
      "High-detail drone imagery and orthomosaic mapping delivered a comprehensive structural view without road closures, saving the client weeks of manual inspection time.",
  },
];

const testimonials = [
  {
    quote:
      "Our listing never looked so good. The aerial photos and video set us above the competition. We had a buyer in six days at five percent over asking price.",
    name: "Jane D.",
    role: "Realtor, Skyline Realty",
  },
  {
    quote:
      "JSDetail's images gave our online store a boost. The product shots were so crisp and inviting that monthly sales jumped right after we updated the site.",
    name: "John S.",
    role: "Founder, CraftedGoods Co.",
  },
  {
    quote:
      "The video they produced was pure cinema. It captured our story in two minutes and struck an emotional chord. Engagement went through the roof.",
    name: "Mary J.",
    role: "Marketing Director, Acme Innovations",
  },
];
const services = [
  {
    id: "aerial-services",
    name: "Aerial Services (Drone Imaging)",
    tagline: "See the world from a higher perspective.",
    description:
      "Our aerial photography and videography services put your project in the best light from above. We operate professional-grade drones to capture ultra-smooth 4K footage and high-resolution stills. Whether you are showcasing a property, inspecting infrastructure, or surveying land, we deliver sharp, cinematic visuals with efficiency and safety.",
    useCases: [
      {
        title: "Real Estate Marketing",
        detail:
          "Give potential buyers a view that sets your listings apart. Aerial imagery highlights the full scope of a property--house, land, neighborhood, and context--making listings more compelling and helping them sell faster.",
      },
      {
        title: "Inspections & Surveying",
        detail:
          "Inspect roofs, towers, farmland, and other hard-to-reach locations without risk. Drones boost efficiency and keep teams safely on the ground while gathering detailed visual data.",
      },
      {
        title: "Mapping & 3D Modeling",
        detail:
          "Survey large areas quickly with automated flight plans and deliver orthomosaic maps, elevation models, and 3D reconstructions up to five times faster than traditional ground methods.",
      },
    ],
    deliverables: [
      "Ultra-HD aerial photographs (20MP and above) supplied in JPG or TIFF for print and detailed analysis.",
      "4K stabilized video clips delivered as raw footage or polished highlight reels ready for marketing.",
      "Interactive maps and models, including georeferenced orthomosaics and 3D digital assets for survey work.",
      "Flight logs and compliance documentation on request so you have a clear record of authorizations and safety checks.",
    ],
    caseStudy: {
      title: "Case Study: Industrial Roof Inspection",
      client:
        "Client: A manufacturing company needed an immediate assessment of storm damage on a 200,000 square foot facility without disrupting operations.",
      approach:
        "Approach: We surveyed the entire roof in under an hour, capturing high-resolution photos and 4K video of every section, including close-ups of vulnerable areas while the team remained safely on the ground.",
      outcome:
        "Outcome: A same-day report with annotated imagery identified damaged HVAC units and torn flashing, saving the client two weeks of manual inspections and enabling immediate repairs.",
    },
    cta: "Ready to reach new heights? Contact us to schedule a drone shoot or request a quote.",
  },
  {
    id: "studio-photography",
    name: "Studio Photography (Macro & Product)",
    tagline: "Showcase the smallest details in the best light.",
    description:
      "Our studio photography covers macro, food, and product shoots that bring out the beauty in every subject. In a controlled studio or on-location setup we tailor lighting, backdrops, and composition to highlight what makes your product special. Expect crisp, high-impact images that build trust and drive sales.",
    useCases: [
      {
        title: "Product Catalog & Ecommerce",
        detail:
          "Deliver consistent, high-resolution images from multiple angles, including macro shots that highlight craftsmanship so shoppers can buy with confidence.",
      },
      {
        title: "Food & Beverage Marketing",
        detail:
          "Tempt customers with styled dishes, drinks, and ingredients. We capture color, texture, and atmosphere so viewers can almost taste the menu.",
      },
      {
        title: "Lifestyle & Editorial Shots",
        detail:
          "Build small-scale sets or flatlays that place your product in context. Editorial imagery connects your offer to a lifestyle, campaign, or brand value.",
      },
    ],
    deliverables: [
      "High-resolution edited photos delivered in print-ready and web-optimized formats with careful retouching.",
      "Multiple angles and crops with optional transparent-background PNGs and social ratios on request.",
      "Styling and prop planning sessions to craft shot lists, secure props, and align on mood boards before the shoot.",
      "Broad usage rights for your business across web, social, and print, with credit requested only when feasible.",
    ],
    caseStudy: {
      title: "Case Study: Farm-to-Table Menu Refresh",
      client:
        "Client: A farm-to-table restaurant needed imagery that matched its vibrant, rustic rebrand.",
      approach:
        "Approach: We staged a full-day shoot with the chef, using natural light effects, macro lenses, and ingredient styling to capture texture and warmth.",
      outcome:
        "Outcome: The imagery boosted reservations within a month and generated social buzz, with the client noting that the photos conveyed the atmosphere and care behind each dish.",
    },
    cta: "Ready to make your product shine? Let's design a studio shoot that captures the detail, color, and style of your offerings.",
  },
  {
    id: "cinematic-storytelling",
    name: "Cinematic Visual Storytelling (Video Production)",
    tagline: "Your story, captured on film.",
    description:
      "Our cinematic storytelling service transforms your message into a moving visual experience. From concept through final edit we produce brand films, promotional videos, event highlights, and short-form documentaries that connect with your audience.",
    useCases: [
      {
        title: "Brand & Product Films",
        detail:
          "Share your mission, process, or launch with narrative-driven visuals that blend customer voices, founder insights, and cinematic footage to forge emotional connections.",
      },
      {
        title: "Event Highlights & Recaps",
        detail:
          "Relive the energy of your conferences, festivals, or celebrations. Multi-angle coverage and rhythmic edits turn moments into marketing tools for future events.",
      },
      {
        title: "Documentary-Style Shorts",
        detail:
          "Spotlight real people and unscripted stories. Interviews, b-roll, and thoughtful pacing deliver authentic, human-centered videos for campaigns or internal inspiration.",
      },
    ],
    deliverables: [
      "Full-length videos tailored to the target platform, from two-minute brand films to 60-second social ads in HD or 4K.",
      "Social media cutdowns that capture attention quickly with captions or text overlays for sound-off viewing.",
      "Professional audio capture, licensed music, and sound mixing that balances dialogue, music, and natural ambience.",
      "Storyboards and scripts developed during pre-production so every stakeholder aligns on the vision before cameras roll.",
    ],
    caseStudy: {
      title: "Case Study: Outdoor Gear Brand Film",
      client:
        "Client: AlpineQuest needed a launch video that would stand out in a competitive gear market.",
      approach:
        "Approach: We scripted 'Journey to the Summit,' scouted mountain locations, combined drone panoramas with intimate ground shots, and paired it with a founder voiceover.",
      outcome:
        "Outcome: The film drove thousands of views, increased social followers, and became a centerpiece at trade shows and pitches, sparking product inquiries and momentum.",
    },
    cta: "Ready to tell your story through film? Contact us and let's build a cinematic plan from pre-production to final cut.",
  },
];
const aboutSections = [
  {
    title: "Our Philosophy",
    paragraphs: [
      "Great visuals begin with great vision. Imagery is narrative, not decoration, so we combine technical excellence with cinematic storytelling to amplify your message.",
      "We are outcome-oriented and intentional. Every frame must serve a purpose, whether that is sparking emotion or highlighting a critical detail.",
      "JSDetail is named for our obsession with detail. From planning to post, we refine each moment so the final piece aligns with your goals.",
    ],
  },
  {
    title: "The Team",
    paragraphs: [
      "We are a tight-knit team of visual storytellers with backgrounds in photography, film, and engineering. Think of us as the artist's eye paired with the pilot's steady hand.",
      "Our lead drone operator is an FAA-certified pilot with hundreds of logged flight hours, and our lead photographer brings more than a decade of experience capturing wow-worthy images.",
      "On larger productions we tap a trusted crew of camera operators, stylists, and audio specialists so you get boutique attention with full-scale capability.",
    ],
  },
  {
    title: "Equipment & Technology",
    introduction:
      "We invest in professional-grade tools so your project benefits from quality, reliability, and creative flexibility.",
    bullets: [
      "Advanced DJI drone fleet capable of 5.1K video, 20+ megapixel photos, and obstacle avoidance for smooth cinematic shots.",
      "Full-frame mirrorless camera systems with macro and fast prime lenses that capture precise details and cinematic depth.",
      "Lighting, stabilization, and audio kits including softboxes, LED panels, gimbals, sliders, and broadcast-quality microphones.",
      "Post-production powered by Adobe Creative Suite and DaVinci Resolve on calibrated workstations for accurate color, retouching, and motion graphics.",
    ],
  },
  {
    title: "Safety & Compliance",
    introduction: "Safety is built into every shoot, from pre-production planning to delivery.",
    bullets: [
      "FAA Part 107 certified pilots manage every commercial flight and keep authorizations current.",
      "Comprehensive liability insurance covers aerial and on-site production so you have peace of mind.",
      "Detailed site planning covers airspace research, permits, safe perimeters, and weather monitoring before and during each shoot.",
      "Secure data practices protect sensitive footage, honor NDAs, and respect privacy when neighboring properties are captured.",
    ],
  },
];

const policyGroups = [
  {
    title: "Privacy Policy (Summary)",
    items: [
      "Information We Collect: We keep the details you share through forms or email along with aggregate site analytics used to improve performance.",
      "How We Use Your Information: Contact information helps us respond, quote, and deliver services. We never sell your data and only share it when necessary to fulfill a request or comply with the law.",
      "Cookies & Tracking: Analytics cookies may help us understand which pages are popular. Disable them in your browser if you prefer.",
      "Data Security: We secure email, devices, and delivery platforms, but no method is 100 percent foolproof. We work hard to protect your data.",
      "Your Rights: You may request to review, correct, or delete your information unless a record must be kept for legal or administrative reasons.",
      "Policy Updates: We refresh this summary as services or regulations change and recommend checking back periodically.",
    ],
  },
  {
    title: "Terms of Service (Summary)",
    items: [
      "Website Content: All site text, imagery, and video belong to JSDetail unless credited. Please request permission before using content commercially.",
      "Acceptable Use: Use the site lawfully and avoid actions that could harm performance, security, or access for others.",
      "Third-Party Links: External references are for convenience and follow their own terms. Visiting them is at your discretion.",
      "Service Agreements: Project-specific contracts clarify scope, deliverables, and payment in addition to these general terms.",
      "Liability: The site is provided as-is. Our liability for any claim is limited to the amount paid for the related services.",
      "Governing Law: Illinois law governs site use, and unresolved disputes fall under the jurisdiction of Illinois courts.",
    ],
  },
];

const faqs = [
  {
    question: "What areas do you serve?",
    answer:
      "We are based in Illinois and primarily serve Central Illinois and the Chicago region. For the right project we travel, and we will outline any associated travel fees during planning.",
  },
  {
    question: "Are you licensed and insured for drone work?",
    answer:
      "Yes. Our pilots hold FAA Part 107 certification for commercial drone operations and we carry liability insurance tailored to aerial and on-site production.",
  },
  {
    question: "How do I book a shoot or project?",
    answer:
      "Start by reaching out through the form or by email. Share what you have in mind and we will respond within one business day to discuss ideas, provide an initial quote, and schedule next steps.",
  },
  {
    question: "What is your turnaround time for deliverables?",
    answer:
      "Photographs are typically delivered within three to five business days, while video projects range from one to several weeks depending on complexity. We will align on a timeline before production.",
  },
  {
    question: "How much do your services cost?",
    answer:
      "Pricing depends on scope, travel, complexity, and post-production needs. After we understand your goals we will provide a transparent proposal with any potential add-ons discussed upfront.",
  },
  {
    question: "What if the weather is bad on shoot day?",
    answer:
      "We monitor forecasts closely. If conditions are unsafe we reschedule at the earliest opportunity with no penalty. For time-sensitive events we create contingency plans together.",
  },
  {
    question: "Can you work with our marketing agency?",
    answer:
      "Absolutely. We regularly collaborate with internal teams and agencies, integrating into your workflow and aligning with art direction or campaign guidelines.",
  },
  {
    question: "Do you provide raw files or footage?",
    answer:
      "Edited deliverables come standard. Raw photos or footage can be supplied if arranged in advance, often with an additional handling fee and clear licensing terms.",
  },
  {
    question: "What sets JSDetail apart?",
    answer:
      "We combine aerial and ground production under one roof, obsess over narrative, adopt new technology quickly, and keep the process collaborative and enjoyable.",
  },
];

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
  const [navVisible, setNavVisible] = useState(false);
  const spiralPathRef = useRef<SVGPathElement | null>(null);
  const [spiralDrawn, setSpiralDrawn] = useState(false);
  const ratioFrameRef = useRef<SVGPathElement | null>(null);
  const [frameDrawn, setFrameDrawn] = useState(false);
  const ratioSegmentRefs = useRef<Array<SVGPathElement | null>>([]);
  const [ratioSegmentsDrawn, setRatioSegmentsDrawn] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success">("idle");

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
    const timeout = window.setTimeout(() => setOverlayActive(true), 220);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [frameDrawn, ratioSegmentsDrawn, spiralDrawn]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    form.reset();
    setFormStatus("success");
  };

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
                fill
                priority
                sizes="(max-width: 768px) 140px, 220px"
                className={styles.logoImage}
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
                fill
                priority
                sizes="(max-width: 768px) 80vw, 720px"
                className={styles.heroLogo}
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
        <section className={joinClasses(styles.section, styles.introSection)}>
          <div className={styles.sectionHeading}>
            <h2>Outcome-Oriented Imagery</h2>
            <p>
              We unite drone footage, high-end photography, and narrative-driven editing so your audience sees the full picture. Immersive visuals inspire action, whether that means buyers envisioning themselves in a home or customers craving your product.
            </p>
          </div>
          <div className={styles.sectionLead}>
            We do more than deliver pretty pictures. We deliver measurable impact and a story your audience remembers.
          </div>
        </section>

        <section className={joinClasses(styles.section, styles.pillarsSection)}>
          <header className={styles.sectionHeading}>
            <h2>Core Value Pillars</h2>
            <p>Four principles guide every project we take on.</p>
          </header>
          <div className={styles.pillarsGrid}>
            {valuePillars.map((pillar) => (
              <article key={pillar.title} className={styles.pillarCard}>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="portfolio" className={joinClasses(styles.section, styles.portfolioSection)}>
          <header className={styles.sectionHeading}>
            <h2>Portfolio Preview</h2>
            <p>A sampling of recent projects that show the breadth and impact of our hybrid approach.</p>
          </header>
          <div className={styles.portfolioGrid}>
            {portfolioProjects.map((project) => (
              <article key={project.title} className={styles.portfolioCard}>
                <span className={styles.cardEyebrow}>{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <a className={styles.cardLink} href="#contact">
                  View Case Study
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className={joinClasses(styles.section, styles.testimonialsSection)}>
          <header className={styles.sectionHeading}>
            <h2>Testimonials</h2>
            <p>Clients trust us with their narratives and results speak for themselves.</p>
          </header>
          <div className={styles.testimonialGrid}>
            {testimonials.map((testimonial) => (
              <figure key={testimonial.quote} className={styles.testimonialCard}>
                <blockquote>{testimonial.quote}</blockquote>
                <figcaption>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="services" className={joinClasses(styles.section, styles.servicesSection)}>
          <header className={styles.sectionHeading}>
            <h2>Services</h2>
            <p>Choose the production partnership that fits your story.</p>
          </header>
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <article key={service.id} id={service.id} className={styles.serviceCard}>
                <div className={styles.serviceHeader}>
                  <span className={styles.cardEyebrow}>{service.tagline}</span>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
                <div className={styles.serviceBody}>
                  <div>
                    <h4>Use Cases</h4>
                    <ul>
                      {service.useCases.map((useCase) => (
                        <li key={useCase.title}>
                          <strong>{useCase.title}:</strong> {useCase.detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>Deliverables</h4>
                    <ul>
                      {service.deliverables.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className={styles.caseStudy}>
                  <h4>{service.caseStudy.title}</h4>
                  <p>{service.caseStudy.client}</p>
                  <p>{service.caseStudy.approach}</p>
                  <p>{service.caseStudy.outcome}</p>
                </div>
                <p className={styles.serviceCta}>{service.cta}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className={joinClasses(styles.section, styles.aboutSection)}>
          <header className={styles.sectionHeading}>
            <h2>About JSDetail</h2>
            <p>Meet the philosophy, people, and process behind the lens.</p>
          </header>
          <div className={styles.aboutGrid}>
            {aboutSections.map((section) => (
              <article key={section.title} className={styles.aboutCard}>
                <h3>{section.title}</h3>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.introduction && <p>{section.introduction}</p>}
                {section.bullets && (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className={joinClasses(styles.section, styles.policySection)}>
          <header className={styles.sectionHeading}>
            <h2>Policies & Fine Print</h2>
            <p>Transparency matters. Here is the plain-language version of our policies.</p>
          </header>
          <div className={styles.policyGrid}>
            {policyGroups.map((group) => (
              <article key={group.title} className={styles.policyCard}>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={joinClasses(styles.section, styles.faqSection)}>
          <header className={styles.sectionHeading}>
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to what clients ask us most often.</p>
          </header>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <article key={faq.question} className={styles.faqItem}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className={joinClasses(styles.section, styles.contactSection)}>
          <div className={styles.contactIntro}>
            <h2>Ready to Build Your Next Story</h2>
            <p>
              Tell us about your project, ask questions, or request a quote. We respond within one business day.
            </p>
            <div className={styles.contactDetails}>
              <p>Prefer email? Reach out at <a href="mailto:hello@jsdetail.com">hello@jsdetail.com</a>.</p>
            </div>
          </div>
          <form
            className={styles.contactForm}
            onSubmit={handleSubmit}
            onChange={() => formStatus === "success" && setFormStatus("idle")}
          >
            <div className={styles.formRow}>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" required placeholder="Your Name" />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="phone">Phone (Optional)</label>
              <input id="phone" name="phone" type="tel" placeholder="123-456-7890" />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="Tell us about your project or question..."
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Send Message
            </button>
            {formStatus === "success" && (
              <p className={styles.formMessage} role="status" aria-live="polite">
                Thank you! Your message has been sent.
              </p>
            )}
          </form>
        </section>

        <section className={joinClasses(styles.section, styles.finalCta)}>
          <h2>Ready to elevate your story?</h2>
          <p>
            Whether you need photos, video, or an all-of-the-above campaign, we are here to deliver stunning results. Contact us to start planning your next project and let your vision take flight.
          </p>
          <a className={styles.primaryButton} href="#contact">
            Get in Touch
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.logoWrapSmall}>
              <Image src="/Images/JS_Detail_Typography.png" alt="JSDetail" fill sizes="140px" className={styles.logoImage} />
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















