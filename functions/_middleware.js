/**
 * Standard Criativaria staging key gate: password-based auth.
 * Ativo quando STAGING_PASSWORD existe no projeto Pages;
 * sem essa var o site fica aberto (estado de produção).
 */

export async function onRequest(context) {
  const { request, env, next } = context

  // STAGING é o interruptor-mestre: sem STAGING_PASSWORD, site aberto (produção).
  if (!env.STAGING_PASSWORD) return next()

  const url = new URL(request.url)

  // GET /__staging_auth?key= → validate key, set cookie, redirect to root
  if (url.pathname === '/__staging_auth' && request.method === 'GET') {
    const key = url.searchParams.get('key')
    if (key === env.STAGING_PASSWORD) {
      const response = new Response(null, { status: 302, headers: { Location: '/' } })
      response.headers.set(
        'Set-Cookie',
        `cri_staging_auth=${encodeURIComponent(env.STAGING_PASSWORD)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
      )
      return response
    }
    return new Response(authPage('Chave de acesso inválida.'), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  // POST form flow: extract from form body, validate, set cookie
  if (url.pathname === '/__staging_auth' && request.method === 'POST') {
    const contentType = request.headers.get('Content-Type')
    let key = null
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const body = await request.text()
      const params = new URLSearchParams(body)
      key = params.get('key')
    }

    if (key === env.STAGING_PASSWORD) {
      const response = new Response(null, { status: 302, headers: { Location: '/' } })
      response.headers.set(
        'Set-Cookie',
        `cri_staging_auth=${encodeURIComponent(env.STAGING_PASSWORD)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
      )
      return response
    }

    const errorMsg = key ? 'Chave de acesso inválida.' : 'Por favor, insira a chave de acesso.'
    return new Response(authPage(errorMsg), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  // Check cookie for valid session
  const cookies = request.headers.get('Cookie')
  const hasValidAuth = cookies?.includes(`cri_staging_auth=${encodeURIComponent(env.STAGING_PASSWORD)}`)

  if (hasValidAuth) {
    const upstream = await next()
    const response = new Response(upstream.body, upstream)
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  // No valid auth → show password form
  return new Response(authPage(), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    },
  })
}

function authPage(error = '') {
  const errorHtml = error ? `<p class="err">${error}</p>` : ''
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Acesso | Criativaria · Calculadora CLT × PJ</title>
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
    form{display:flex;flex-direction:column;gap:14px}
    input{background:oklch(13% 0.009 20);border:1px solid oklch(25% 0.014 20);
      border-radius:8px;padding:12px;color:inherit;font:inherit;width:100%}
    input:focus{outline:none;border-color:oklch(50% 0.15 260)}
    button{background:oklch(50% 0.15 260);color:#fff;border:none;border-radius:8px;
      padding:13px;font:inherit;font-weight:800;cursor:pointer;transition:opacity 150ms}
    button:hover{opacity:.9}
    button:active{opacity:.8}
  </style>
</head>
<body>
  <div class="card">
    <div>
      <div class="eyebrow">Acesso</div>
      <h1>Criativaria · Calculadora CLT × PJ</h1>
    </div>
    <p class="sub">Este é um ambiente de homologação. Insira a chave de acesso para continuar.</p>
    ${errorHtml}
    <form method="post" action="/__staging_auth">
      <input type="password" name="key" placeholder="Senha de acesso" required autofocus>
      <button type="submit">Acessar</button>
    </form>
  </div>
</body>
</html>`
}
