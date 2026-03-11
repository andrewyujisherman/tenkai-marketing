'use client'

import { Check, X, Minus } from 'lucide-react'

type CellValue = 'check' | 'x' | 'partial' | string

interface ComparisonRow {
  label: string
  tenkai: CellValue
  agency: CellValue
  diy: CellValue
  mega: CellValue
}

const rows: ComparisonRow[] = [
  {
    label: 'Price',
    tenkai: '$150–500/mo',
    agency: '$2,000–10,000/mo',
    diy: '$50–200/mo',
    mega: '$99–299/mo',
  },
  {
    label: 'Content Quality',
    tenkai: 'check',
    agency: 'check',
    diy: 'x',
    mega: 'partial',
  },
  {
    label: 'Your Control',
    tenkai: 'check',
    agency: 'partial',
    diy: 'check',
    mega: 'x',
  },
  {
    label: 'Transparency',
    tenkai: 'check',
    agency: 'partial',
    diy: 'partial',
    mega: 'x',
  },
  {
    label: 'Contracts',
    tenkai: 'None',
    agency: '6–12 months',
    diy: 'None',
    mega: 'Annual',
  },
  {
    label: 'Support',
    tenkai: 'check',
    agency: 'check',
    diy: 'x',
    mega: 'partial',
  },
]

function CellContent({ value }: { value: CellValue }) {
  if (value === 'check') return <Check className="size-5 text-torii mx-auto" />
  if (value === 'x') return <X className="size-5 text-muted-gray mx-auto" />
  if (value === 'partial') return <Minus className="size-5 text-warm-gray mx-auto" />
  return <span className="text-sm">{value}</span>
}

export function ComparisonSection() {
  return (
    <section>
      <div className="w-full max-w-container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-4">
            Why Tenkai?
          </h2>
          <p className="text-lg text-warm-gray">
            See how we compare
          </p>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto animate-fade-up" style={{ animationDelay: '100ms' }}>
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-warm-gray py-4 px-4 w-[20%]" />
                <th className="text-center py-4 px-4 w-[20%]">
                  <div className="bg-torii-subtle rounded-t-xl pt-3 pb-2 px-3 -mb-4">
                    <span className="font-serif text-lg text-torii">Tenkai</span>
                  </div>
                </th>
                <th className="text-center text-sm font-medium text-warm-gray py-4 px-4 w-[20%]">
                  Traditional Agency
                </th>
                <th className="text-center text-sm font-medium text-warm-gray py-4 px-4 w-[20%]">
                  DIY Tools
                </th>
                <th className="text-center text-sm font-medium text-warm-gray py-4 px-4 w-[20%]">
                  MEGA
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-tenkai-border-light">
                  <td className="text-sm font-medium text-charcoal py-4 px-4">
                    {row.label}
                  </td>
                  <td className="text-center py-4 px-4 bg-torii-subtle/50">
                    <CellContent value={row.tenkai} />
                  </td>
                  <td className="text-center py-4 px-4 text-warm-gray">
                    <CellContent value={row.agency} />
                  </td>
                  <td className="text-center py-4 px-4 text-warm-gray">
                    <CellContent value={row.diy} />
                  </td>
                  <td className="text-center py-4 px-4 text-warm-gray">
                    <CellContent value={row.mega} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
