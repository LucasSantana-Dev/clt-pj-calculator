// Signed session token — HMAC-SHA256 via Web Crypto (Cloudflare Workers)
// Format: base64url(payload).base64url(signature)

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function b64urlString(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function b64urlDecode(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'))
}

async function getKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signSession(payload, secret) {
  const data = b64urlString(JSON.stringify({ ...payload, exp: Date.now() + SESSION_DURATION_MS }))
  const key  = await getKey(secret)
  const sig  = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return `${data}.${b64url(sig)}`
}

export async function verifySession(token, secret) {
  try {
    if (!token) return null
    const dot = token.lastIndexOf('.')
    if (dot < 0) return null
    const data = token.slice(0, dot)
    const sig  = token.slice(dot + 1)
  
    const key = await getKey(secret)
    const sigBytes = Uint8Array.from(b64urlDecode(sig), c => c.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data))
    if (!valid) return null
  
    const payload = JSON.parse(b64urlDecode(data))
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function sessionCookie(token) {
  return `cri_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 3600}`
}

export function clearSessionCookie() {
  return 'cri_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
}

export function getSessionToken(request) {
  const cookie = request.headers.get('Cookie') || ''
  const match = cookie.match(/cri_session=([^;]+)/)
  return match ? match[1] : null
}

