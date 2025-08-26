import { useEffect, useRef, useState } from 'react'
import styles from '../styles/LineReveal.module.css'

export default function LineReveal({ scrubMode = false }) {
  const containerRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const observersRef = useRef(new Map())
  const reducedMotion = typeof window !== 'undefined' ? 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches : false

  useEffect(() => {
    let mounted = true

    const initLineReveal = async () => {
      try {
        const placeholder = containerRef.current
        if (!placeholder || !mounted) return

        // Inline the external SVG
        const svg = await inlineExternalSVG('/Single_line_design.svg', placeholder)
        if (!svg || !mounted) return

        // Prepare paths for animation
        const pathData = prepPaths(svg)
        if (pathData.length === 0 || !mounted) return

        setIsLoaded(true)

        if (reducedMotion) {
          // Skip animation for reduced motion preference
          setAllPathsDrawn(pathData)
          return
        }

        if (scrubMode) {
          setupScrubMode(svg, pathData, observersRef.current)
        } else {
          setupTriggerMode(svg, pathData, observersRef.current)
        }

      } catch (error) {
        console.error('Line reveal initialization failed:', error)
        if (mounted && containerRef.current) {
          containerRef.current.style.display = 'none'
        }
      }
    }

    initLineReveal()

    return () => {
      mounted = false
      // Cleanup observers
      observersRef.current.forEach(observer => {
        observer.disconnect()
      })
      observersRef.current.clear()
    }
  }, [scrubMode, reducedMotion])

  // Handle visibility change for cleanup
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        observersRef.current.forEach(observer => {
          observer.disconnect()
        })
        observersRef.current.clear()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Setup reveal-from-top animation for other content
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal-top')
    if (revealElements.length === 0) return

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('is-in')) {
          entry.target.classList.add('is-in')
          revealObserver.unobserve(entry.target)
        }
      })
    }, {
      rootMargin: '0% 0% -80% 0%',
      threshold: 0
    })

    revealElements.forEach(el => revealObserver.observe(el))

    return () => revealObserver.disconnect()
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`${styles.heroLine} ${isLoaded ? styles.loaded : ''}`}
      data-line-placeholder
      data-scrub={scrubMode.toString()}
      aria-hidden="true"
    />
  )
}

/**
 * Fetch and inline external SVG
 */
async function inlineExternalSVG(url, mountEl) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.status}`)
    }

    const svgText = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgText, 'image/svg+xml')
    const svg = doc.querySelector('svg')

    if (!svg) {
      throw new Error('No SVG element found in fetched content')
    }

    // Clone the SVG to avoid issues with moving between documents
    const clonedSvg = svg.cloneNode(true)

    // Add required attributes
    clonedSvg.setAttribute('data-line-reveal', '')
    
    // Add accessibility attributes
    const titleId = 'lineTitle'
    const title = document.createElement('title')
    title.id = titleId
    title.textContent = 'Animated line drawing'
    clonedSvg.insertBefore(title, clonedSvg.firstChild)
    clonedSvg.setAttribute('aria-labelledby', titleId)
    clonedSvg.setAttribute('role', 'img')

    // Clear placeholder and insert SVG
    mountEl.innerHTML = ''
    mountEl.appendChild(clonedSvg)

    return clonedSvg

  } catch (error) {
    console.error('SVG inlining failed:', error)
    throw error
  }
}

/**
 * Prepare all paths for animation - prevents flicker by disabling transitions initially
 */
function prepPaths(svg) {
  const paths = []
  
  // Find paths in elements with data-draw attribute, fallback to all paths
  let targetPaths = svg.querySelectorAll('[data-draw] path')
  if (targetPaths.length === 0) {
    targetPaths = svg.querySelectorAll('path')
  }

  targetPaths.forEach((path, index) => {
    try {
      const length = path.getTotalLength()
      
      // PREVENT FLICKER: Disable transition while setting initial values
      path.style.transition = 'none'
      path.style.strokeDasharray = length
      path.style.strokeDashoffset = length
      path.style.fill = 'none'
      
      // Ensure visible stroke
      if (!path.style.stroke && !path.getAttribute('stroke')) {
        path.style.stroke = 'var(--line-stroke)'
      }

      paths.push({
        element: path,
        length: length,
        index: index
      })

    } catch (error) {
      console.warn(`Failed to process path ${index}:`, error)
    }
  })

  // Force reflow then re-enable transitions for animation
  svg.getBoundingClientRect()
  targetPaths.forEach(path => {
    path.style.transition = 'stroke-dashoffset 1.2s ease-out'
  })

  return paths
}

/**
 * Setup trigger mode - animate when SVG approaches TOP of viewport
 */
function setupTriggerMode(svg, pathData, observers) {
  if (!('IntersectionObserver' in window)) {
    setupScrollFallback(svg, pathData, false)
    return
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !svg.hasAttribute('data-drawn')) {
        // Check if element's top is near the top of viewport (within 20% of viewport height)
        const rect = entry.boundingClientRect
        const viewportHeight = window.innerHeight
        const isNearTop = rect.top <= viewportHeight * 0.2
        
        if (isNearTop) {
          animatePathsWithStagger(pathData)
          observer.unobserve(entry.target)
        }
      }
    })
  }, {
    // This rootMargin triggers when element is 80% above the bottom of viewport
    // Effectively means: trigger when element approaches the top 20% of viewport
    rootMargin: '0% 0% -80% 0%',
    threshold: [0, 0.1]
  })

  observer.observe(svg)
  observers.set('trigger', observer)
}

/**
 * Setup scrub mode - animation follows scroll progress
 */
function setupScrubMode(svg, pathData, observers) {
  if (!('IntersectionObserver' in window)) {
    setupScrollFallback(svg, pathData, true)
    return
  }

  // Create threshold array for smooth progress tracking
  const thresholds = []
  for (let i = 0; i <= 100; i++) {
    thresholds.push(i / 100)
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Map visible ratio to drawing progress
      let progress = Math.max(0, Math.min(1, (entry.intersectionRatio - 0.1) / 0.8))
      
      pathData.forEach(({ element, length }) => {
        const offset = (1 - progress) * length
        element.style.strokeDashoffset = offset
      })
    })
  }, {
    threshold: thresholds,
    rootMargin: '0px'
  })

  observer.observe(svg)
  observers.set('scrub', observer)
}

/**
 * Animate paths with stagger effect
 */
function animatePathsWithStagger(pathData) {
  const staggerDelay = 60 // 60ms between each path

  pathData.forEach(({ element }, index) => {
    setTimeout(() => {
      element.style.strokeDashoffset = '0'
    }, index * staggerDelay)
  })

  // Mark as drawn after all animations complete
  setTimeout(() => {
    const svg = document.querySelector('[data-line-reveal]')
    if (svg) {
      svg.setAttribute('data-drawn', 'true')
    }
  }, pathData.length * staggerDelay + 1200)
}

/**
 * Set all paths to fully drawn state
 */
function setAllPathsDrawn(pathData) {
  pathData.forEach(({ element }) => {
    element.style.strokeDashoffset = '0'
  })

  const svg = document.querySelector('[data-line-reveal]')
  if (svg) {
    svg.setAttribute('data-drawn', 'true')
  }
}

/**
 * Fallback for browsers without IntersectionObserver
 */
function setupScrollFallback(svg, pathData, isScrub = false) {
  let ticking = false
  let hasTriggered = false

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const rect = svg.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const elementHeight = rect.height
        
        const visibleTop = Math.max(0, viewportHeight - rect.top)
        const visibleBottom = Math.min(elementHeight, visibleTop)
        const visibleRatio = Math.max(0, visibleBottom / elementHeight)

        if (isScrub) {
          const progress = Math.max(0, Math.min(1, (visibleRatio - 0.1) / 0.8))
          pathData.forEach(({ element, length }) => {
            const offset = (1 - progress) * length
            element.style.strokeDashoffset = offset
          })
        } else {
          if (visibleRatio >= 0.25 && !hasTriggered) {
            hasTriggered = true
            animatePathsWithStagger(pathData)
            window.removeEventListener('scroll', handleScroll)
          }
        }

        ticking = false
      })
      ticking = true
    }
  }

  window.addEventListener('scroll', handleScroll)
  handleScroll()
}