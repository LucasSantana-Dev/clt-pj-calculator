import type { Area, Experiencia, Modalidade, Senioridade, Uf } from '../engine/benchmark'

export const SENIORIDADES: { valor: Senioridade; rotulo: string }[] = [
  { valor: 'estagio', rotulo: 'Estágio' },
  { valor: 'junior', rotulo: 'Júnior' },
  { valor: 'pleno', rotulo: 'Pleno' },
  { valor: 'senior', rotulo: 'Sênior' },
  { valor: 'especialista', rotulo: 'Especialista / Tech Lead / Principal' },
]

export const AREAS: { valor: Area; rotulo: string }[] = [
  { valor: 'backend', rotulo: 'Back-End' },
  { valor: 'frontend', rotulo: 'Front-End' },
  { valor: 'fullstack', rotulo: 'Full Stack' },
  { valor: 'mobile', rotulo: 'Mobile' },
  { valor: 'dados', rotulo: 'Dados (BI, Data Science)' },
  { valor: 'devops', rotulo: 'DevOps' },
  { valor: 'sre', rotulo: 'SRE' },
  { valor: 'qa', rotulo: 'QA' },
  { valor: 'seguranca', rotulo: 'Segurança da Informação' },
  { valor: 'uiux', rotulo: 'UI/UX' },
  { valor: 'games', rotulo: 'Games' },
  { valor: 'embarcados', rotulo: 'Embarcados' },
  { valor: 'iot', rotulo: 'IoT' },
  { valor: 'desktop', rotulo: 'Desktop' },
  { valor: 'rpa', rotulo: 'RPA' },
  { valor: 'bancoDeDados', rotulo: 'Banco de Dados' },
  { valor: 'outra', rotulo: 'Outra' },
]

export const UFS: { valor: Uf; rotulo: string }[] = [
  { valor: 'AC', rotulo: 'Acre' },
  { valor: 'AL', rotulo: 'Alagoas' },
  { valor: 'AP', rotulo: 'Amapá' },
  { valor: 'AM', rotulo: 'Amazonas' },
  { valor: 'BA', rotulo: 'Bahia' },
  { valor: 'CE', rotulo: 'Ceará' },
  { valor: 'DF', rotulo: 'Distrito Federal' },
  { valor: 'ES', rotulo: 'Espírito Santo' },
  { valor: 'GO', rotulo: 'Goiás' },
  { valor: 'MA', rotulo: 'Maranhão' },
  { valor: 'MT', rotulo: 'Mato Grosso' },
  { valor: 'MS', rotulo: 'Mato Grosso do Sul' },
  { valor: 'MG', rotulo: 'Minas Gerais' },
  { valor: 'PA', rotulo: 'Pará' },
  { valor: 'PB', rotulo: 'Paraíba' },
  { valor: 'PR', rotulo: 'Paraná' },
  { valor: 'PE', rotulo: 'Pernambuco' },
  { valor: 'PI', rotulo: 'Piauí' },
  { valor: 'RJ', rotulo: 'Rio de Janeiro' },
  { valor: 'RN', rotulo: 'Rio Grande do Norte' },
  { valor: 'RS', rotulo: 'Rio Grande do Sul' },
  { valor: 'RO', rotulo: 'Rondônia' },
  { valor: 'RR', rotulo: 'Roraima' },
  { valor: 'SC', rotulo: 'Santa Catarina' },
  { valor: 'SP', rotulo: 'São Paulo' },
  { valor: 'SE', rotulo: 'Sergipe' },
  { valor: 'TO', rotulo: 'Tocantins' },
]

export const EXPERIENCIAS: { valor: Experiencia; rotulo: string }[] = [
  { valor: 'menos-1', rotulo: 'Menos de 1 ano' },
  { valor: '1-2', rotulo: '1 a 2 anos' },
  { valor: '2-4', rotulo: '2 a 4 anos' },
  { valor: '4-6', rotulo: '4 a 6 anos' },
  { valor: '6-8', rotulo: '6 a 8 anos' },
  { valor: '8-10', rotulo: '8 a 10 anos' },
  { valor: '10-15', rotulo: '10 a 15 anos' },
  { valor: '15-20', rotulo: '15 a 20 anos' },
  { valor: 'mais-20', rotulo: 'Mais de 20 anos' },
]

export const MODALIDADES: { valor: Modalidade; rotulo: string }[] = [
  { valor: 'remoto', rotulo: 'Remoto' },
  { valor: 'hibrido', rotulo: 'Híbrido' },
  { valor: 'presencial', rotulo: 'Presencial' },
]

export const SITE = 'https://criativaria.com'
export const DISCORD = 'https://discord.gg/9mV9HnEkfT'

export interface GuiaRelacionado {
  slug: string
  titulo: string
  descricao: string
}

const GUIA: Record<string, GuiaRelacionado> = {
  vagaJunior: {
    slug: 'como-ler-uma-vaga-junior',
    titulo: 'Como ler uma vaga júnior',
    descricao: 'Interpretar o que a vaga pede de verdade, sem se assustar com a lista de requisitos.',
  },
  curriculo: {
    slug: 'curriculo-tech-que-passa-no-filtro',
    titulo: 'Currículo tech que passa no filtro',
    descricao: 'Um CV que chega até quem decide, sem enfeite.',
  },
  processoSeletivo: {
    slug: 'processo-seletivo-do-cv-a-entrevista',
    titulo: 'Processo seletivo: do CV à entrevista',
    descricao: 'O caminho completo de uma candidatura, etapa por etapa.',
  },
  entrevistaTecnica: {
    slug: 'tipos-de-entrevista-tecnica-e-como-treinar',
    titulo: 'Tipos de entrevista técnica',
    descricao: 'O que esperar de cada etapa e como treinar para elas.',
  },
  conexoes: {
    slug: 'conexoes-rede-se-constroi-antes-da-vaga',
    titulo: 'Conexões: rede se constrói antes da vaga',
    descricao: 'Relações que abrem portas, construídas antes de você precisar delas.',
  },
  offshore: {
    slug: 'contratacao-offshore-como-ser-contratado-fora',
    titulo: 'Contratação offshore',
    descricao: 'Como funciona trabalhar PJ para empresas de fora do Brasil.',
  },
  linkedin: {
    slug: 'linkedin-de-um-curriculo-parado-para-uma-landing-page-de-aut',
    titulo: 'LinkedIn como página de autoridade',
    descricao: 'De currículo parado a vitrine do seu trabalho.',
  },
  estruturaTimes: {
    slug: 'estrutura-de-times-como-trabalhar-em-equipe',
    titulo: 'Estrutura de times',
    descricao: 'Como times de tecnologia se organizam na prática.',
  },
}

/** Recomendações por senioridade: quem é sênior não precisa de guia de vaga júnior. */
export const GUIAS_POR_SENIORIDADE: Record<Senioridade, GuiaRelacionado[]> = {
  estagio: [GUIA.vagaJunior, GUIA.curriculo, GUIA.processoSeletivo],
  junior: [GUIA.vagaJunior, GUIA.curriculo, GUIA.processoSeletivo],
  pleno: [GUIA.entrevistaTecnica, GUIA.conexoes, GUIA.offshore],
  senior: [GUIA.offshore, GUIA.linkedin, GUIA.estruturaTimes],
  especialista: [GUIA.offshore, GUIA.linkedin, GUIA.estruturaTimes],
}
