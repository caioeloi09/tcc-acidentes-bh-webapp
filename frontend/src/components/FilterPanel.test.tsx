import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FilterPanel, EMPTY_FILTERS } from './FilterPanel'
import { Statistics } from '../types/statistics'

const baseStats: Statistics = {
  totalAccidents:   1000,
  totalFatalities:  10,
  byDistrict:       [
    { district: 'CENTRO-SUL', total: 400 },
    { district: 'PAMPULHA',   total: 300 },
  ],
  topNeighborhoods: [],
  byType:           [
    { type: 'COLISAO',       total: 600 },
    { type: 'ATROPELAMENTO', total: 400 },
  ],
  byYear:    [{ year: 2020, total: 500 }, { year: 2021, total: 500 }],
  byHour:    [],
  byWeekday: [],
}

describe('FilterPanel', () => {
  it('renderiza os três selects', () => {
    render(
      <FilterPanel
        baseStats={baseStats}
        filters={EMPTY_FILTERS}
        loading={false}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText(/todos os anos/i)).toBeInTheDocument()
    expect(screen.getByText(/todas as regionais/i)).toBeInTheDocument()
    expect(screen.getByText(/todos os tipos/i)).toBeInTheDocument()
  })

  it('popula as opções de ano a partir de baseStats', () => {
    render(
      <FilterPanel
        baseStats={baseStats}
        filters={EMPTY_FILTERS}
        loading={false}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole('option', { name: '2020' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '2021' })).toBeInTheDocument()
  })

  it('popula as opções de regional a partir de baseStats', () => {
    render(
      <FilterPanel
        baseStats={baseStats}
        filters={EMPTY_FILTERS}
        loading={false}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole('option', { name: 'CENTRO-SUL' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'PAMPULHA' })).toBeInTheDocument()
  })

  it('não exibe botão "Limpar filtros" quando nenhum filtro está ativo', () => {
    render(
      <FilterPanel
        baseStats={baseStats}
        filters={EMPTY_FILTERS}
        loading={false}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByText(/limpar filtros/i)).not.toBeInTheDocument()
  })

  it('exibe botão "Limpar filtros" quando há filtro ativo', () => {
    render(
      <FilterPanel
        baseStats={baseStats}
        filters={{ year: 2020, district: null, type: null }}
        loading={false}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText(/limpar filtros/i)).toBeInTheDocument()
  })

  it('chama onChange com filtros zerados ao clicar em Limpar', async () => {
    const onChange = vi.fn()
    render(
      <FilterPanel
        baseStats={baseStats}
        filters={{ year: 2020, district: null, type: null }}
        loading={false}
        onChange={onChange}
      />
    )
    await userEvent.click(screen.getByText(/limpar filtros/i))
    expect(onChange).toHaveBeenCalledWith(EMPTY_FILTERS)
  })

  it('chama onChange com o ano selecionado', async () => {
    const onChange = vi.fn()
    render(
      <FilterPanel
        baseStats={baseStats}
        filters={EMPTY_FILTERS}
        loading={false}
        onChange={onChange}
      />
    )
    const yearSelect = screen.getByDisplayValue(/todos os anos/i)
    await userEvent.selectOptions(yearSelect, '2021')
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ year: 2021 })
    )
  })

  it('desabilita os selects durante o carregamento', () => {
    render(
      <FilterPanel
        baseStats={baseStats}
        filters={EMPTY_FILTERS}
        loading={true}
        onChange={vi.fn()}
      />
    )
    const selects = screen.getAllByRole('combobox')
    selects.forEach((select: HTMLElement) => expect(select).toBeDisabled())
  })

  it('exibe indicador "atualizando" durante o carregamento', () => {
    render(
      <FilterPanel
        baseStats={baseStats}
        filters={EMPTY_FILTERS}
        loading={true}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText(/atualizando/i)).toBeInTheDocument()
  })
})
