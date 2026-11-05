import { useForm } from 'react-hook-form'
import { useLedger } from '../../hooks/useLedger'
import type { Farmer } from '../../types/ledger.types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export interface FarmerValues {
  name: string
  phone: string
  address: string
  landSize: number
  collectorId: string
}

interface Props {
  initial?: Farmer
  onSubmit: (v: FarmerValues) => void
  onCancel: () => void
}

export function FarmerForm({ initial, onSubmit, onCancel }: Props) {
  const { collectors } = useLedger()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmerValues>({
    defaultValues: initial
      ? { name: initial.name, phone: initial.phone, address: initial.address, landSize: initial.landSize, collectorId: initial.collectorId }
      : { landSize: 1 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      <Input label="Full name" placeholder="e.g. Kamala Perera" {...register('name', { required: 'Name is required', minLength: { value: 3, message: 'At least 3 characters' } })} error={errors.name?.message} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Mobile"
          placeholder="07X XXX XXXX"
          inputMode="tel"
          {...register('phone', {
            required: 'Mobile number is required',
            validate: (v) => /^0\d{9}$/.test(v.replace(/\s/g, '')) || 'Use a 10-digit number starting with 0',
          })}
          error={errors.phone?.message}
        />
        <Input
          label="Tea land"
          type="number"
          step="0.01"
          suffix="acres"
          {...register('landSize', {
            valueAsNumber: true,
            required: 'Required',
            min: { value: 0.05, message: 'Must be above 0' },
            max: { value: 200, message: 'That is a very large holding — check the figure' },
          })}
          error={errors.landSize?.message}
        />
      </div>
      <Input label="Address" placeholder="Number, village, area" {...register('address', { required: 'Address is required' })} error={errors.address?.message} />
      <Select
        label="Assigned collector"
        placeholder="Choose a route…"
        options={collectors.filter((c) => c.active || c.id === initial?.collectorId).map((c) => ({ value: c.id, label: `${c.area} — ${c.name}` }))}
        {...register('collectorId', { required: 'Pick the collector for this route' })}
        error={errors.collectorId?.message}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? 'Save changes' : 'Register farmer'}</Button>
      </div>
    </form>
  )
}
