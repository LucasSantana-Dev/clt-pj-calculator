// GA4 event helpers. Thin, typed wrapper over the global `gtag` injected by
// the ga4 script. Everything no-ops when gtag is absent or GA ID is unset,
// so calling these is always safe. Param whitelist enforces privacy trust boundary:
// salary inputs/regime values are not sendable by construction.

type GtagParams = Readonly<Record<string, string | number | boolean | undefined>>

/** Allowed parameter keys for GA4 events. */
const PARAM_WHITELIST = new Set(['tool', 'tier', 'reason', 'link_url', 'page_path'])

/** Maximum allowed length for string parameter values. */
const MAX_PARAM_LENGTH = 50

function getGtag(): ((...args: unknown[]) => void) | null {
  if (typeof window === 'undefined') return null
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  return typeof gtag === 'function' ? gtag : null
}

/**
 * Inject GA4 gtag script from VITE_GA_ID environment variable.
 * No-ops if VITE_GA_ID is unset or gtag script fails to load.
 */
export function initGa(): void {
  const gaId = import.meta.env.VITE_GA_ID
  if (!gaId) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  document.head.appendChild(script)

  const w = window as unknown as {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
  w.dataLayer = w.dataLayer || []
  function gtag(..._args: unknown[]) {
    // Official snippet semantics: gtag.js expects the Arguments object itself
    // (a plain array is ignored by its queue consumer).
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments)
  }
  w.gtag = gtag
  gtag('js', new Date())
  gtag('config', gaId)
}

/**
 * Filter and constrain parameter values for privacy.
 * - Drops params not in whitelist.
 * - Drops non-string values entirely (numbers like salaries are unsendable).
 * - Truncates strings to MAX_PARAM_LENGTH.
 */
function filterParams(params: GtagParams): GtagParams {
  const filtered: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    if (!PARAM_WHITELIST.has(key)) continue
    if (typeof value !== 'string') continue
    filtered[key] = value.slice(0, MAX_PARAM_LENGTH)
  }
  return filtered
}

/**
 * Send a GA4 event. `transport_type: "beacon"` ensures the hit still flushes if
 * the click triggers a navigation/unload. Silently no-ops without gtag.
 * Parameters are filtered against a whitelist to protect privacy.
 */
export function trackEvent(name: string, params: GtagParams = {}): void {
  const gtag = getGtag()
  if (!gtag) return
  const filtered = filterParams(params)
  gtag('event', name, { ...filtered, transport_type: 'beacon' })
}
