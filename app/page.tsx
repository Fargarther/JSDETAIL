"use client";

import SvgLine from "@/components/SvgLine";
import RevealTop from "@/components/RevealTop";
import { useStartAtBottom } from "@/lib/useStartAtBottom";

// Client-only boot wrapper to trigger "start at bottom"
function ClientBoot() {
  useStartAtBottom();
  return null;
}

export default function Page() {
  return (
    <main className="min-h-[200vh] px-4 pb-40">
      <ClientBoot />

      {/* Top spacer so there's room to scroll up from bottom */}
      <section className="h-[80vh]" />

      {/* Hero line that draws when near top */}
      <section className="py-16">
        <SvgLine 
          src="/Images/Single_line_design.svg" 
          nearTopPx={120} 
          scrub={false}
          stroke="currentColor"
          strokeWidth={2}
        />
      </section>

      {/* Content blocks that enter from TOP as they near the viewport top */}
      <RevealTop className="mx-auto max-w-3xl py-24">
        <h1 className="text-4xl font-semibold mb-4 text-center">Chapter One</h1>
        <p className="text-lg leading-relaxed text-center">
          Content enters from above as the reader scrolls up. This creates a unique 
          storytelling experience with bottom-to-top narrative progression.
        </p>
      </RevealTop>

      <RevealTop className="mx-auto max-w-3xl py-24" thresholdTopPx={96}>
        <h2 className="text-3xl font-semibold mb-4 text-center">Another Section</h2>
        <p className="text-lg leading-relaxed text-center">
          Tuned threshold brings this in closer to the top edge. Each section 
          reveals as it approaches the top of the viewport, creating a smooth 
          upward reading flow.
        </p>
      </RevealTop>

      <RevealTop className="mx-auto max-w-3xl py-24 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-8">
        <h2 className="text-3xl font-semibold mb-4 text-center text-indigo-900">SVG Animation</h2>
        <p className="text-lg leading-relaxed text-center text-indigo-800">
          The SVG line drawing animation triggers when the SVG approaches the top 
          of the viewport. Each path draws with a subtle stagger effect, creating 
          a smooth reveal animation.
        </p>
      </RevealTop>

      <RevealTop className="mx-auto max-w-3xl py-24 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-8">
        <h2 className="text-3xl font-semibold mb-4 text-center text-emerald-900">Bottom-Start Flow</h2>
        <p className="text-lg leading-relaxed text-center text-emerald-800">
          This page demonstrates a unique bottom-start experience. Users begin 
          at the bottom and scroll upward to reveal content, creating an inverted 
          narrative structure that&apos;s perfect for storytelling applications.
        </p>
      </RevealTop>

      <RevealTop className="mx-auto max-w-3xl py-24 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg px-8">
        <h2 className="text-3xl font-semibold mb-4 text-center text-purple-900">Final Section</h2>
        <p className="text-lg leading-relaxed text-center text-purple-800">
          This is the end of the content journey. The combination of GSAP 
          ScrollTrigger and Tailwind CSS creates smooth, performant animations 
          that respect accessibility preferences and work across all modern browsers.
        </p>
        <div className="mt-8 text-center">
          <p className="text-sm text-purple-600">
            Scroll back down to experience the journey again!
          </p>
        </div>
      </RevealTop>

      <section className="h-[60vh]" />
    </main>
  );
}