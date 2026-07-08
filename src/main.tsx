import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App'
import './index.css'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN ?? 'https://89bc3bc15ea6a2344b1691c0b6ceff09@o4511700575387648.ingest.us.sentry.io/4511701049409536',
  environment: import.meta.env.MODE === 'production' ? 'production' : 'development',
  tracesSampleRate: 0.1,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
