import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components/ui/ToastProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { removePrerenderedHead } from './lib/seo/prerenderedHead'
import { initAnalytics } from './lib/analytics'

// The static <head> tags from scripts/prerender.ts are for non-JS crawlers;
// <SeoHead> re-emits them, so drop the static copies to avoid duplicates.
removePrerenderedHead()

// Google Analytics: does nothing without VITE_GA_MEASUREMENT_ID, and loads only after the consent message allows it.
initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
