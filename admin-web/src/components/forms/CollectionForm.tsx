import { useForm, useWatch } from 'react-hook-form'
import { useLedger } from '../../hooks/useLedger'
import { DEFAULT_BAG_KG } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatCurrency'
import { periodOf, toISODate } from '../../utils/formatDate'
import { formatNumber } from '../../utils/formatNumber'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export interface CollectionValues {
  farmerId: string
  date: string
  gross: number
  water: number
  bag: number
  other: number
}

/** Manual weigh-in. The payable weight and amount are worked out live, like a pencilled sum in the margin. */
export function CollectionForm({ onSubmit, onCancel }: { onSubmit: (v: CollectionValues) => void; onCancel: () => void }) {
  const { farmers, collectorById, priceFor } = useLedger()
  const today = toISODate(new Date())
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CollectionValues>({ defaultValues: { date: today, bag: DEFAULT_BAG_KG, water: 0, other: 0 } })

  const [gross, water, bag, other, date] = useWatch({ control, name: ['gross', 'water', 'bag', 'other', 'date'] })
  const n = (v: unknown) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0)
  const final = Math.max(0, n(gross) - n(water) - n(bag) - n(other))
  const price = priceFor(periodOf(date || today))

  const num = (label: string, extra = {}) => ({
    valueAsNumber: true,
    min: { value: 0, message: `${label} can't be negative` },
    ...extra,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-[1fr_160px]">
        <Select
          label="Farmer"
          placeholder="Choose farmer…"
          options={farmers
            .filter((f) => f.active)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((f) => ({ value: f.id, label: `${f.name} · ${f.code} · ${collectorById.get(f.collectorId)?.area ?? ''}` }))}
          {...register('farmerId', { required: 'Pick a farmer' })}
          error={errors.farmerId?.message}
        />
        <Input label="Date" type="date" max={today} {...register('date', { required: 'Required' })} error={errors.date?.message} />
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Input
          label="Gross"
          type="number"
          step="0.1"
          suffix="kg"
          {...register('gross', num('Gross', { required: 'Required', min: { value: 0.1, message: 'Above 0' }, max: { value: 500, message: 'Check scale — over 500 kg' } }))}
          error={errors.gross?.message}
        />
        <Input
          label="Water"
          type="number"
          step="0.1"
          suffix="kg"
          {...register('water', num('Water', { validate: (v: number, all: CollectionValues) => v <= n(all.gross) * 0.2 || 'Over 20% of gross' }))}
          error={errors.water?.message}
        />
        <Input label="Bags" type="number" step="0.1" suffix="kg" {...register('bag', num('Bags'))} error={errors.bag?.message} />
        <Input label="Other" type="number" step="0.1" suffix="kg" {...register('other', num('Other'))} error={errors.other?.message} />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-y border-dashed border-[var(--hair)] py-4">
        <div>
          <p className="eyebrow">Payable weight</p>
          <p className="font-display text-[40px] leading-none">
            {formatNumber(final, 1)}
            <span className="figure ml-1 text-[13px] text-[var(--ink-3)]">kg</span>
          </p>
        </div>
        <div className="text-right">
          <p className="eyebrow">@ Rs {price}/kg</p>
          <p className="figure text-[20px]">{formatCurrency(final * price)}</p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Enter in ledger</Button>
      </div>
    </form>
  )
}
