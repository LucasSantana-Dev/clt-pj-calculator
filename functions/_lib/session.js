// Session token — jose (JWT, HMAC-SHA256) for the local 7-day site session.
//
// SSO handshake tokens from the auth hub (criativaria-auth) use a separate
// legacy HMAC format: base64url(payload).base64url(signature), no JWT header.
// The hub has not migrated to jose — verifyHubToken keeps that wire format.
// Do not change it without migrating the hub in lockstep (see ADR-0004).
import { SignJWT, jwtVerify } from 'jose'

const SESSION_DURATION = '7d'

function sessionKey(secret) {
  return new TextEncoder().encode(secret)
}

export async function signSession(payload, secret) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(sessionKey(secret))
}

export async function verifySession(token, secret) {
  try {
    if (!token) return null
    const { payload } = await jwtVerify(token, sessionKey(secret), { algorithms: ['HS256'] })
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

// ── Legacy HMAC format, shared with the hub's crypto.js ──────────────────────
function b64urlDecode(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'))
}

async function getLegacyKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

// Verifies tokens signed by the hub's hand-rolled sign() — the SSO handshake token.
export async function verifyHubToken(token, secret) {
  try {
    if (!token) return null
    const dot = token.lastIndexOf('.')
    if (dot < 0) return null
    const data = token.slice(0, dot)
    const sig  = token.slice(dot + 1)

    const key = await getLegacyKey(secret)
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
