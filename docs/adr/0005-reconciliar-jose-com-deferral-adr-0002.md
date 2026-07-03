# 0005 — Reconciliar adoção de `jose` com deferral de career-tools ADR-0002

Status: aceito
Data: 2026-07-03 (noite; revisão de ADR-0004 reverter + decisão-crítica)

## Contexto

Em 2026-07-03, duas decisões foram tomadas **o mesmo dia** em dois repos diferentes via `/research-and-decide` + adversarial `decision-critic`:

1. **clt-pj-calculator ADR-0004** (manhã): Adotar `jose` npm para tokens de sessão local de 7 dias (`signSession`/`verifySession`), mantendo `verifyHubToken` no formato handmade HMAC para compatibilidade com o hub. Implementado, testado, merged (`cedf799`), deployed em staging — **sem verificar outros repos**.

2. **career-tools ADR-0002** (também 2026-07-03, via `/research-and-decide`): Extrair crypto handmade compartilhada em pacote npm (Candidate 5, AGORA, zero mudança de formato). **Defer toda migração jose/JWT** (Candidates 2-4) — revisit quando ADR-0003 (migração CF) estável ≥48h. Naquela sessão, verificou diretamente via CF API + DNS que ADR-0003 NÃO estava estável.

**O problema:** ADR-0004 viola a decisão de deferral de ADR-0002 porque:
- ADR-0002 nomeou explicitamente os 3 repos (criativaria-auth, career-tools, **clt-pj-calculator**) como silently divergindo no mesmo código handmade.
- ADR-0002 decidiu: "defer toda migração jose até ADR-0003 estável ≥48h" — uma guarda explícita.
- ADR-0004 despachou no mesmo dia sem rodar `search_knowledge` cross-repo; portanto nunca viu a guarda.
- ADR-0003 ainda não está estável em nenhum dos dois repos (produção na conta CF antiga, NS não flip).
- O que foi shipado (jose na sessão local 7d + handmade na verificação SSO 60s) **não era um dos 6 candidatos avaliados em ADR-0002** — era um 6º híbrido inédito.

**Descoberta:** Durante `/knowledge-loop` captura de ADR-0004, `search_knowledge` surfaced ADR-0002. O revert foi necessário para respeitar a decisão cross-repo e restaurar durabilidade das ADRs.

## Decisão

Revert de commit cedf799 via `git revert cedf799` (novo commit 1dfe6c5). O repo volta ao estado pré-jose (handmade signSession/verifySession), totalmente alinhado com career-tools ADR-0002.

### Sequência de ação:

1. ✓ Revert commit criado (1dfe6c5)
2. ✓ Restaurar ADR-0004 com status "REVERTED"
3. ✓ Escrever ADR-0005 (este arquivo)
4. ✓ Staging gate (handmade tokens) testado e funcional
5. Commit updates de ADR-0004 + ADR-0005 + restaurar session.test.js se necessário
6. Push para main → CI green → auto-deploy Cloudflare Pages

### Próximas etapas (após ADR-0003 estável ≥48h):

Uma das seguintes (revisit when gate dispara):

- **Option A (recomendado):** Implementar ADR-0002 Candidate 5 (pacote compartilhado de crypto zero-format-change, 3 repos) — essa era a decisão aceitada.
- **Option B:** Revisitar Candidate 4 (hybrid — jose só no boundary SSO 60s, sessão local handmade) com ADR-0002 atualizado e com cross-repo `/research-and-decide` que consulte career-tools e criativaria-auth.
- **Option C:** Explorar o 6º candidato (jose na sessão 7d, handmade na SSO 60s) que foi informalmente shipado em ADR-0004 — mas **only se** career-tools concordar e o cross-repo ADR for atualizado em ambos os repos.

## Alternativas consideradas

- **Manter ADR-0004 e escrever ADR-0005 supersedendo ADR-0002 para este repo só:** Rejeitada porque:
  - ADR-0002 foi uma decisão adversarially-reviewed (`decision-critic`) que nomeou este repo explicitamente.
  - Unilateralmente supersedendo uma ADR cross-repo, sem atualizar career-tools, cria "orphaned contradictions" — um operador futuro lendo career-tools ADR-0002 não verá que clt-pj-calculator divergiu.
  - Decision-critic (fase 2 desta reconciliação) flagged que "split token verification strategies across 2 repos = scope expansion, not reduction" — o argumento de escopo narrow não era defensável.
  - **durability principle:** Decisões devem ser entendidas 6 meses depois sem caçar entre repos.

- **Manter ADR-0004 e passar straight pro Candidate 5 (shared package):** Rejeitada porque:
  - Candidate 5 requer que **todos 3 repos** (criativaria-auth, career-tools, clt-pj-calculator) aceitem zero-format-change.
  - clt-pj-calculator já migrou para jose (formato mudou); Candidate 5 não seria zero-change mais.
  - Seria necessário reverter antes de implementar Candidate 5 corretamente.
  - Logo, revert é prerequisito lógico para Candidate 5.

- **Revert + restart com cross-repo coordination:** Aceito (essa é a decisão).

## Consequências

### Positivas
- **Durabilidade de ADRs:** As duas decisões (ADR-0002 career-tools, ADR-0005 clt-pj-calculator) agora se alinham; um operador futuro lendo ambas entenderá o estado.
- **Zero divergência momentânea:** Todos 3 repos (criativaria-auth, career-tools, clt-pj-calculator) de volta ao mesmo estado (handmade HMAC).
- **Gate clara:** ADR-0003 estável ≥48h é o sinal explícito para revisitar candidatos de jose.
- **Lições capturadas:** O processo falho (skip cross-repo check) é documentado; futuros `/research-and-decide` sobre topics cross-repo **DEVEM** rodar `search_knowledge` antes da fase critic (ver "revisitar quando").

### Negativas
- **Trabalho descartado:** A implementação de ADR-0004 (jose em session.js, testes, updates em sso.js) foi revertida — parte del trabalho da manhã se perdeu.
- **Timing:** Se ADR-0003 não se estabilizar rápido (>14 dias), o revert pode parecer premature; porém, o deferral was explicit e non-negotiable.

### Neutras
- **Nenhum user-facing impact:** Staging gate usa sessões handmade, que funcionam identicamente — o revert não muda comportamento externo.
- **jose package.json:** Deixada instalada (pode ser útil para futuro Candidate 4 ou 5); não cria overhead.

## Revisitar quando

1. **ADR-0003 (migração CF) confirmada estável — todos os custom domains retornando 200 — por ≥48h contínuas.** Então:
   - Convocar `/research-and-decide` cross-repo (criativaria-auth + career-tools + clt-pj-calculator).
   - Opções: Candidate 5 (shared package), Candidate 4 (hybrid jose-at-SSO), ou 6º candidato (hybrid inverso jose-at-local-session).
   - **MANDATORY:** research-decider DEVE rodar `search_knowledge` via `/adt-rag` ou `search_knowledge` função antes da fase critic — gaps no Phase 1 não são permitidos em decisões cross-repo.

2. **Um novo padrão de token ou requisito de compliance emerge** (e.g., refresh tokens, audit logging via JWT claims, compliance require standard JWT format) — caso em que Candidate 2 ou 5 fica mais atrativo.

3. **jose tiver CVE crítica não-patchável** — caso raro, maintainer panva tem boa reputação.

## Referências

- **career-tools ADR-0002:** `career-tools/docs/adr/0002-shared-auth-crypto-package-defer-jwt-migration.md` — a decisão que ADR-0004 violou; ADR-0005 restaura conformidade.
- **clt-pj-calculator ADR-0004:** Reverted via `git revert cedf799` (commit 1dfe6c5); status updated to "REVERTED"; apêndice C explica.
- **clt-pj-calculator ADR-0003:** Cloudflare account migration — gate crítica para revisitar candidates de jose.
- **criativaria-auth crypto.js:** `criativaria-auth/src/crypto.js` — handmade HMAC signer do hub; permanece inalterado.
- **Memory:** `project_jose-migration-conflicts-adr-0002.md` (project memory clt-pj-calculator) — incident writeup da discovery.
- **Handoff:** `~/.claude/handoffs/clt-pj-calculator/latest.md` — contexto pré-reversão, lists as 3 opções.
- **Decision artifact:** `/private/tmp/.../decision_artifact_jose_choice.md` — artifact que foi submetido à `decision-critic` (Opus); crítica alertou para orphaned contradictions em Option 2.

---

## Apêndice — Justificativa de Process Correction

Este repo incorretamente despachou uma decisão cross-repo (`jose adoption for session tokens`) sem verificar outras decisões relacionadas no mesmo namespace (Criativaria org). O resultado foi uma contradição de mesmo-dia: ADR-0002 disse "DEFER", ADR-0004 disse "GO".

**Root cause:** `/research-and-decide` agente (este repo, sesison-scoped) nunca rodou `search_knowledge` **cross-repo** before the critic phase. A verificação de "prior ADRs" foi limitada a este repo.

**Correção de processo:** Futuras `/research-and-decide` sobre topics que cruzam múltiplos repos Criativaria (auth, crypto, shared packages) **DEVEM**:
1. Na Phase 1 (Research), rodar `search_knowledge` com `scope_repos=['all']` (ou queriar a knowledge-brain vault) **antes** do critic phase.
2. Surfaçar any conflicting decisions na Artifact submetida ao decision-critic.
3. Se conflito encontrado, incluir na prompt ao critic: "Resolve conflict with [named ADR]; explain why proceeding despite [standing decision]."
4. Documentar a colisão + resolução em ADR-NNNN "Revisit when" (como aqui).

A `adt-rag` skill e `search_knowledge` MCP tool existem para isso; devem ser invoked pro-actively por `/research-and-decide` quando a questão é potencialmente org-scoped.

Adicionalmente: o `.claude/` desta sessão via `decision-critic` corretamente identificou o problema ("orphaned contradictions"); confianza em critic-review foi validada. A falha foi skipping a critic phase até após shipar ADR-0004.
