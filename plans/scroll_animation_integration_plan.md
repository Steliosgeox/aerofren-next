# Scroll Animation Integration Plan

## Overview
This plan outlines the integration of a scroll-driven animation feature into the Aerofren Next front page. The animation will showcase a grid of images that animate dynamically as the user scrolls, creating an engaging visual experience.

## Analysis

### Provided Files
1. **CSS**: Defines the grid layout, animations, and responsive design for the scroll animation.
2. **JavaScript**: Implements the scroll-driven animations using the Motion library.
3. **HTML**: Provides the structure for the scroll animation section.

### Current Front Page Structure
The front page (`aerofren-next/src/app/page.tsx`) is structured into the following sections:
- **Hero Section**: Premium welcome animation with parallax background.
- **Stats Section**: Displays key statistics with animations.
- **Horizontal Gallery**: GSAP-driven scroll gallery.
- **Why Section**: Pinned feature reveal.
- **Contact Section**: Scale entrance animation.

### Dependencies
- **Motion Library**: Required for scroll-driven animations. It will be loaded from a CDN.
- **Images**: Placeholder images are used in the provided HTML. These will need to be replaced with relevant images from the Aerofren Next project.

## Integration Plan

### Step 1: Add Motion Library Dependency
- **Action**: Add the Motion library to the project.
- **Implementation**: Include the Motion library via CDN in the project's HTML template or as a script tag in the relevant component.
- **File**: `aerofren-next/src/app/layout.tsx` or `aerofren-next/src/app/page.tsx`.

### Step 2: Create Scroll Animation Component
- **Action**: Create a new component for the scroll animation.
- **Implementation**: Develop a React component that encapsulates the scroll animation logic and markup.
- **File**: `aerofren-next/src/components/ScrollAnimation.tsx`.

### Step 3: Integrate CSS
- **Action**: Add the provided CSS to the project.
- **Implementation**: Include the CSS in the global stylesheet or as a module in the scroll animation component.
- **File**: `aerofren-next/src/app/globals.css` or `aerofren-next/src/components/ScrollAnimation.module.css`.

### Step 4: Integrate JavaScript
- **Action**: Add the provided JavaScript to the scroll animation component.
- **Implementation**: Include the JavaScript logic in the scroll animation component, ensuring it initializes when the component mounts.
- **File**: `aerofren-next/src/components/ScrollAnimation.tsx`.

### Step 5: Update Front Page
- **Action**: Add the scroll animation component to the front page.
- **Implementation**: Import and place the scroll animation component in the appropriate section of the front page.
- **File**: `aerofren-next/src/app/page.tsx`.

### Step 6: Replace Placeholder Images
- **Action**: Replace placeholder images with relevant images from the Aerofren Next project.
- **Implementation**: Update the image sources in the scroll animation component to use images from the project's assets.
- **File**: `aerofren-next/src/components/ScrollAnimation.tsx`.

### Step 7: Test and Debug
- **Action**: Test the scroll animation feature and debug any issues.
- **Implementation**: Run the project locally and test the scroll animation on different devices and browsers. Debug any issues that arise.
- **File**: N/A (Testing and debugging process).

## Detailed Steps

### Step 1: Add Motion Library Dependency
1. Open the project's layout file or the front page file.
2. Add the Motion library script tag to the head or body of the HTML template.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/motion@11.11.16/+esm"></script>
```

### Step 2: Create Scroll Animation Component
1. Create a new file for the scroll animation component.
2. Define the component structure and include the provided HTML markup.
3. Ensure the component is exported for use in other parts of the project.

```tsx
// aerofren-next/src/components/ScrollAnimation.tsx
import React, { useEffect } from 'react';

export default function ScrollAnimation() {
  useEffect(() => {
    // Initialize scroll animations here
  }, []);

  return (
    <div className="content-wrap">
      <header>
        <h1 className="fluid">let's<br />scroll.</h1>
        <h2 className="fluid">Origionally from 
          <a href="https://codepen.io/jh3y/pen/VYZwOwd" target="_blank">Jhey →</a>, converted to Motion
        </h2>
      </header>
      <main>
        <section>
          <div className="content">
            <div className="grid">
              {/* Layer 1: Outer edges (6 images) */}
              <div className="layer">
                <div>
                  <img src="https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fGZhc2hpb258ZW58MHx8MHx8fDA%3D" alt="" />
                </div>
                {/* Add more images as needed */}
              </div>
              {/* Add more layers as needed */}
              {/* Center scaler image */}
              <div className="scaler">
                <img src="https://assets.codepen.io/605876/model-shades.jpg?format=auto&quality=100" alt="" />
              </div>
            </div>
          </div>
        </section>
        <section>
          <h2 className="fluid">fin.</h2>
        </section>
      </main>
    </div>
  );
}
```

### Step 3: Integrate CSS
1. Open the global stylesheet or create a new CSS module for the scroll animation component.
2. Add the provided CSS to the stylesheet.

```css
/* Step 1: Basic Grid Setup - No animations yet */

*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  --gutter: 2rem;
}

@media (max-width: 600px) {
  :root {
    --gutter: 1rem;
  }
}

body {
  margin: 0;
  font-family: 'SF Pro Text', 'SF Pro Icons', 'Helvetica Neue', Helvetica, Arial, sans-serif, system-ui;
  background: #000;
  color: #fff;
}

.content-wrap {
  background: #000;
  overflow: clip;
}

/* Header */
header {
  min-height: 100vh;
  display: grid;
  align-content: center;
  max-width: calc(100% - (2 * var(--gutter)));
  padding-left: 48px;
  text-align: left;
}

/* Add more CSS as needed */
```

### Step 4: Integrate JavaScript
1. Open the scroll animation component file.
2. Add the provided JavaScript logic to the `useEffect` hook.

```tsx
useEffect(() => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Skip animations if user prefers reduced motion
    console.log('Reduced motion preference detected - skipping animations');
    return;
  }

  const image = document.querySelector('.scaler img') as HTMLImageElement;
  const firstSection = document.querySelector('main section:first-of-type') as HTMLElement;
  const layers = document.querySelectorAll('.grid > .layer');

  // Exit early if elements don't exist
  if (!image || !firstSection) {
    console.warn('Required elements not found - skipping animations');
    return;
  }

  // Measure the natural size before animating
  const naturalWidth = image.offsetWidth;
  const naturalHeight = image.offsetHeight;

  // Get viewport dimensions in pixels
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Animate image on scroll - shrink from full screen to natural size
  scroll(
    animate(image, {
      width: [viewportWidth, naturalWidth],
      height: [viewportHeight, naturalHeight]
    }, {
      width: { easing: cubicBezier(0.65, 0, 0.35, 1) },
      height: { easing: cubicBezier(0.42, 0, 0.58, 1) }
    }),
    {
      target: firstSection,
      offset: ['start start', '80% end end']
    }
  );

  // Animate each layer with staggered timing
  const scaleEasings = [
    cubicBezier(0.42, 0, 0.58, 1),
    cubicBezier(0.76, 0, 0.24, 1),
    cubicBezier(0.87, 0, 0.13, 1)
  ];

  layers.forEach((layer, index) => {
    const endOffset = `${1 - (index * 0.05)} end`;

    // fade: opacity stays 0 until 55% of scroll progress, then fades to 1
    scroll(
      animate(layer, {
        opacity: [0, 0, 1]
      }, {
        offset: [0, 0.55, 1],
        easing: cubicBezier(0.61, 1, 0.88, 1)
      }),
      {
        target: firstSection,
        offset: ['start start', endOffset]
      }
    );

    // reveal: scale stays 0 until 30% of scroll progress, then scales to 1
    scroll(
      animate(layer, {
        scale: [0, 0, 1]
      }, {
        offset: [0, 0.3, 1],
        easing: scaleEasings[index]
      }),
      {
        target: firstSection,
        offset: ['start start', endOffset]
      }
    );
  });
}, []);
```

### Step 5: Update Front Page
1. Open the front page file.
2. Import the scroll animation component.
3. Place the scroll animation component in the desired section of the front page.

```tsx
// aerofren-next/src/app/page.tsx
import ScrollAnimation from '@/components/ScrollAnimation';

// Add the ScrollAnimation component to the desired section
<ScrollAnimation />
```

### Step 6: Replace Placeholder Images
1. Open the scroll animation component file.
2. Replace the placeholder image sources with relevant images from the Aerofren Next project.

```tsx
// Example of replacing an image source
<img src="/images/aerofren-product-1.jpg" alt="Aerofren Product 1" />
```

### Step 7: Test and Debug
1. Run the project locally using the development server.
2. Navigate to the front page and test the scroll animation feature.
3. Debug any issues that arise, such as console errors or unexpected behavior.

## Conclusion
This plan provides a clear and actionable roadmap for integrating the scroll animation feature into the Aerofren Next front page. By following these steps, the scroll animation will be seamlessly integrated, enhancing the user experience and showcasing the project's visual appeal.