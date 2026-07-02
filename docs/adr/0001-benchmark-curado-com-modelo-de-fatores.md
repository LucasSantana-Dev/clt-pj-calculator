# 0001 — Benchmark por dataset curado + modelo de fatores sobre agregados públicos

Status: aceito (confirmado pelo operador na sessão de grill de 2026-07-02)
Data: 2026-07-02

## Contexto

A Camada de Benchmark precisa posicionar a remuneração do usuário contra o mercado tech BR segmentado por UF, senioridade, área, modalidade e experiência. Não existe API pública ou dataset bruto que cubra esse cruzamento. A fonte primária definida pelo operador é a Pesquisa Código Fonte TV (6ª edição, 2026, 17.046 respondentes), que cobre todas as cinco dimensões, mas publica apenas agregados marginais (média por UF, média por senioridade, etc.), sem cross-tab conjunto e sem download de dado bruto.

## Decisão

1. Dataset curado e versionado no repositório (JSON), transcrito manualmente dos agregados publicados, com fonte e data em cada número. Fonte primária: Pesquisa Código Fonte TV; complementos: Novo CAGED/RAIS (dimensão UF) e outras pesquisas publicadas. Atualização manual por edição/semestre.
2. Faixa personalizada calculada por modelo de fatores: mediana-base (senioridade × área, onde a pesquisa fornece) ajustada por fatores multiplicativos derivados dos marginais (fator UF = média UF / média nacional; idem modalidade e experiência).
3. O resultado é sempre rotulado "faixa estimada" e acompanha o explicador "como calculamos" expondo cada fator. Nunca apresentado como dado observado do segmento conjunto.

## Alternativas consideradas

- **Só marginais lado a lado** (sem número combinado): rigor máximo, zero precisão inventada, mas não entrega a resposta que o usuário veio buscar ("minha faixa"). Rejeitada pelo enfraquecimento do produto; a transparência é preservada via explicador.
- **Dados da comunidade** (submissões anônimas): autêntico a longo prazo, mas cold-start inviabiliza o lançamento e exige backend + LGPD. Fica como possível fase futura.
- **API/scraping de terceiros**: não existe cobertura confiável e gratuita; scraping da pesquisa violaria a relação com a fonte.

## Consequências

- O schema do dataset (base + fatores) molda motor, UI e linguagem de honestidade; trocar depois é caro.
- Precisão limitada: fatores multiplicativos assumem independência entre dimensões (ex.: prêmio de senioridade igual em todas as UFs). Mitigado pelo rótulo de estimativa e pelo explicador.
- Dependência de transcrição manual a cada edição da pesquisa; sem licenciamento explícito publicado, usar sempre com atribuição clara à fonte.

## Revisitar quando

- A Pesquisa Código Fonte TV publicar dado bruto ou cross-tabs; ou
- houver volume de submissões da comunidade suficiente para faixas observadas reais; ou
- a atribuição/uso for questionada pela fonte.
