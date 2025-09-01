'use client'

import { useEffect, useMemo, useRef } from 'react'
import { PATH_D } from './pathData'

// Map scroll progress -> path progress to control speed/lingers.
// Edit these keyframes to change how fast the line reveals.
// Example below slows early, speeds up, then lingers around 60%.
const MAIN_MAP = [
  { scroll: 0.00, value: 0.00 }, // start
  { scroll: 0.18, value: 0.20 }, // reveal a bit
  { scroll: 0.35, value: 0.60 }, // quick curve/sling to left/back
  { scroll: 0.50, value: 0.60 }, // linger mid-page
  { scroll: 0.80, value: 1.00 }, // finish as we approach end
  { scroll: 1.00, value: 1.00 },
] as const

// Secondary path (e.g., camera) draws later while main lingers
const SECONDARY_MAP = [
  { scroll: 0.00, value: 0.00 },
  { scroll: 0.50, value: 0.00 }, // hold hidden during early sections
  { scroll: 0.65, value: 1.00 }, // draw camera while lingering
  { scroll: 1.00, value: 1.00 },
] as const

// Dot that “spins” along the main path; accelerate on the middle segment
const DOT_MAP = [
  { scroll: 0.00, value: 0.00 },
  { scroll: 0.60, value: 0.60 }, // idle until mid-page
  { scroll: 0.72, value: 0.85 }, // slingshot through curve (fast)
  { scroll: 0.80, value: 0.90 }, // slow on straight
  { scroll: 1.00, value: 1.00 },
] as const

function mapProgress(scrollProgress: number, map: readonly { scroll: number; value: number }[]) {
  const p = Math.min(Math.max(scrollProgress, 0), 1)
  for (let i = 1; i < map.length; i++) {
    if (p <= map[i].scroll) {
      const a = map[i - 1]
      const b = map[i]
      const t = (p - a.scroll) / (b.scroll - a.scroll || 1)
      return a.value + t * (b.value - a.value)
    }
  }
  return map[map.length - 1].value
}

// Split path data into subpaths (each starting with M/m). This avoids the
// “pre-drawn” issue because dash patterns reset per subpath in SVG.
function splitSubpaths(d: string): string[] {
  const parts = d.match(/[Mm][^Mm]*/g)
  return parts ?? [d]
}

export default function SingleLineScroll() {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRefs = useRef<SVGPathElement[]>([])
  const dotRef = useRef<SVGCircleElement>(null)
  const subpaths = useMemo(() => splitSubpaths(PATH_D), [])

  useEffect(() => {
    const svg = svgRef.current
    const paths = pathRefs.current.filter(Boolean)
    if (!svg || paths.length === 0) return

    // Prepare dash for each subpath using its own length
    const lengths = paths.map((p) => p.getTotalLength())
    const total = lengths.reduce((a, b) => a + b, 0)

    paths.forEach((p, i) => {
      const L = lengths[i]
      p.style.strokeDasharray = `${L} ${L}`
      p.style.strokeDashoffset = `${L}`
    })

    let rafId = 0
    const update = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
      const scrollHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const scrollPct = Math.min(scrollTop / scrollHeight, 1)
      // Main path progress
      const mainPct = mapProgress(scrollPct, MAIN_MAP)
      // Secondary (camera) progress
      const secondaryPct = mapProgress(scrollPct, SECONDARY_MAP)
      // Dot progress along main subpath
      const dotPct = mapProgress(scrollPct, DOT_MAP)

      // Distribute progress per subpath: index 0 = main, index 1+ secondary
      for (let i = 0; i < paths.length; i++) {
        const L = lengths[i]
        const p = paths[i]
        const pct = i === 0 ? mainPct : secondaryPct
        p.style.strokeDashoffset = `${L - L * pct}`
      }

      // Position the dot along the main path
      const dot = dotRef.current
      const mainPath = paths[0]
      if (dot && mainPath) {
        const L0 = lengths[0]
        const len = Math.max(0, Math.min(L0, L0 * dotPct))
        const pt = mainPath.getPointAtLength(len)
        dot.setAttribute('cx', String(pt.x))
        dot.setAttribute('cy', String(pt.y))
        // Show only during the “spin window” (60%–80% of scroll)
        const visible = scrollPct >= 0.6 && scrollPct <= 0.85
        dot.setAttribute('opacity', visible ? '0.9' : '0')
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update() // Initial paint

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [subpaths])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <svg
        ref={svgRef}
        viewBox="0 0 4941 16570"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto min-h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {subpaths.map((d, i) => (
          <path
            key={i}
            ref={(el) => {
              if (el) pathRefs.current[i] = el
            }}
            d={d.trim()}
            stroke="#333"
            strokeWidth="var(--stroke-width, 3)"
            fill="none"
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-75 ease-linear"
            style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.1))' }}
          />
        ))}
        <circle ref={dotRef} r="35" fill="#333" opacity="0" />
      </svg>
    </div>
  )
}
