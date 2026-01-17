# Phase 2: File-by-File Audit

## App Router Files

### `app/layout.tsx`
- **Purpose**: Root layout for the application, including global styles, metadata, and providers.
- **Dependencies**: 
  - Internal: `globals.css`, `SmoothScrollProvider`, `Header`, `Footer`
  - External: `next/font`, `next-themes`
- **Platform-Specific Quirks**: None
- **Performance Bottlenecks**: None
- **Error Prone Areas**: None

### `app/page.tsx`
- **Purpose**: Homepage with hero section, statistics, categories, and features.
- **Dependencies**: 
  - Internal: `ScrollFrameAnimation`, `StatsBar`, `CategoryCard`, `ProductHeroCard`
  - External: `next/image`, `next/link`
- **Platform-Specific Quirks**: None
- **Performance Bottlenecks**: Large number of animation frames (118 WebP frames)
- **Error Prone Areas**: Animation timing and synchronization

### `app/products/page.tsx`
- **Purpose**: Product catalog page displaying categories and subcategories.
- **Dependencies**: 
  - Internal: `ProductsPageContent`, `categories` data
  - External: `next/image`, `next/link`
- **Platform-Specific Quirks**: None
- **Performance Bottlenecks**: None
- **Error Prone Areas**: None

## Components

### `components/ScrollFrameAnimation.tsx`
- **Purpose**: Handles the 118-frame scroll animation for the homepage.
- **Dependencies**: 
  - Internal: `gsap/client`
  - External: `gsap`, `react`, `next/image`
- **Platform-Specific Quirks**: None
- **Performance Bottlenecks**: Memory usage due to 118 WebP frames
- **Error Prone Areas**: Frame loading and synchronization

### `components/Header.tsx`
- **Purpose**: Main navigation header with mega menu.
- **Dependencies**: 
  - Internal: `LiquidGlassSwitcher`, `Login`
  - External: `next/link`, `lucide-react`
- **Platform-Specific Quirks**: None
- **Performance Bottlenecks**: None
- **Error Prone Areas**: None

### `components/Footer.tsx`
- **Purpose**: Site footer with links and information.
- **Dependencies**: 
  - Internal: None
  - External: `next/link`, `lucide-react`
- **Platform-Specific Quirks**: None
- **Performance Bottlenecks**: None
- **Error Prone Areas**: None

### `components/Chatbot.tsx`
- **Purpose**: AI chatbot interface for user assistance.
- **Dependencies**: 
  - Internal: None
  - External: `lucide-react`
- **Platform-Specific Quirks**: None
- **Performance Bottlenecks**: None
- **Error Prone Areas**: None

### `components/SmoothScrollProvider.tsx`
- **Purpose**: Provides smooth scrolling functionality using GSAP.
- **Dependencies**: 
  - Internal: `gsap/client`
  - External: `gsap`, `react`
- **Platform-Specific Quirks**: None
- **Performance Bottlenecks**: Scroll performance on low-end devices
- **Error Prone Areas**: Scroll event handling

## Data Files

### `data/categories.ts`
- **Purpose**: Contains the product catalog data with categories and subcategories.
- **Dependencies**: None
- **Platform-Specific Quirks**: None
- **Performance Bottlenecks**: None
- **Error Prone Areas**: Data consistency and accuracy

### `data/types.ts`
- **Purpose**: TypeScript type definitions for the application.
- **Dependencies**: None
- **Platform-Specific Quirks**: None
- **Performance Bottlenecks**: None
- **Error Prone Areas**: None

## GSAP Files

### `lib/gsap/client.ts`
- **Purpose**: GSAP configuration and setup.
- **Dependencies**: 
  - Internal: `gsap/presets`
  - External: `gsap`
- **Platform-Specific Quirks**: None
- **Performance Bottlenecks**: None
- **Error Prone Areas**: Plugin registration and configuration

### `lib/gsap/presets.ts`
- **Purpose**: GSAP animation presets and constants.
- **Dependencies**: None
- **Platform-Specific Quirks**: None
- **Performance Bottlenecks**: None
- **Error Prone Areas**: None
