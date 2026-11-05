import { ShieldCheck, Scale, Users, TrendingUp } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const AuthHero = () => {
  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0c2618] via-[#103320] to-[#07190f] p-12 text-white lg:flex">
      {/* Background organic tea wave & mesh glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

      {/* Subtle topographic contour SVG overlay */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M -100,200 Q 150,50 350,180 T 800,120 T 1200,250"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
        />
        <path
          d="M -80,350 Q 200,180 450,300 T 900,220 T 1300,380"
          fill="none"
          stroke="#22c55e"
          strokeWidth="1.5"
        />
        <path
          d="M -50,520 Q 280,320 550,440 T 1050,360 T 1400,540"
          fill="none"
          stroke="#16a34a"
          strokeWidth="1.5"
        />
      </svg>

      {/* Top Header: Brand Logo & Title */}
      <div className="relative z-10 flex items-center gap-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/20 shadow-md">
          <img
            src={logoImg}
            alt="TeaLedger Logo"
            className="h-9 w-9 object-contain"
          />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-white block">
            TeaLedger
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-emerald-300 uppercase">
            Estate Admin Platform V2
          </span>
        </div>
      </div>

      {/* Middle Hero Content & High-Level System Stats */}
      <div className="relative z-10 my-auto py-8 space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Highland Basin Operations Hub</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
            Precision Harvest, Scaled Ledger & Smallholder Payouts.
          </h1>

          <p className="text-sm text-emerald-100/80 leading-relaxed max-w-md">
            Securing over 1,400+ smallholder accounts & daily weighbridge intake operations across Nuwara Eliya, Talawakelle, and Maskeliya.
          </p>
        </div>

        {/* Live Metrics Showcase Cards */}
        <div className="grid grid-cols-2 gap-3.5 pt-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
              <Users className="h-4 w-4" />
              <span>Registered Growers</span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">1,428</div>
            <div className="mt-0.5 text-[11px] text-emerald-200/70 font-medium">
              98.2% Active Smallholders
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
              <Scale className="h-4 w-4" />
              <span>Gross Intake Today</span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">14,850 kg</div>
            <div className="mt-0.5 text-[11px] text-emerald-200/70 font-medium">
              Station 04 Electronic Scale
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>October Farmer Net Payout</span>
              </div>
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                Disbursal Oct 31
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">LKR 46.28M</span>
              <span className="text-xs text-emerald-200/80">Commercial Bank / BOC Pipeline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Security Badge */}
      <div className="relative z-10 border-t border-white/15 pt-5">
        <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3.5 border border-white/10 backdrop-blur-xs">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-white block">
              Protected by Role-Based JWT Authorization & Centralized Audit Logging
            </span>
            <span className="text-[11px] text-emerald-200/70 leading-relaxed mt-0.5 block">
              All intake tickets, tare adjustments, and fertilizer advance recoveries are cryptographically signed.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
