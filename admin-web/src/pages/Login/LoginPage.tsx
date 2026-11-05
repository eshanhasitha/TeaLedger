import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import logo from '../../assets/logo.png'
import { TallyMarks } from '../../components/charts/TallyMarks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'

interface Values {
  phone: string
  password: string
}

export default function LoginPage() {
  const { signIn } = useAuth()
  const [show, setShow] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>()

  return (
    <div className="grid min-h-full lg:grid-cols-[1.1fr_1fr]">
      {/* cover */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[var(--spine)] p-12 text-[var(--spine-ink)] lg:flex">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="size-10 rounded-full bg-[#f5f0e6] p-1" />
          <span className="font-display text-[26px]">TeaLedger</span>
        </div>
        <div>
          <p className="eyebrow !text-[var(--spine-ink)] opacity-60">Volume {new Date().getFullYear()} · Estate copy</p>
          <h1 className="font-display mt-4 text-[84px] leading-[0.9]">
            Every leaf,
            <br />
            <span className="italic opacity-70">accounted for.</span>
          </h1>
          <div className="mt-10 flex gap-6 opacity-70">
            <TallyMarks count={23} seed={4} color="var(--spine-ink)" />
          </div>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <span key={s} className="h-1.5 flex-1 rounded-full" style={{ background: `var(--steep-${s})` }} />
          ))}
        </div>
      </section>

      {/* form */}
      <section className="ledger-paper flex items-center justify-center px-6 py-16">
        <form
          noValidate
          onSubmit={handleSubmit((v) => signIn(v.phone.replace(/\s/g, '')))}
          className="rise relative w-full max-w-sm"
        >
          <img src={logo} alt="" className="mb-6 size-12 lg:hidden" />
          <p className="eyebrow text-[var(--margin)]">Folio 00 — Sign in</p>
          <h2 className="font-display mt-2 text-[52px] leading-none">Open the ledger</h2>
          <p className="mt-3 text-[14px] text-[var(--ink-2)]">Administrators only. Collectors and farmers use the mobile app.</p>

          <div className="mt-10 grid gap-7">
            <Input
              label="Mobile number"
              inputMode="tel"
              autoComplete="username"
              placeholder="07X XXX XXXX"
              {...register('phone', {
                required: 'Enter your mobile number',
                validate: (v) => /^0\d{9}$/.test(v.replace(/\s/g, '')) || 'Use a 10-digit number starting with 0',
              })}
              error={errors.phone?.message}
            />
            <div className="relative">
              <Input
                label="Password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password', { required: 'Enter your password', minLength: { value: 6, message: 'At least 6 characters' } })}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-6 grid size-8 place-items-center text-[var(--ink-3)] hover:text-[var(--ink)]"
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={isSubmitting} className="mt-10 w-full !h-12">
            Sign in {!isSubmitting && <ArrowRight size={15} />}
          </Button>
          <p className="mt-6 text-center text-[12px] text-[var(--ink-3)]">Demo mode — any valid number and 6+ character password opens a sample ledger.</p>
        </form>
      </section>
    </div>
  )
}
