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
      </body>
    </html>
  );
}