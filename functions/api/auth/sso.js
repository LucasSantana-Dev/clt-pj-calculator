// Recebe o token SSO do hub (criativaria-auth), valida assinatura, validade e
// audiência, e troca por uma sessão local de 7 dias.
import { verifyHubToken, signSession, sessionCookie } from '../../_lib/session.js'

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const to = url.searchParams.get('to') || '/'

  const payload = await verifyHubToken(token, env.SSO_SECRET)
  if (!payload || payload.aud !== url.origin) {
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
