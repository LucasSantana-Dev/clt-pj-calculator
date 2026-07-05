// Recebe o token SSO do hub (criativaria-auth), valida assinatura, validade e
// audiência, e troca por uma sessão local de 7 dias.
import { verifySession as verifyToken, signSession, sessionCookie } from '../../_lib/session.js'
import { verifySsoToken } from '@criativaria-projects/auth-crypto'

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const to = url.searchParams.get('to') || '/'

  // Dual-accept (criativaria-auth ADR 0003): prefer the per-origin derived-key
  // token (audience bound into the signing key), fall back to the legacy
  // raw-secret token + explicit aud check while the hub still signs the old way.
  let payload = await verifySsoToken(token, env.SSO_SECRET, url.origin)
  if (!payload) {
    const legacy = await verifyToken(token, env.SSO_SECRET)
    if (legacy && legacy.aud === url.origin) payload = legacy
  }
  if (!payload) {
    return Response.redirect(`${url.origin}/?auth_error=sso_invalid`, 302)
  }

  const session = await signSession(
    { sub: payload.sub, platform: 'discord', name: payload.name },
    env.SESSION_SECRET,
  )
  const safePath = to.startsWith('/') ? to : '/'
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.origin}${safePath}`,
      'Set-Cookie': sessionCookie(session),
    },
  })
}
