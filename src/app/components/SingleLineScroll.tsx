'use client'

import { useEffect, useMemo, useRef } from 'react'
import { PATH_D } from './pathData'

// Map scroll progress -> path progress to control speed/lingers.
// Edit these keyframes to change how fast the line reveals.
// Example below slows early, speeds up, then lingers around 60%.
const PROGRESS_MAP = [
  { scroll: 0.0, path: 0.0 },
  { scroll: 0.20, path: 0.05 },
  { scroll: 0.40, path: 0.30 },
  { scroll: 0.60, path: 0.30 }, // linger: flat segment -> no change in path
  { scroll: 1.00, path: 1.00 },
] as const

function mapProgress(scrollProgress: number) {
  const p = Math.min(Math.max(scrollProgress, 0), 1)
  for (let i = 1; i < PROGRESS_MAP.length; i++) {
    if (p <= PROGRESS_MAP[i].scroll) {
      const a = PROGRESS_MAP[i - 1]
      const b = PROGRESS_MAP[i]
      const t = (p - a.scroll) / (b.scroll - a.scroll || 1)
      return a.path + t * (b.path - a.path)
    }
  }
  return PROGRESS_MAP[PROGRESS_MAP.length - 1].path
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
      const pathPct = mapProgress(scrollPct)

      const targetDraw = total * pathPct
      let remaining = targetDraw

      for (let i = 0; i < paths.length; i++) {
        const L = lengths[i]
        const p = paths[i]
        if (remaining <= 0) {
          p.style.strokeDashoffset = `${L}`
        } else if (remaining >= L) {
          p.style.strokeDashoffset = '0'
          remaining -= L
        } else {
          p.style.strokeDashoffset = `${L - remaining}`
          remaining = 0
        }
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
      </svg>
    </div>
  )
}
