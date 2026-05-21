import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ChartInsight } from './ChartInsight'

describe('ChartInsight – byYear', () => {
  it('renderiza nada para dados vazios', () => {
    const { container } = render(<ChartInsight chartType="byYear" data={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('identifica o ano de pico corretamente', () => {
    render(<ChartInsight chartType="byYear" data={[
      { year: 2016, total: 1000 },
      { year: 2017, total: 2500 },
      { year: 2018, total: 800 },
    ]} />)
    expect(screen.getByText(/2017/)).toBeInTheDocument()
    expect(screen.getByText(/2\.500/)).toBeInTheDocument()
  })

  it('indica crescimento quando o último ano supera o primeiro', () => {
    render(<ChartInsight chartType="byYear" data={[
      { year: 2016, total: 1000 },
      { year: 2023, total: 1500 },
    ]} />)
    expect(screen.getByText(/crescimento/i)).toBeInTheDocument()
  })

  it('indica redução quando o último ano é menor que o primeiro', () => {
    render(<ChartInsight chartType="byYear" data={[
      { year: 2016, total: 1500 },
      { year: 2023, total: 1000 },
    ]} />)
    expect(screen.getByText(/redução/i)).toBeInTheDocument()
  })

  it('exibe o rótulo "Como interpretar"', () => {
    render(<ChartInsight chartType="byYear" data={[{ year: 2020, total: 100 }]} />)
    expect(screen.getByText(/como interpretar/i)).toBeInTheDocument()
  })
})

describe('ChartInsight – byHour', () => {
  it('renderiza nada para dados vazios', () => {
    const { container } = render(<ChartInsight chartType="byHour" data={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('identifica o horário de pico', () => {
    render(<ChartInsight chartType="byHour" data={[
      { hour: 7,  total: 200 },
      { hour: 17, total: 800 },
      { hour: 22, total: 150 },
    ]} />)
    expect(screen.getByText(/17h/)).toBeInTheDocument()
  })

  it('classifica horário da manhã corretamente', () => {
    render(<ChartInsight chartType="byHour" data={[
      { hour: 8, total: 500 },
    ]} />)
    expect(screen.getByText(/manhã/i)).toBeInTheDocument()
  })

  it('classifica horário da tarde corretamente', () => {
    render(<ChartInsight chartType="byHour" data={[
      { hour: 15, total: 500 },
    ]} />)
    expect(screen.getByText(/tarde/i)).toBeInTheDocument()
  })

  it('classifica horário da noite corretamente', () => {
    render(<ChartInsight chartType="byHour" data={[
      { hour: 21, total: 500 },
    ]} />)
    expect(screen.getByText(/noite/i)).toBeInTheDocument()
  })

  it('classifica madrugada corretamente', () => {
    render(<ChartInsight chartType="byHour" data={[
      { hour: 2, total: 500 },
    ]} />)
    expect(screen.getByText(/madrugada/i)).toBeInTheDocument()
  })
})

describe('ChartInsight – byWeekday', () => {
  it('renderiza nada para dados vazios', () => {
    const { container } = render(<ChartInsight chartType="byWeekday" data={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('exibe o nome do dia de pico em português', () => {
    render(<ChartInsight chartType="byWeekday" data={[
      { weekday: 4, total: 900 }, 
      { weekday: 1, total: 400 },
      { weekday: 5, total: 600 },
    ]} />)
    expect(screen.getByText(/sexta-feira/i)).toBeInTheDocument()
  })

  it('detecta quando dias úteis têm mais acidentes que fins de semana', () => {
    render(<ChartInsight chartType="byWeekday" data={[
      { weekday: 0, total: 800 }, 
      { weekday: 1, total: 900 }, 
      { weekday: 5, total: 200 }, 
      { weekday: 6, total: 150 }, 
    ]} />)
    expect(screen.getByText(/dias úteis/i)).toBeInTheDocument()
  })

  it('detecta quando fins de semana têm mais acidentes', () => {
    render(<ChartInsight chartType="byWeekday" data={[
      { weekday: 0, total: 100 },
      { weekday: 1, total: 100 },
      { weekday: 5, total: 900 },
      { weekday: 6, total: 900 },
    ]} />)
    expect(screen.getByText(/fins de semana/i)).toBeInTheDocument()
  })
})

describe('ChartInsight – byType', () => {
  it('renderiza nada para dados vazios', () => {
    const { container } = render(<ChartInsight chartType="byType" data={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('exibe o tipo mais frequente', () => {
    render(<ChartInsight chartType="byType" data={[
      { type: 'COLISAO', total: 5000 },
      { type: 'ATROPELAMENTO', total: 1000 },
    ]} />)
    
    expect(screen.getByText(/colisao/i)).toBeInTheDocument()
  })

  it('calcula o percentual corretamente', () => {
    render(<ChartInsight chartType="byType" data={[
      { type: 'COLISAO', total: 750 },
      { type: 'OUTRO',   total: 250 },
    ]} />)
    
    expect(screen.getByText(/75/)).toBeInTheDocument()
  })
})

describe('ChartInsight – topNeighborhoods', () => {
  it('renderiza nada para dados vazios', () => {
    const { container } = render(<ChartInsight chartType="topNeighborhoods" data={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('exibe o bairro líder', () => {
    render(<ChartInsight chartType="topNeighborhoods" data={[
      { neighborhood: 'SAVASSI',  total: 300 },
      { neighborhood: 'LOURDES',  total: 150 },
    ]} />)
    expect(screen.getByText(/savassi/i)).toBeInTheDocument()
  })

  it('exibe o segundo bairro quando presente', () => {
    render(<ChartInsight chartType="topNeighborhoods" data={[
      { neighborhood: 'SAVASSI',  total: 300 },
      { neighborhood: 'LOURDES',  total: 150 },
    ]} />)
    expect(screen.getByText(/lourdes/i)).toBeInTheDocument()
  })

  it('funciona com apenas um bairro', () => {
    render(<ChartInsight chartType="topNeighborhoods" data={[
      { neighborhood: 'CENTRO', total: 500 },
    ]} />)
    expect(screen.getByText(/centro/i)).toBeInTheDocument()
  })
})
