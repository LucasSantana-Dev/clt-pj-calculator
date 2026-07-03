/**
 * Gate de staging: HTTP Basic Auth com senha em STAGING_PASSWORD (secret do
 * projeto no Cloudflare Pages). Sem a secret configurada, o site fica aberto
 * (comportamento de produção futura: basta remover a secret).
 */
export async function onRequest(context) {
  const password = context.env.STAGING_PASSWORD
  if (!password) {
    return context.next()
  }

  const expected = 'Basic ' + btoa(`criativaria:${password}`)
  const got = context.request.headers.get('Authorization') || ''

  if (got === expected) {
    const upstream = await context.next()
    const response = new Response(upstream.body, upstream)
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  return new Response('Ambiente de staging da Criativaria. Acesso restrito.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Staging Criativaria"',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
