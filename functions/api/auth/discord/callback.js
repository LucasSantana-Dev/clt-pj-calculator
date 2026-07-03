// Discord OAuth callback: troca o code por token, confirma que a pessoa está
// no Discord da Criativaria e grava a sessão assinada (7 dias).
import {
  signSession,
  sessionCookie,
  getStateToken,
  clearStateCookie,
} from '../../../_lib/session.js'

export async function onRequestGet({ request, env }) {
  const base = env.BASE_URL || new URL(request.url).origin
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const returnedState = url.searchParams.get('state')

  // CSRF state (RFC 6749 §10.12)
  const storedState = getStateToken(request)
  if (!returnedState || !storedState || returnedState !== storedState) {
    return Response.redirect(`${base}/?auth_error=csrf`, 302)
  }
  if (!code) return Response.redirect(`${base}/?auth_error=no_code`, 302)

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${base}/api/auth/discord/callback`,
      }),
    })
    const { access_token } = await tokenRes.json()
    if (!access_token) return Response.redirect(`${base}/?auth_error=token_failed`, 302)

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const user = await userRes.json()

    const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const guilds = await guildsRes.json()
    const isMember = Array.isArray(guilds) && guilds.some((g) => g.id === env.DISCORD_GUILD_ID)
    if (!isMember) return Response.redirect(`${base}/?auth_error=not_member`, 302)

    const session = await signSession(
      { sub: user.id, platform: 'discord', name: user.global_name || user.username },
      env.SESSION_SECRET,
    )
    const headers = new Headers()
    headers.append('Location', `${base}/`)
    headers.append('Set-Cookie', sessionCookie(session))
    headers.append('Set-Cookie', clearStateCookie())
    return new Response(null, { status: 302, headers })
  } catch (err) {
    console.error('Discord callback error:', err)
    return Response.redirect(`${base}/?auth_error=server_error`, 302)
  }
}
