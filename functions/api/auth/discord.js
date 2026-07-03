// Redirect to Discord OAuth
import { generateState, stateCookie } from '../../_lib/session.js'

export async function onRequestGet({ request, env }) {
  const base  = env.BASE_URL || new URL(request.url).origin
  const state = generateState()
  const params = new URLSearchParams({
    client_id:     env.DISCORD_CLIENT_ID,
    redirect_uri:  `${base}/api/auth/discord/callback`,
    response_type: 'code',
    scope:         'identify guilds',
    state,
  })
  return new Response(null, {
    status: 302,
    headers: {
      Location:    `https://discord.com/oauth2/authorize?${params}`,
      'Set-Cookie': stateCookie(state),
    },
  })
}
