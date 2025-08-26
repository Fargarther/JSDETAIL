import Head from 'next/head'
import { useEffect } from 'react'
import LineReveal from '../components/LineReveal'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>Draw-on-Scroll SVG Line Animation</title>
        <meta name="description" content="Next.js SVG line drawing animation on scroll" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>SVG Line Animation Demo</h1>
        </header>
        
        <section className={styles.hero}>
          <LineReveal />
        </section>
        
        <section className={styles.content}>
          <div className="reveal-top">
            <h2>Scroll to see the line animation</h2>
            <p>This demonstration shows how SVG paths can be animated as you scroll down the page.</p>
            <p>The animation uses the stroke-dasharray and stroke-dashoffset technique to create a drawing effect.</p>
            <p>Keep scrolling to see more content...</p>
          </div>
          
          <div className={`${styles.spacer} reveal-top`}>
            <h3>More content here</h3>
          </div>
          
          <div className={`${styles.spacer2} reveal-top`}>
            <h3>Even more content</h3>
          </div>
          
          <div className={`${styles.finalSection} reveal-top`}>
            <h3>Final section</h3>
          </div>
        </section>
      </div>
    </>
  )
}