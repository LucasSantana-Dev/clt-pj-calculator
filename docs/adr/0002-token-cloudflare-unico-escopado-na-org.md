# 0002 — Token Cloudflare único e escopado, como organization secret

Status: aceito (execução pendente da criação do token pelo operador)
Data: 2026-07-03

## Contexto

Os repos da Criativaria-Projects fazem deploy no Cloudflare (Pages e Workers) via GitHub Actions. Hoje cada repo carrega cópias repo-level de `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` com um token amplo (inclui DNS/zonas), e existe um org secret `CLOUDFLARE_SECRET` que nenhum workflow referencia. Rotação é N-plicada e o vazamento de qualquer repo expõe a conta inteira, incluindo a zona de produção criativaria.com.

## Decisão

Um único token de deploy, escopado, armazenado como organization secret:

1. Criar token "criativaria-ci-deploy" com: `Account > Cloudflare Pages: Edit`, `Account > Workers Scripts: Edit`, `Zone (criativaria.com) > Workers Routes: Edit` (necessário porque o worker criativaria-auth declara custom domain no wrangler.toml), TTL de 180 dias com calendário de rotação.
2. Publicar como org secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` (visibility: all) — os workflows existentes já usam esses nomes e passam a funcionar sem alteração.
3. Remover as cópias repo-level e o org secret órfão `CLOUDFLARE_SECRET`.

Piloto = os dois repos atuais (clt-pj-calculator, criativaria-auth). Critério de sucesso: CIs verdes incluindo `wrangler pages secret put` e `wrangler deploy` com custom domain. Rollback: restaurar secrets repo-level com o token amplo.

## Alternativas consideradas

- **Token amplo único na org**: rotação simples, mas raio de dano injustificado (DNS/zonas de produção) para economizar uma criação de token.
- **Tokens escopados por repo**: menor raio de dano, mas fricção de onboarding e rotação N-plicada; para operador solo, custo maior que o ganho (crítica independente confirmou).
- **Federação OIDC GitHub→Cloudflare**: sem suporte de primeira classe da Cloudflare; rejeitada.
- **Status quo (cópias manuais por repo)**: deriva de configuração e rotação em N lugares; não é linha de base aceitável.

## Consequências

- Positivas: rotação em um lugar; repo novo ganha deploy sem tocar em token; vazamento não alcança DNS nem configurações de conta.
- Negativas: operações raras de zona (anexar custom domain novo, DNS) continuam manuais com credencial mais forte fora do CI — é intencional.
- Neutras: org secrets em repos privados funcionam no plano atual (verificado empiricamente em 2026-07-03: CI do clt-pj-calculator, privado, consumiu org secrets com sucesso).
- Verificação da crítica pendente de hábito: rodar `gitleaks`/`detect-secrets` nos repos para pegar token commitado por acidente.

## Revisitar quando

- Novos repos > 8 por ano (automatizar tokens por repo passa a compensar; migrar para modelo por repo);
- surgir workflow que precise de controle de DNS no CI;
- a Cloudflare lançar federação OIDC para tokens efêmeros;
- exigência de trilha de auditoria por projeto (compliance).
