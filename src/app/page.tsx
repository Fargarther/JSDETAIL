import SingleLineScroll from './components/SingleLineScroll'

export default function Home() {
  return (
    <>
      <SingleLineScroll />
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-4xl">
            <h1 className="text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Single Line Scroll Effect
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Watch as the intricate line drawing reveals itself as you scroll through this page.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Scroll down to see the effect in action
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="min-h-screen flex items-center justify-center px-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl text-center">
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              This effect uses SVG path animation with stroke-dasharray and stroke-dashoffset 
              properties to create a drawing animation that responds to scroll position. 
              As you scroll, the path gradually reveals itself, creating an engaging visual experience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">SVG Path</h3>
                <p className="text-gray-600 dark:text-gray-300">Complex vector path defined in SVG format</p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Scroll Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300">JavaScript monitors scroll position</p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Animation</h3>
                <p className="text-gray-600 dark:text-gray-300">Stroke properties animate the reveal</p>
              </div>
            </div>
          </div>
        </section>

        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-3xl text-center">
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Technical Details
            </h2>
            <div className="text-left space-y-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">React Implementation</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Built with React hooks (useRef, useEffect) to manage SVG element references 
                  and scroll event listeners efficiently.
                </p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Performance Optimized</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Uses passive event listeners and requestAnimationFrame for smooth performance 
                  without blocking the main thread.
                </p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Responsive Design</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  SVG scales appropriately across different screen sizes while maintaining 
                  the drawing effect's precision and smoothness.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="min-h-screen flex items-center justify-center px-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl text-center">
            <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              The Journey Continues
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              As you reach the end of this page, notice how the line drawing has been 
              completed. This creates a satisfying visual narrative that guides users 
              through your content while providing an engaging interactive experience.
            </p>
            <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Scroll back up to see the line disappear and reappear
              </p>
            </div>
          </div>
        </section>

        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-2xl text-center">
            <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Complete
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              The line drawing should now be fully revealed. This technique can be used 
              for logos, illustrations, or any vector-based artwork to create engaging 
              scroll-triggered animations.
            </p>
            <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Try It Yourself
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Experiment with different SVG paths, animation timings, and scroll behaviors 
                to create unique effects for your projects.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}