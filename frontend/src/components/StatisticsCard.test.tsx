import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatisticsCard } from './StatisticsCard'

describe('StatisticsCard', () => {
  it('exibe o label corretamente', () => {
    render(<StatisticsCard label="Total de Acidentes" value="12.345" />)
    expect(screen.getByText('Total de Acidentes')).toBeInTheDocument()
  })

  it('exibe o valor corretamente', () => {
    render(<StatisticsCard label="Total de Acidentes" value="12.345" />)
    expect(screen.getByText('12.345')).toBeInTheDocument()
  })

  it('aplica destaque visual quando highlight=true', () => {
    render(<StatisticsCard label="Fatais" value="42" highlight />)
    
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renderiza sem highlight por padrão', () => {
    const { container } = render(<StatisticsCard label="Regionais" value="9" />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
