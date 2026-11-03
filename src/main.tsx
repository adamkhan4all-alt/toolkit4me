import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components/ui/ToastProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { removePrerenderedHead } from './lib/seo/prerenderedHead'

// The static <head> tags from scripts/prerender.ts are for non-JS crawlers;
// <SeoHead> re-emits them, so drop the static copies to avoid duplicates.
removePrerenderedHead()

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
