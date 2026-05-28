# CourTier Frontend — Intelligent Court Case Tracker

CourTier is a modern, responsive Progressive Web Application (PWA) designed to track Indian District and High Court cases in real time. Built with React, TypeScript, Tailwind CSS, and Vite, the platform connects directly to the CourTier REST API to scrape status logs, timelines, and schedules from eCourts portals.

---

## 🚀 Key Features

*   **Case Tracking**: Monitor case state, filing logs, and schedules automatically.
*   **Hearing Timelines**: Chronological visualization of historical and upcoming hearing dates.
*   **Live Scraping Polls**: Query direct port scrapers via Captcha checks.
*   **Offline Support & PWA**: Custom installers for iOS/Android Safari & Chrome, service worker caching.
*   **Contrast & Accessibility**: WCAG AA contrast standard compliance, screen-reader helper tags (`aria-label`), keyboard navigability.
*   **SEO Engine**: Dynamic meta tags, OpenGraph cards, structured JSON-LD schemas, automated sitemap.

---

## 🛠 Tech Stack

*   **Core**: React 18 (TypeScript), Vite 5, React Router DOM 6
*   **State Management**: Zustand (Auth, Theme, Toasts)
*   **Animations**: Framer Motion
*   **Iconography**: Lucide React
*   **Styling**: Tailwind CSS & CSS Variables (Dark/Light mode)
*   **Networking**: Axios with exponential network backoff retries and concurrent refresh interceptors

---

## 🔧 Installation & Local Development

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)
*   Running backend instance of the CourTier API at `http://localhost:8080` (or configure via environment variables)

### Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   cd courtier-frontend
   ```

2. Copy the environment variables template and customize it:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. Build for production:
   ```bash
   npm run build
   ```

6. Preview the production build locally:
   ```bash
   npm run preview
   ```

---

## 📁 Directory Structure

```
courtier-frontend/
├── public/                 # Static assets, sitemap, robots, manifest, sw
├── src/
│   ├── api/                # API service wrappers and Axios client instance
│   ├── components/
│   │   ├── case/           # Case cards, details, status components
│   │   ├── layout/         # Protection wrappers, app shell, PWA install banners
│   │   └── ui/             # Reusable design system UI elements (Button, Input, Badge)
│   ├── hooks/              # Custom hooks (e.g. useSeo)
│   ├── lib/                # Shared utilities and helpers
│   ├── pages/              # Code-split lazy views
│   ├── store/              # Zustand global state stores
│   └── types/              # TypeScript types and definitions
```

---

## ♿ Accessibility & Standards

The application is structured to meet **WCAG 2.1 AA** requirements:
*   **Keyboard Friendly**: Focus states are visible across all interactive components. Dialog modals trap focus.
*   **Contrast Ratios**: Body text meets a minimum contrast ratio of **4.5:1** on both light and dark backdrops.
*   **Screen Readers**: Non-text elements utilize `aria-label` or `aria-hidden` attributes.
