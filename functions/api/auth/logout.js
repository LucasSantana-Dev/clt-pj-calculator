import { clearSessionCookie } from '../../_lib/session.js'

export async function onRequestGet({ request, env }) {
  const base = env.BASE_URL || new URL(request.url).origin
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${base}/`,
      'Set-Cookie': clearSessionCookie(),
    },
  })
}
