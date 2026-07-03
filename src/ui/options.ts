import type { Area, Experience, WorkMode, Seniority, Uf } from '../engine/benchmark'

export const SENIORITY_OPTIONS: { value: Seniority; label: string }[] = [
  { value: 'estagio', label: 'Estágio' },
  { value: 'junior', label: 'Júnior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'especialista', label: 'Especialista / Tech Lead / Principal' },
]

export const AREA_OPTIONS: { value: Area; label: string }[] = [
  { value: 'backend', label: 'Back-End' },
  { value: 'frontend', label: 'Front-End' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'dados', label: 'Dados (BI, Data Science)' },
  { value: 'devops', label: 'DevOps' },
  { value: 'sre', label: 'SRE' },
  { value: 'qa', label: 'QA' },
  { value: 'seguranca', label: 'Segurança da Informação' },
  { value: 'uiux', label: 'UI/UX' },
  { value: 'games', label: 'Games' },
  { value: 'embarcados', label: 'Embarcados' },
  { value: 'iot', label: 'IoT' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'rpa', label: 'RPA' },
  { value: 'bancoDeDados', label: 'Banco de Dados' },
  { value: 'outra', label: 'Outra' },
]

export const UF_OPTIONS: { value: Uf; label: string }[] = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

export const EXPERIENCE_OPTIONS: { value: Experience; label: string }[] = [
  { value: 'menos-1', label: 'Menos de 1 ano' },
  { value: '1-2', label: '1 a 2 anos' },
  { value: '2-4', label: '2 a 4 anos' },
  { value: '4-6', label: '4 a 6 anos' },
  { value: '6-8', label: '6 a 8 anos' },
  { value: '8-10', label: '8 a 10 anos' },
  { value: '10-15', label: '10 a 15 anos' },
  { value: '15-20', label: '15 a 20 anos' },
  { value: 'mais-20', label: 'Mais de 20 anos' },
]

export const WORK_MODE_OPTIONS: { value: WorkMode; label: string }[] = [
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'presencial', label: 'Presencial' },
]

export const SITE = 'https://criativaria.com'
export const DISCORD = 'https://discord.gg/criativaria'

export interface RelatedGuide {
  slug: string
  titulo: string
  descricao: string
}

const GUIDE: Record<string, RelatedGuide> = {
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
export const GUIDES_BY_SENIORITY: Record<Seniority, RelatedGuide[]> = {
  estagio: [GUIDE.vagaJunior, GUIDE.curriculo, GUIDE.processoSeletivo],
  junior: [GUIDE.vagaJunior, GUIDE.curriculo, GUIDE.processoSeletivo],
  pleno: [GUIDE.entrevistaTecnica, GUIDE.conexoes, GUIDE.offshore],
  senior: [GUIDE.offshore, GUIDE.linkedin, GUIDE.estruturaTimes],
  especialista: [GUIDE.offshore, GUIDE.linkedin, GUIDE.estruturaTimes],
}
