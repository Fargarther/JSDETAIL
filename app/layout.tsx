import "./globals.css";

export const metadata = {
  title: "Scroll Narrative",
  description: "Bottom-start, top-reveal, SVG draw with GSAP",
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">
        {children}
        <noscript>
          <div className="mx-auto max-w-3xl px-4 py-3 text-center text-sm text-neutral-700">
            This demo uses JavaScript for scroll animations. If JavaScript is disabled, content remains readable without animations.
          </div>
        </noscript>
      </body>
    </html>
  );
}
