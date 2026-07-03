# 0004 — Substituir tokens HMAC handmade por `jose` npm

Status: REVERTED (via ADR-0005 para respeitar career-tools ADR-0002 — ver abaixo)
Data: 2026-07-03
Revert commit: 1dfe6c5 (2026-07-03 18:23)

## Contexto

O arquivo `functions/_lib/session.js` (~134 linhas) implementa assinatura HMAC-SHA256 handmade de tokens de sessão, usando Web Crypto API diretamente. Há três padrões:
- **Full session** (7 dias): `signSession()`, `verifySession()`
- **Partial session** (10 min, fluxo Discord→Twitch): `signPartial()`, `verifyPartial()`
- **OAuth state** (CSRF, 10 min): `generateState()`, `stateCookie()` — unsigned

A lógica de sign/verify é duplicada entre session e partial (~18 linhas idênticas). Consumidores: `_middleware.js` (gate de staging), `api/auth/sso.js` (troca token SSO curto por sessão local 7 dias), `api/auth/logout.js`. Deploy no Cloudflare Pages (edge runtime, Web Crypto API disponível).

O operador avalia: trocar essa implementação handmade pela biblioteca padrão `jose` (npm, 6.2.3, MIT, 0 dependências transitivas, 89M downloads/semana), ou manter e refatorar localmente?

## Decisão

Adotar `jose` npm (SignJWT/jwtVerify) para eliminar duplication de código, ganhar semântica JWT padrão (aud/exp claims validação automática), e reduzir carga cognitiva do onboarding de time. Escopo: este repo apenas (criativaria-auth ficará como decisão separada). Piloto: arquivo session.js + 3 consumidores, sucesso = testes verdes + gate de staging funcional. Rollback: revert ao handmade se piloto falhar.

Adoção requer gates de verificação:
1. ✓ Validação de claims (`audience: url.origin` no sso.js para evitar bypass)
2. ✓ Medição de cold-start TTFB post-deploy (aceito se delta <5ms em 24h)
3. ✓ Sequenciamento com ADR-0003 (adoptar ANTES de Phase B de cutover de DNS; teste de estabilidade ≥7 dias antes)
4. ✓ Vulnerability de alg confusion (handmade não vulnerável; jose hardening em key validation)
5. ✓ State tokens unsigned (não afetados; duplicação real = 1×, não 3×)

## Alternativas consideradas

- **Manter handmade tal qual:** Zero dependências novas, código prrovado em produção, mas duplication de 18 linhas entre verifySession/verifyPartial cria drift risk. Carga cognitiva no onboarding (team precisa re-aprender b64url + Web Crypto flow).

- **Refatorar handmade localmente:** Extrair helpers comuns (sign/verify reutilizáveis), reduzir duplication de 3× para 1×, zero dependências externas. Menor atrito de adoção. Defers a padronização (eventually hiring/incident-response leverage perdido vs jose padrão).

- **Biblioteca alternativa menor (e.g., @noble/ciphers):** ~2 KB gzipped, ativo (auditado Lavamoat), mas menor ecossistema + zero JWT nativo (team implementaria JWT semantics on top). Rejeitada em favor de jose (padrão de indústria, Cloudflare-first).

## Consequências

### Positivas
- Duplicação de lógica sign/verify reduzida (verifySession + verifyPartial → única `jwtVerify`)
- Semântica JWT padrão (RFC 7519): alg whitelist, aud/exp validação automática, nomes de claims reconhecíveis
- Onboarding de time: "usamos jose" comunica token strategy claramente; docs são excelentes
- Security hardening em key validation (jose rejeita chaves HMAC vazias, enforce key type asymmetric/symmetric)
- Hiring leverage: JWT é lingua franca; handmade requer onboarding especializado
- Future-proofing: se houver necessidade de JWE, key rotation, ou device binding no futuro, jose já cobre

### Negativas
- +1 dependência npm (7.6 KB gzipped, 0 transitivas). Require npm audit periódico.
- Migração: 3 arquivos (session.js, sso.js, tests se houver) precisam atualização de API
- Adoção imperfeita: state tokens (unsigned) não usam jose (remain handmade); não é monolítico
- Timing de ADR-0003: se Phase B de DNS cutover conflitar com deploy de jose, dois eixos de disruption simultâneos

### Neutras
- Bundle size já medido +17.6 KB; cold-start impact no Cloudflare Pages esperado < 5ms (post-deploy measurement gate)
- Alg confusion: handmade não é vulnerável (hardcoded HMAC em call de crypto.subtle.verify). Jose adiciona defense-in-depth (alg whitelist), não muda risco do handmade.

## Revisitar quando

- **Medição de cold-start pós-deploy mostrar TTFB delta > 10ms** (escalate, reavaliar tree-shaking config)
- **Phase B de ADR-0003 atrasado > 30 dias** (jose adoption ganha maturidade antes; sem bloqueadores novos)
- **novo padrão de token emergir** (e.g., refresh tokens, device binding) que jose não cubra nativamente (raro; jose é completo)
- **jose ter CVE crítica não-patchável** (altamente improvável; maintainer panva é reputação estabelecida; zero transitive deps reduz raio de dano)
- **equipe decidir que zero external deps é constraint absoluto** (reframes a questão; refactor-only fica viável como fallback)

---

## Apêndice — Detalhes técnicos de migração

### Mudanças de API

**Antes (handmade):**
```javascript
const token = await signSession({ sub, platform, name }, secret)
const payload = await verifySession(token, secret) // → { sub, platform, name, exp, ... }
```

**Depois (jose):**
```javascript
const token = await signSession({ sub, platform, name }, secret)
const payload = await verifySession(token, secret) // mesma API
```

Consumidores **não** precisam mudar (API exported shapes são iguais).

### Validação de Claims no sso.js

**Antes:**
```javascript
const payload = await verifyToken(token, env.SSO_SECRET)
if (!payload || payload.aud !== url.origin) {
  return Response.redirect(`${url.origin}/?auth_error=sso_invalid`, 302)
}
```

**Depois (com jose):**
```javascript
try {
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(env.SSO_SECRET),
    { algorithms: ['HS256'], audience: url.origin }  // ← CRITICAL: must include audience option
  )
  // aud validated automatically by jose; if wrong, exception thrown
} catch (err) {
  return Response.redirect(`${url.origin}/?auth_error=sso_invalid`, 302)
}
```

**Gate crítica:** Sem `audience: url.origin`, jose NÃO validaria aud, creating auth bypass. Deve ser testado.

### State tokens (unchanged)

State tokens CSRF permanecem unsigned (gerados por `generateState()`, stored plain em cookie). Não usam jose. Migração é só session + partial.

### Sequência de Adoção

1. `npm install jose`
2. Reescrever session.js com SignJWT/jwtVerify
3. Atualizar sso.js com `audience` option
4. Testes verde
5. Staging funcional (7+ dias de estabilidade antes de Phase B de ADR-0003)
6. Merge PR
7. Monitorar TTFB no Cloudflare Analytics (P95 < +5ms delta)

---

## Apêndice B — Correção de escopo descoberta durante implementação

A pesquisa original (Fase 1-4) assumiu que `verifySession()` era usado só para a sessão local (self-contained neste repo). Na implementação do piloto, achamos que **essa premissa estava errada**: `sso.js` reusava `verifySession` (renomeado `verifyToken` no import) para verificar o token SSO **assinado pelo hub** (`criativaria-auth/src/crypto.js`), com `env.SSO_SECRET`. O hub assina esse token com formato HMAC handmade próprio (`base64url(payload).base64url(sig)`, sem header JWT) — confirmado lendo `criativaria-auth/src/crypto.js:1-2`, que documenta explicitamente "mesmo formato de token usado em todos os staging gates da Criativaria".

Migrar `verifySession` inteiro para `jose.jwtVerify` (que exige JWT de 3 segmentos com header) teria quebrado a verificação de **todo token SSO emitido pelo hub** — lockout total do staging gate, não só deste repo, já que o hub serve múltiplos sites Criativaria. Isso não era um risco cosmético: seria descoberto só no próximo login, não em CI.

**Escopo corrigido implementado:**
- `signSession`/`verifySession` migrados para jose — usados **só** para a sessão local de 7 dias (criada e verificada inteiramente neste repo, `_middleware.js` + `sso.js`).
- Nova função `verifyHubToken` mantém a lógica HMAC handmade original **inalterada**, dedicada a verificar o token SSO recebido do hub. `sso.js` agora importa `verifyHubToken` em vez de `verifySession` para essa verificação.
- Gate #1 original (passar `audience` ao `jwtVerify`) **não se aplica mais** — a verificação do token do hub continua manual (`payload.aud !== url.origin`), fora do jose. Risco de bypass é o mesmo de antes (não piora, não melhora).
- `signPartial`/`verifyPartial`/`partialCookie`/`clearPartialCookie`/`getPartialToken`/`generateState`/`stateCookie`/`clearStateCookie`/`getStateToken` **removidos**: confirmado por grep que nenhum consumidor deste repo os importa (flow AND-gate Discord→Twitch é específico do hub). `session.js` caiu de 144 para 83 linhas.

**Consequência para a decisão original:** a redução de duplicação e a modernização de semântica JWT continuam válidas, mas **restritas à sessão local** — não à interoperabilidade com o hub. Migrar a verificação do token SSO para jose exigiria migrar o hub em lockstep (fora de escopo, decisão separada, ver ADR original "Alternativas consideradas").

Testes adicionados em `functions/_lib/session.test.js`: round-trip da sessão local via jose, rejeição de secret errado/token malformado, e um teste que replica o `sign()` do hub localmente para provar que `verifyHubToken` ainda aceita tokens no formato legado (compat cross-repo).

---

## Apêndice C — Reverted (ADR-0005)

Esta decisão foi revertida via `git revert cedf799` (commit 1dfe6c5, 2026-07-03 18:23 GMT-3).

**Motivo:** A implementação violou a decisão de deferral explícita em career-tools ADR-0002 (decidida o mesmo dia via `/research-and-decide` + `decision-critic`):
1. ADR-0002 nomeou explicitamente os 3 repos (criativaria-auth, career-tools, clt-pj-calculator) e decidiu: **extrair pacote compartilhado de crypto (Candidate 5, AGORA); defer toda migração JWT/jose (Candidates 2-4) até ADR-0003 estável ≥48h**.
2. ADR-0003 (migração de conta CF) não estava estável na época de ADR-0004 — produção ainda na conta antiga, NS não flip ainda (conforme verificado em ADR-0002).
3. O que foi implementado em ADR-0004 (jose na sessão local de 7 dias + handmade na verificação do token SSO de 60s) **não era um dos 6 candidatos avaliados** em ADR-0002 — era um hibrido 6º não explorado.
4. A pesquisa de `/research-and-decide` que produziu ADR-0004 nunca rodou `search_knowledge` cross-repo para verificar ADR-0002 antes de decidir (falha no Phase 1 da workflow de research-decider).

**Consequência:** O revert restaura conformidade com a decisão cross-repo. O pacote compartilhado (Candidate 5, ADR-0002) continua como próxima ação quando infra se estabilizar. Futura avaliação do Candidate 4 (hybrid — jose no SSO boundary, handmade na sessão local) **ou o 6º candidato que foi shipado** deve incluir career-tools em `/research-and-decide` com consulta cross-repo `search_knowledge` garantida antes da fase de critic.

**Referência cruzada:** Ver ADR-0005 neste repo para a decisão de reconciliação completa.
