/**
 * SVG Line Animation with Draw-on-Scroll Effect
 * Inspired by: https://www.youtube.com/watch?v=7DiKBDC7cz8
 */

class LineReveal {
  constructor() {
    this.observers = new Map();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  /**
   * Initialize the line reveal animation
   */
  async init() {
    try {
      const placeholder = document.getElementById('hero-line');
      if (!placeholder) {
        console.warn('Line reveal placeholder not found');
        return;
      }

      // Inline the external SVG
      const svg = await this.inlineExternalSVG('/Images/Single_line_design.svg', placeholder);
      if (!svg) return;

      // Prepare paths for animation
      const pathData = this.prepPaths(svg);
      if (pathData.length === 0) return;

      // Check animation mode
      const isScrubMode = placeholder.getAttribute('data-scrub') === 'true';

      if (this.reducedMotion) {
        // Skip animation for reduced motion preference
        this.setAllPathsDrawn(pathData);
        return;
      }

      if (isScrubMode) {
        this.setupScrubMode(svg, pathData);
      } else {
        this.setupTriggerMode(svg, pathData);
      }

    } catch (error) {
      console.error('Line reveal initialization failed:', error);
      this.hideWithGrace();
    }
  }

  /**
   * Fetch and inline external SVG
   * @param {string} url - URL of the SVG file
   * @param {Element} mountEl - Element to mount the SVG into
   * @returns {Promise<SVGElement|null>} - The created SVG element
   */
  async inlineExternalSVG(url, mountEl) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.status}`);
      }

      const svgText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      const svg = doc.querySelector('svg');

      if (!svg) {
        throw new Error('No SVG element found in fetched content');
      }

      // Clone the SVG to avoid issues with moving between documents
      const clonedSvg = svg.cloneNode(true);

      // Add required attributes
      clonedSvg.setAttribute('data-line-reveal', '');
      
      // Add accessibility attributes
      const titleId = 'lineTitle';
      const title = document.createElement('title');
      title.id = titleId;
      title.textContent = 'Animated line drawing';
      clonedSvg.insertBefore(title, clonedSvg.firstChild);
      clonedSvg.setAttribute('aria-labelledby', titleId);
      clonedSvg.setAttribute('role', 'img');

      // Clear placeholder and insert SVG
      mountEl.innerHTML = '';
      mountEl.appendChild(clonedSvg);

      return clonedSvg;

    } catch (error) {
      console.error('SVG inlining failed:', error);
      this.hideWithGrace();
      return null;
    }
  }

  /**
   * Prepare all paths for animation by calculating lengths and setting initial dash properties
   * @param {SVGElement} svg - The SVG element
   * @returns {Array} - Array of path data objects
   */
  prepPaths(svg) {
    const paths = [];
    
    // Find paths in elements with data-draw attribute, fallback to all paths
    let targetPaths = svg.querySelectorAll('[data-draw] path');
    if (targetPaths.length === 0) {
      targetPaths = svg.querySelectorAll('path');
    }

    targetPaths.forEach((path, index) => {
      try {
        const length = path.getTotalLength();
        
        // Set initial dash properties
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.fill = 'none';
        
        // Ensure visible stroke
        if (!path.style.stroke && !path.getAttribute('stroke')) {
          path.style.stroke = 'var(--line-stroke)';
        }

        paths.push({
          element: path,
          length: length,
          index: index
        });

      } catch (error) {
        console.warn(`Failed to process path ${index}:`, error);
      }
    });

    return paths;
  }

  /**
   * Setup trigger mode - animate once when element enters viewport
   * @param {SVGElement} svg - The SVG element
   * @param {Array} pathData - Array of path data objects
   */
  setupTriggerMode(svg, pathData) {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.setupScrollFallback(svg, pathData);
      return;
    }

    // Create threshold array for smooth detection
    const thresholds = [];
    for (let i = 0; i <= 20; i++) {
      thresholds.push(i / 20);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio >= 0.25 && !svg.hasAttribute('data-drawn')) {
          this.animatePathsWithStagger(pathData);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: thresholds,
      rootMargin: '0px'
    });

    observer.observe(svg);
    this.observers.set('trigger', observer);
  }

  /**
   * Setup scrub mode - animation follows scroll progress
   * @param {SVGElement} svg - The SVG element
   * @param {Array} pathData - Array of path data objects
   */
  setupScrubMode(svg, pathData) {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.setupScrollFallback(svg, pathData, true);
      return;
    }

    // Create threshold array for smooth progress tracking
    const thresholds = [];
    for (let i = 0; i <= 100; i++) {
      thresholds.push(i / 100);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Map visible ratio to drawing progress
        // 0.1 visible = 0% drawn, 0.9 visible = 100% drawn
        let progress = Math.max(0, Math.min(1, (entry.intersectionRatio - 0.1) / 0.8));
        
        pathData.forEach(({ element, length }) => {
          const offset = (1 - progress) * length;
          element.style.strokeDashoffset = offset;
        });
      });
    }, {
      threshold: thresholds,
      rootMargin: '0px'
    });

    observer.observe(svg);
    this.observers.set('scrub', observer);
  }

  /**
   * Animate paths with stagger effect (trigger mode)
   * @param {Array} pathData - Array of path data objects
   */
  animatePathsWithStagger(pathData) {
    const staggerDelay = 60; // 60ms between each path

    pathData.forEach(({ element }, index) => {
      setTimeout(() => {
        element.style.strokeDashoffset = '0';
      }, index * staggerDelay);
    });

    // Mark as drawn after all animations complete
    setTimeout(() => {
      const svg = document.querySelector('[data-line-reveal]');
      if (svg) {
        svg.setAttribute('data-drawn', 'true');
      }
    }, pathData.length * staggerDelay + 1200); // 1200ms is the CSS transition duration
  }

  /**
   * Set all paths to fully drawn state (for reduced motion)
   * @param {Array} pathData - Array of path data objects
   */
  setAllPathsDrawn(pathData) {
    pathData.forEach(({ element }) => {
      element.style.strokeDashoffset = '0';
    });

    const svg = document.querySelector('[data-line-reveal]');
    if (svg) {
      svg.setAttribute('data-drawn', 'true');
    }
  }

  /**
   * Fallback for browsers without IntersectionObserver
   * @param {SVGElement} svg - The SVG element
   * @param {Array} pathData - Array of path data objects
   * @param {boolean} isScrub - Whether to use scrub mode
   */
  setupScrollFallback(svg, pathData, isScrub = false) {
    let ticking = false;
    let hasTriggered = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = svg.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const elementHeight = rect.height;
          
          // Calculate how much of the element is visible
          const visibleTop = Math.max(0, viewportHeight - rect.top);
          const visibleBottom = Math.min(elementHeight, visibleTop);
          const visibleRatio = Math.max(0, visibleBottom / elementHeight);

          if (isScrub) {
            // Scrub mode: map scroll position to drawing progress
            const progress = Math.max(0, Math.min(1, (visibleRatio - 0.1) / 0.8));
            pathData.forEach(({ element, length }) => {
              const offset = (1 - progress) * length;
              element.style.strokeDashoffset = offset;
            });
          } else {
            // Trigger mode: animate once when 25% visible
            if (visibleRatio >= 0.25 && !hasTriggered) {
              hasTriggered = true;
              this.animatePathsWithStagger(pathData);
              window.removeEventListener('scroll', handleScroll);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
  }

  /**
   * Hide placeholder gracefully on error
   */
  hideWithGrace() {
    const placeholder = document.getElementById('hero-line');
    if (placeholder) {
      placeholder.style.display = 'none';
    }
  }

  /**
   * Refresh - recompute path lengths (useful after resize)
   */
  refresh() {
    const svg = document.querySelector('[data-line-reveal]');
    if (svg) {
      const pathData = this.prepPaths(svg);
      // Re-setup observers if needed
      this.cleanup();
      const isScrubMode = svg.closest('[data-scrub="true"]') !== null;
      
      if (isScrubMode) {
        this.setupScrubMode(svg, pathData);
      } else {
        this.setupTriggerMode(svg, pathData);
      }
    }
  }

  /**
   * Reset - set paths back to initial state for replay
   */
  reset() {
    const svg = document.querySelector('[data-line-reveal]');
    if (svg) {
      const pathData = this.prepPaths(svg);
      pathData.forEach(({ element, length }) => {
        element.style.strokeDashoffset = length;
      });
      svg.removeAttribute('data-drawn');
    }
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.LineReveal = new LineReveal();
  });
} else {
  window.LineReveal = new LineReveal();
}

// Handle visibility change for cleanup
document.addEventListener('visibilitychange', () => {
  if (document.hidden && window.LineReveal) {
    window.LineReveal.cleanup();
  }
});

// Handle resize for responsive behavior
let resizeTimeout;
window.addEventListener('resize', () => {
  if (window.LineReveal) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      window.LineReveal.refresh();
    }, 250);
  }
});