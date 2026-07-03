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
