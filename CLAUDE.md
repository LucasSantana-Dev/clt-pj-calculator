# clt-pj-calculator

Calculadora CLT x PJ da Criativaria. Vite + React 19 + TS, engine puro em `src/engine/`, dataset versionado em `src/data/`, deploy Cloudflare Pages (`criativaria-clt-pj`).

## Regras

- **Código em inglês**: identificadores (variáveis, funções, tipos, arquivos, classes CSS) em inglês. PT-BR apenas em strings visíveis ao usuário e conteúdo. Termos de domínio sem tradução limpa (pró-labore, fator R, Simples) podem compor nomes ingleses (`proLaboreCharges`). Rename completo para inglês feito em 2026-07-02; não reintroduzir identificadores em PT.
- **Tokens visuais**: copiados de `web-app/src/app/globals.css` — não inventar valores; web-app/DESIGN.md manda.
- **Engine**: nunca misturar UI em `src/engine/`; toda mudança fiscal exige teste com valor calculado à mão e fonte oficial citada em `tables2026.ts`.
- **Benchmark**: números sempre com fonte + data (ADR-0001); rotular estimativas como "faixa estimada".
- **Deploy**: automático via GitHub Actions no push para main (CI: typecheck + testes + build + smoke e2e + Cloudflare Pages). Manual `npx wrangler pages deploy dist --project-name criativaria-clt-pj` só como contingência. Nunca Vercel.
- **Repo**: github.com/LucasSantana-Dev/clt-pj-calculator (transferir para a org Criativaria quando houver permissão de criação).
- **Staging**: gate por Discord OAuth (`functions/_middleware.js` + `functions/api/auth/`): entra quem é membro do Discord da Criativaria. Interruptor-mestre: secret `STAGING` (com ela e sem OAuth configurado, responde 503; sem ela, site aberto). Secrets no projeto Pages: STAGING, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_GUILD_ID, SESSION_SECRET, BASE_URL. Redirect URI no app do Discord: `<BASE_URL>/api/auth/discord/callback`. Lançamento público: `npx wrangler pages secret delete STAGING --project-name criativaria-clt-pj`. Padrão portado do linkedin-analyzer.
- **Voz**: copy segue CRIATIVARIA.md (sem travessão, sem hype, positivo primeiro).
