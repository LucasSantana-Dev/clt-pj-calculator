import { useMemo, useState } from 'react'
import { cltParaPj, pjParaClt } from './engine/solve'
import { calculaColchao, COLCHAO_PADRAO, type ColchaoInput } from './engine/colchao'
import { calculaBenchmark } from './engine/benchmark'
import { calculaTendencias } from './engine/tendencias'
import { Formulario, type Entradas } from './ui/Formulario'
import { ResultadoCltParaPj, ResultadoPjParaClt } from './ui/Resultado'
import { Colchao } from './ui/Colchao'
import { Benchmark } from './ui/Benchmark'
import { Tendencias } from './ui/Tendencias'
import { Funil } from './ui/Funil'

const ENTRADAS_INICIAIS: Entradas = {
  direcao: 'clt-para-pj',
  valor: 0,
  dependentes: 0,
  vrVaMensal: 0,
  planoSaudeMensal: 0,
  auxHomeOfficeMensal: 0,
  valeTransporteMensal: 0,
  auxEducacaoMensal: 0,
  outrosBeneficiosMensais: 0,
  plrLiquidaAnual: 0,
  contadorMensal: 300,
  proLaboreCustom: null,
  senioridade: 'pleno',
  area: 'backend',
  uf: 'SP',
  modalidade: 'remoto',
  experiencia: '4-6',
}

export default function App() {
  const [entradas, setEntradas] = useState<Entradas>(ENTRADAS_INICIAIS)
  const [colchaoConfig, setColchaoConfig] = useState<Required<ColchaoInput>>(COLCHAO_PADRAO)

  const temValor = entradas.valor >= 1000

  const resultado = useMemo(() => {
    if (!temValor) return null
    const pjOpcoes = {
      contadorMensal: entradas.contadorMensal,
      dependentes: entradas.dependentes,
      ...(entradas.proLaboreCustom ? { proLaboreCustom: entradas.proLaboreCustom } : {}),
    }
    // Benefícios seguem a modalidade: home office só fora do presencial,
    // vale-transporte só fora do remoto (o desconto de 6% fica no motor).
    const cltOpcoes = {
      dependentes: entradas.dependentes,
      beneficiosMensais:
        entradas.vrVaMensal +
        entradas.planoSaudeMensal +
        entradas.auxEducacaoMensal +
        entradas.outrosBeneficiosMensais +
        (entradas.modalidade !== 'presencial' ? entradas.auxHomeOfficeMensal : 0),
      valeTransporteMensal: entradas.modalidade !== 'remoto' ? entradas.valeTransporteMensal : 0,
      plrLiquidaAnual: entradas.plrLiquidaAnual,
    }
    if (entradas.direcao === 'clt-para-pj') {
      return {
        tipo: 'clt-para-pj' as const,
        eq: cltParaPj({ salarioBruto: entradas.valor, ...cltOpcoes }, pjOpcoes),
      }
    }
    return {
      tipo: 'pj-para-clt' as const,
      eq: pjParaClt({ ...pjOpcoes, faturamentoMensal: entradas.valor }, cltOpcoes),
    }
  }, [entradas, temValor])

  const colchao = useMemo(() => {
    if (!resultado || resultado.tipo !== 'clt-para-pj') return null
    return calculaColchao(resultado.eq.faturamentoEquivalente, colchaoConfig)
  }, [resultado, colchaoConfig])

  const benchmark = useMemo(() => {
    if (!temValor) return null
    return calculaBenchmark(entradas.valor, {
      senioridade: entradas.senioridade,
      area: entradas.area,
      uf: entradas.uf,
      vinculo: entradas.direcao === 'clt-para-pj' ? 'clt' : 'pj',
      experiencia: entradas.experiencia,
      modalidade: entradas.modalidade,
    })
  }, [entradas, temValor])

  const tendencias = useMemo(() => calculaTendencias(entradas.senioridade), [entradas.senioridade])

  return (
    <div>
      <header className="site-header">
        <div className="container">
          <a href="https://criativaria.com" className="brand">
            Criativaria <span className="star">✦</span>
          </a>
          <nav className="nav">
            <a href="https://criativaria.com/">Início</a>
            <a href="https://criativaria.com/sobre">Sobre</a>
            <a href="https://criativaria.com/guias">Guias</a>
            <a href="https://criativaria.com/roadmaps">Roadmaps</a>
            <a href="https://criativaria.com/cursos">Cursos</a>
            <a href="https://criativaria.com/vagas">Vagas</a>
          </nav>
        </div>
      </header>

      <div className="pagina">
        <header className="cabecalho">
          <p className="display marca">CALCULADORA</p>
          <h1 className="display">CLT x PJ</h1>
          <p className="subtitulo">
            Uma proposta PJ que parece maior nem sempre é. Aqui você compara os dois vínculos com a
            matemática completa de 2026, vê a faixa de mercado para o seu perfil e recebe o valor com
            calma, sem hype.
          </p>
        </header>

        <Formulario entradas={entradas} aoMudar={setEntradas} />

        {!temValor && (
          <p className="aguardando nota">
            Informe o valor da proposta acima para ver a comparação completa.
          </p>
        )}

        {resultado?.tipo === 'clt-para-pj' && (
          <>
            <ResultadoCltParaPj eq={resultado.eq} />
            {colchao && <Colchao resultado={colchao} config={colchaoConfig} aoMudar={setColchaoConfig} />}
          </>
        )}
        {resultado?.tipo === 'pj-para-clt' && <ResultadoPjParaClt eq={resultado.eq} />}

        {benchmark && <Benchmark resultado={benchmark} />}
        {temValor && <Tendencias dados={tendencias} />}
        {temValor && <Funil senioridade={entradas.senioridade} />}

        <footer className="rodape nota">
          <p>
            Cálculo 100% no seu navegador: nenhum valor que você digita sai desta página. Parâmetros
            fiscais de 2026 (INSS, IRRF com a Lei 15.270, Simples Nacional Anexos III e V, fator R).
            Benchmark: Pesquisa Código Fonte TV, edições 2021 a 2026. Esta ferramenta é educativa e não
            substitui contador ou advogado.
          </p>
        </footer>
      </div>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-social">
            <a href="https://discord.gg/9mV9HnEkfT" target="_blank" rel="noopener noreferrer">
              Entrar na comunidade (Discord)
            </a>
            <a href="https://www.twitch.tv/criativaria" target="_blank" rel="noopener noreferrer">
              Acompanhar a live (Twitch)
            </a>
            <a href="https://apoia.se/criativaria" target="_blank" rel="noopener noreferrer">
              Apoiar na comunidade
            </a>
            <a href="https://criativaria.com/sobre">Sobre a Criativaria</a>
          </div>
          <p className="footer-legal">
            Criativaria · conteúdo aberto sob CC BY-SA 4.0 · feito pela comunidade
          </p>
        </div>
      </footer>
    </div>
  )
}
