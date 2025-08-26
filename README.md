# Next.js SVG Line Animation

A Next.js implementation of draw-on-scroll SVG line animation inspired by [this tutorial](https://www.youtube.com/watch?v=7DiKBDC7cz8).

## Features

- 🎨 **SVG Line Drawing Animation**: Smooth stroke-dash animation that draws as you scroll
- 🔄 **Dual Animation Modes**: Trigger mode (draw once) and Scrub mode (follows scroll)
- ♿ **Accessible**: Respects `prefers-reduced-motion` and includes proper ARIA labels  
- 📱 **Responsive**: Works across all device sizes
- ⚡ **Performance**: Uses IntersectionObserver with requestAnimationFrame fallback
- 🎯 **Next.js Optimized**: Server-side rendering ready with React hooks

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the animation.

### 3. Build for Production
```bash
npm run build
npm start
```

## Usage

### Basic Usage
The `LineReveal` component will automatically animate when scrolled into view:

```jsx
import LineReveal from '../components/LineReveal'

export default function MyPage() {
  return (
    <div>
      <LineReveal />
    </div>
  )
}
```

### Scrub Mode
Enable scrub mode where the drawing progress follows scroll position:

```jsx
<LineReveal scrubMode={true} />
```

## Customization

### CSS Variables
Modify the line appearance in `styles/globals.css`:

```css
:root {
  --line-stroke: #333;      /* Line color */
  --line-width: 3;          /* Stroke width */
  --line-opacity: 0.8;      /* Overall opacity */
}
```

### Animation Timing
Adjust stagger delay in `components/LineReveal.js`:

```javascript
const staggerDelay = 60 // milliseconds between each path
```

## File Structure

```
├── components/
│   └── LineReveal.js          # Main animation component
├── pages/
│   ├── _app.js               # Global app wrapper
│   └── index.js              # Home page
├── public/
│   └── Single_line_design.svg # Your SVG file
├── styles/
│   ├── globals.css           # Global styles
│   ├── Home.module.css       # Home page styles
│   └── LineReveal.module.css # Component styles
├── package.json
└── next.config.js
```

## Browser Support

- ✅ Chrome, Firefox, Safari (latest)
- ✅ IntersectionObserver with scroll fallback
- ✅ Reduced motion accessibility support

## Contributing

Feel free to open issues and pull requests for improvements!