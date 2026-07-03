# 0003 — Migrar a infraestrutura Cloudflare para a conta da Criativaria

Status: aceito; execução bloqueada por acesso (convite pendente na conta criativaria.contato@gmail.com)
Data: 2026-07-03

## Contexto

Toda a infraestrutura Criativaria no Cloudflare (zona criativaria.com `029f94b1051b3e2dc0d64dab1912a460`, Pages criativaria-web/-staging/criativaria-clt-pj/criativaria-linkedin, Workers criativaria-auth e admin panel com D1) vive hoje na conta pessoal do operador (`Lucas.diassantana@gmail.com's Account`, `712118840109d834d5e99925fd172432`). O operador decidiu em 2026-07-03 que o lar definitivo é a conta da organização (login criativaria.contato@gmail.com), separando patrimônio da comunidade de conta pessoal.

## Decisão

Migração completa em três fases, staging primeiro:

- **Fase A (sem impacto em produção)**: recriar criativaria-clt-pj e criativaria-auth na conta contato; trocar org secrets `CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_API_TOKEN`; hub roda no workers.dev da contato até a zona migrar; novo redirect URI no app do Discord (última vez, o hub absorve os próximos).
- **Fase B (janela de cutover de produção)**: exportar DNS via API, adicionar a zona na contato, importar registros, recriar criativaria-web/-staging + admin panel (exportar/importar D1) + linkedin-analyzer (KV), pré-carregar secrets, anexar custom domains, trocar nameservers no registrador. Rollback: voltar NS.
- **Fase C**: recriar o Access de staging.criativaria.com no Zero Trust da contato, descomissionar recursos antigos, atualizar ADRs/memórias/CLAUDE.md e o token escopado do ADR-0002 (recriado na conta contato).

Pré-requisito bloqueante: convite de membro (Administrator) para lucas.diassantana@gmail.com na conta contato — tokens de API pertencem ao usuário e só alcançam contas das quais ele é membro.

## Alternativas consideradas

- **Ficar na conta pessoal**: zero esforço, mas mistura patrimônio da comunidade com conta pessoal do operador (bus factor, offboarding impossível).
- **Só membership da contato na conta pessoal**: resolve acesso, não resolve propriedade; rejeitada como estado final (aceitável como interinidade).
- **Migrar só produção e deixar staging**: divide a operação em duas contas para sempre; rejeitada.

## Consequências

- Positivas: propriedade dos ativos com a organização; offboarding/onboarding de operadores vira gestão de membros.
- Negativas: janela de cutover de DNS para produção; recriação manual de Pages/Workers/D1/KV/Access (não transferíveis entre contas); Discord redirect URI atualizado uma vez.
- Interinas: staging e CI continuam na conta `712118...` com o token escopado do ADR-0002 até o convite existir.

## Revisitar quando

- O convite não se materializar em 30 dias (reavaliar interinidade); ou
- a Cloudflare lançar transferência nativa de projetos entre contas (simplificaria a Fase B).

## Apêndice — estado da Fase B (2026-07-03, pré-cutover)

Pronto na conta Criativaria (`3d13f42bdde51b934625e8853c1eccf0`): workers auth, criativaria-admin-panel, criativaria-web, criativaria-web-staging; Pages criativaria-clt-pj, criativaria-linkedin (subdomain real: criativaria-linkedin-34m.pages.dev), criativaria-homol; D1 criativaria-admin-panel (15a22559) e criativaria-progress (bf676cb4), dados importados e conferidos; KV admin-flags (8eab4d2f, valores copiados), RATE_LIMITS (96e6efdf), RATE_LIMITS_preview (2e587eeb); zona criativaria.com pendente `120f1086a4a83dd5d248aaf93ed04e95` com os 8 registros (CNAMEs já apontando para os alvos novos).

### Checklist do cutover

1. Operador no GoDaddy: nameservers → `melina.ns.cloudflare.com` + `noel.ns.cloudflare.com`.
2. Zona ativa → anexar domínios: criativaria.com + www → worker criativaria-web; staging → criativaria-web-staging; admin → criativaria-admin-panel (recolocar route no wrangler.jsonc e deployar); auth → worker auth (recolocar routes no wrangler.toml do hub); posicionamento/linkedin/linkedin-homol → Pages criativaria-linkedin.
3. Org secret AUTH_HUB_URL → https://auth.criativaria.com; redeploy do calculator; redirect URI final no Discord.
4. Operador reinsere secrets do criativaria-linkedin no projeto novo: GEMINI_API_KEY, OPENROUTER_API_KEY, SESSION_SECRET, DISCORD_CLIENT_ID/SECRET/GUILD_ID, TWITCH_CLIENT_ID/SECRET/CHANNEL_ID, BASE_URL.
5. Access do staging.criativaria.com no Zero Trust da conta nova (manual).
6. Fase C: apagar recursos Criativaria da conta antiga (workers criativaria-*, Pages criativaria-linkedin/homol antigos, D1, KVs, zona) + deletar token criativaria-migration-faseb.

Pendências conhecidas: pipeline agendado de vagas (content-deploy.yml) quebrado ANTES da migração (`Cannot find package 'yaml'` em scripts/prebuild-roadmaps.mjs) — consertar no repo web-app; sessão paralela trabalha no padrão homol (criativaria-homol) — coordenar antes de mexer.
