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
  beneficiosMensais: 0,
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
    if (entradas.direcao === 'clt-para-pj') {
      return {
        tipo: 'clt-para-pj' as const,
        eq: cltParaPj(
          {
            salarioBruto: entradas.valor,
            dependentes: entradas.dependentes,
            beneficiosMensais: entradas.beneficiosMensais,
            plrLiquidaAnual: entradas.plrLiquidaAnual,
          },
          pjOpcoes,
        ),
      }
    }
    return {
      tipo: 'pj-para-clt' as const,
      eq: pjParaClt(
        { ...pjOpcoes, faturamentoMensal: entradas.valor },
        { dependentes: entradas.dependentes },
      ),
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
    <div className="pagina">
      <header className="cabecalho">
        <p className="display marca">CRIATIVARIA</p>
        <h1 className="display">Calculadora CLT x PJ</h1>
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
      {temValor && <Funil />}

      <footer className="rodape nota">
        <p>
          Cálculo 100% no seu navegador: nenhum valor que você digita sai desta página. Parâmetros
          fiscais de 2026 (INSS, IRRF com a Lei 15.270, Simples Nacional Anexos III e V, fator R).
          Benchmark: Pesquisa Código Fonte TV, edições 2021 a 2026. Esta ferramenta é educativa e não
          substitui contador ou advogado.
        </p>
      </footer>
    </div>
  )
}
