# CONTEXT — clt-pj-calculator

Glossário do domínio. Apenas linguagem, sem detalhes de implementação.

## Termos

### Calculadora CLT x PJ
Ferramenta Criativaria que responde duas perguntas para pessoas de tech no Brasil: "quanto vale minha remuneração CLT em PJ (e vice-versa)?" e "esse valor está bom para o meu perfil?". Composta por dois motores: o **Motor de Equivalência** e a **Camada de Benchmark**.

### Motor de Equivalência
Conversão fiscal entre um pacote CLT e um faturamento PJ de valor líquido equivalente. Considera, no lado CLT: 13º, férias + 1/3, FGTS, INSS, IRRF e benefícios; no lado PJ: tributos do regime da empresa, pró-labore e custos de manutenção (ex.: contador). Não depende do perfil da pessoa.

### Camada de Benchmark
Posicionamento do valor calculado contra faixas de mercado de tech no Brasil. É onde entram os **inputs diferenciais**: estado, senioridade, área de tech, remoto ou presencial, e tempo de experiência. Responde "acima, dentro ou abaixo da faixa para esse perfil".

### Inputs diferenciais
Os cinco atributos de perfil que segmentam o benchmark: estado (UF), senioridade, área de tech, modalidade (remoto/presencial/híbrido) e tempo de experiência. Não alteram o cálculo fiscal; alteram a leitura de mercado.

### Base de benchmark
Dataset curado e versionado no repositório, combinando fontes públicas. Fonte primária: Pesquisa Código Fonte TV (pesquisa.codigofonte.com.br), a maior pesquisa salarial de tech do Brasil (6ª edição, 2026, 17.046 respondentes; cobre UF, senioridade, área, modalidade, experiência e vínculo CLT/PJ, mas publica apenas agregados, sem dado bruto). Fontes complementares: dados governamentais (Novo CAGED/RAIS, dimensão UF) e outras pesquisas publicadas. Todo número carrega fonte e data. Segmento sem dado suficiente degrada para o segmento mais amplo, com aviso.

### Equivalência
Comparação pelo líquido anual total dividido por 12: no lado CLT, salário líquido + 13º + férias com 1/3 + depósitos de FGTS + benefícios informados; no lado PJ, faturamento menos tributos, custos e contribuições. É matemática pura, sem prêmio de risco embutido.

### Faixa estimada
Resultado da Camada de Benchmark: uma faixa salarial personalizada calculada por modelo de fatores (mediana-base por senioridade e área, ajustada por fatores multiplicativos de UF, modalidade e experiência derivados dos agregados publicados). Sempre rotulada como estimativa, nunca apresentada como dado observado, e acompanhada do explicador "como calculamos" que abre cada fator usado.

### Colchão de segurança
Camada visível e ajustável sobre a equivalência que precifica a perda de estabilidade do PJ (aviso prévio, seguro-desemprego, férias remuneradas, multa do FGTS). Vem com sugestão padrão, o usuário ajusta, e a ferramenta explica o porquê. Nunca embutido escondido no número principal.

### Regime PJ modelado
Simples Nacional, Anexos III e V, com lógica de fator R aplicada automaticamente: o motor calcula se elevar o pró-labore a 28% do faturamento compensa, escolhe o arranjo legal mais barato e mostra qual escolheu. Pró-labore ajustável em painel avançado. Lucro Presumido fica fora da v1 (roadmap).
