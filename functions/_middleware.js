/**
 * Gate de staging via Discord, autenticado pelo hub central (criativaria-auth):
 * o site nunca fala com o Discord; manda para AUTH_HUB_URL/login e recebe de
 * volta um token SSO curto que /api/auth/sso troca por sessão local.
 * Interruptor-mestre: secret STAGING. Sem ela, site aberto (produção futura).
 *
 * Observabilidade: Sentry error monitoring via sentryPagesPlugin.
 */
import * as Sentry from '@sentry/cloudflare'
import { verifySession, getSessionToken } from './_lib/session.js'

async function authMiddleware(context) {
  const { request, env, next } = context

  if (!env.STAGING) return next()

  // Staging ligado mas hub ainda não configurado: nunca deixar aberto.
  if (!env.AUTH_HUB_URL || !env.SSO_SECRET || !env.SESSION_SECRET) {
    return new Response('Staging da Criativaria em configuração. Volte em instantes.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' },
    })
  }

  const url = new URL(request.url)

  // rotas do fluxo de sessão sempre passam
  if (url.pathname.startsWith('/api/auth/')) return next()

  const session = await verifySession(getSessionToken(request), env.SESSION_SECRET)
  if (session) {
    const upstream = await next()
    const response = new Response(upstream.body, upstream)
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  const loginUrl = `${env.AUTH_HUB_URL}/login?to=${encodeURIComponent(url.origin + url.pathname)}`
  const authError = url.searchParams.get('auth_error')
  return new Response(loginPage(authError, loginUrl), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    },
  })
}

export const onRequest = [
  Sentry.sentryPagesPlugin((context) => ({
    dsn: context.env.SENTRY_DSN ?? 'https://89bc3bc15ea6a2344b1691c0b6ceff09@o4511700575387648.ingest.us.sentry.io/4511701049409536',
    environment: context.env.ENVIRONMENT ?? 'production',
    tracesSampleRate: 0.1,
  })),
  authMiddleware,
]

const ERROR_MESSAGES = {
  not_member:
    'Sua conta do Discord ainda não está na comunidade da Criativaria. Entre no servidor primeiro e tente de novo.',
  csrf: 'A sessão de login expirou. Tente entrar de novo.',
  sso_invalid: 'O login expirou no caminho de volta. Tente de novo.',
  no_code: 'O Discord não devolveu a autorização. Tente de novo.',
  token_failed: 'Não foi possível confirmar seu login com o Discord. Tente de novo.',
  server_error: 'Algo falhou do nosso lado. Tente de novo em instantes.',
}

function loginPage(authError, loginUrl) {
  const errorHtml = ERROR_MESSAGES[authError]
    ? `<p class="err">${ERROR_MESSAGES[authError]}</p>`
    : ''
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Staging | Calculadora CLT x PJ | Criativaria</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:oklch(5% 0.018 295);font-family:'Nunito',system-ui,sans-serif;
      color:oklch(94% 0.006 90);padding:24px}
    .card{width:100%;max-width:400px;background:oklch(9% 0.012 20);
      border:2px solid oklch(20% 0.014 20);border-radius:14px;
      box-shadow:4px 4px 0 oklch(3% 0.012 295 / 0.75);
      padding:40px 32px;display:flex;flex-direction:column;gap:18px;text-align:center}
    .eyebrow{font-size:11px;letter-spacing:.2em;text-transform:uppercase;
      color:oklch(73% 0.20 350);font-weight:700;font-family:monospace}
    h1{font-size:22px;font-weight:800;line-height:1.25}
    .sub{font-size:14px;color:oklch(66% 0.008 60);line-height:1.6}
    .err{font-size:13px;color:oklch(70% 0.19 25);line-height:1.5;
      background:oklch(70% 0.19 25 / 0.1);border-radius:8px;padding:10px 12px}
    a.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;
      background:#5865F2;color:#fff;border-radius:10px;padding:13px 20px;
      font-size:15px;font-weight:800;text-decoration:none}
    a.btn:hover{opacity:.9}
    svg{flex:none}
  </style>
</head>
<body>
  <div class="card">
    <div>
      <div class="eyebrow">Staging</div>
      <h1>Calculadora CLT x PJ</h1>
    </div>
    <p class="sub">Ambiente de homologação da Criativaria. Entre com a conta do Discord que está na comunidade.</p>
    ${errorHtml}
    <a class="btn" href="${loginUrl}">
      <svg viewBox="0 0 127.14 96.36" width="22" height="17" fill="currentColor" aria-hidden="true"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
      Entrar com Discord
    </a>
  </div>
</body>
</html>`
}
