import { useForm } from 'react-hook-form'
import type { Collector } from '../../types/ledger.types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export interface CollectorValues {
  name: string
  phone: string
  area: string
}

export function CollectorForm({ initial, onSubmit, onCancel }: { initial?: Collector; onSubmit: (v: CollectorValues) => void; onCancel: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CollectorValues>({ defaultValues: initial ? { name: initial.name, phone: initial.phone, area: initial.area } : {} })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      <Input label="Full name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Mobile"
          inputMode="tel"
          placeholder="07X XXX XXXX"
          {...register('phone', {
            required: 'Mobile number is required',
            validate: (v) => /^0\d{9}$/.test(v.replace(/\s/g, '')) || 'Use a 10-digit number starting with 0',
          })}
          error={errors.phone?.message}
        />
        <Input label="Route / area" placeholder="e.g. Deniyaya" {...register('area', { required: 'Area is required' })} error={errors.area?.message} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? 'Save changes' : 'Add collector'}</Button>
      </div>
    </form>
  )
}
