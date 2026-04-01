import clsx from 'clsx'

interface Props {
  label: string
  value: string
  highlight?: boolean
}

export function StatisticsCard({ label, value, highlight = false }: Props) {
  return (
    <div
      className={clsx(
        'rounded-lg border px-5 py-4 shadow-sm',
        highlight
          ? 'bg-red-50 border-red-100'
          : 'bg-white border-gray-100',
      )}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={clsx(
          'mt-1 text-2xl font-bold',
          highlight ? 'text-red-600' : 'text-gray-800',
        )}
      >
        {value}
      </p>
    </div>
  )
}
