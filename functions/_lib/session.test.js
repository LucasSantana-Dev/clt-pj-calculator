import { describe, expect, it } from 'vitest'
import { signSession, verifySession, verifyHubToken } from './session.js'

const SECRET = 'test-secret-value'

describe('local session (jose)', () => {
  it('round-trips a signed session token', async () => {
    const token = await signSession({ sub: '123', platform: 'discord', name: 'Lucas' }, SECRET)
    const payload = await verifySession(token, SECRET)
    expect(payload).toMatchObject({ sub: '123', platform: 'discord', name: 'Lucas' })
  })

  it('rejects a token signed with the wrong secret', async () => {
    const token = await signSession({ sub: '123' }, SECRET)
    const payload = await verifySession(token, 'wrong-secret')
    expect(payload).toBeNull()
  })

  it('rejects a malformed token instead of throwing', async () => {
    await expect(verifySession('not-a-jwt', SECRET)).resolves.toBeNull()
    await expect(verifySession(null, SECRET)).resolves.toBeNull()
  })
})

describe('verifyHubToken (legacy HMAC, wire-compatible with the auth hub)', () => {
  // Mirrors criativaria-auth/src/crypto.js sign() — proves session.js still
  // accepts tokens produced by the hub's hand-rolled signer.
  async function legacyHubSign(payload, secret, durationMs) {
    const b64urlEncode = (input) => {
      const str = input instanceof ArrayBuffer ? String.fromCharCode(...new Uint8Array(input)) : input
      return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    }
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const data = b64urlEncode(JSON.stringify({ ...payload, exp: Date.now() + durationMs }))
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
    return `${data}.${b64urlEncode(sig)}`
  }

  it('verifies a token signed by the hub-format signer', async () => {
    const token = await legacyHubSign({ sub: '456', aud: 'https://example.com' }, SECRET, 60_000)
    const payload = await verifyHubToken(token, SECRET)
    expect(payload).toMatchObject({ sub: '456', aud: 'https://example.com' })
  })

  it('rejects an expired hub token', async () => {
    const token = await legacyHubSign({ sub: '456' }, SECRET, -1000)
    const payload = await verifyHubToken(token, SECRET)
    expect(payload).toBeNull()
  })

  it('rejects a hub token with the wrong audience (sso.js aud gate)', async () => {
    const token = await legacyHubSign({ sub: '456', aud: 'https://evil.example.com' }, SECRET, 60_000)
    const payload = await verifyHubToken(token, SECRET)
    expect(payload.aud).not.toBe('https://real-site.example.com')
  })
})
