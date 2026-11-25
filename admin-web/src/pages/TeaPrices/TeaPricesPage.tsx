import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

interface PriceEntry {
  id: string;
  effectiveFrom: string;
  pricePerKg: number;
  setBy: string;
  changedOn: string;
  status: 'Scheduled' | 'Current' | 'Past';
}

const INITIAL_PRICES: PriceEntry[] = [
  { id: 'P-03', effectiveFrom: '01 Dec 2026', pricePerKg: 255.0, setBy: 'Sunil Jayawardena', changedOn: '14 Nov 2026', status: 'Scheduled' },
  { id: 'P-02', effectiveFrom: '01 Nov 2026', pricePerKg: 250.0, setBy: 'Sunil Jayawardena', changedOn: '28 Oct 2026', status: 'Current' },
  { id: 'P-01', effectiveFrom: '01 Oct 2026', pricePerKg: 245.0, setBy: 'Sunil Jayawardena', changedOn: '29 Sep 2026', status: 'Past' },
];

export const TeaPricesPage: React.FC = () => {
  const { addToast } = useDashboard();
  const [prices, setPrices] = useState<PriceEntry[]>(INITIAL_PRICES);
  const [priceInput, setPriceInput] = useState('255.00');
  const [effectiveDate, setEffectiveDate] = useState('2026-12-01');
  const [appliesTo, setAppliesTo] = useState('All areas');

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(priceInput);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      addToast({ type: 'error', title: 'Invalid price', message: 'Enter a valid price per kg in LKR.' });
      return;
    }

    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(effectiveDate));

    const newEntry: PriceEntry = {
      id: `P-0${prices.length + 1}`,
      effectiveFrom: formattedDate,
      pricePerKg: numericPrice,
      setBy: 'Sunil Jayawardena',
      changedOn: '14 Nov 2026',
      status: 'Scheduled',
    };

    setPrices((prev) => [newEntry, ...prev]);
    addToast({
      type: 'success',
      title: 'Tea Price Scheduled',
      message: `LKR ${numericPrice.toFixed(2)}/kg (${appliesTo}) effective ${formattedDate}.`,
    });
  };

  const renderStatus = (status: PriceEntry['status']) => {
    if (status === 'Current') {
      return (
        <span className="px-2.5 py-0.5 bg-[#E1F4E8] text-[#0B5D3B] rounded-full inline-flex items-center text-xs font-semibold">
          ✓ Current
        </span>
      );
    }
    if (status === 'Scheduled') {
      return (
        <span className="px-2.5 py-0.5 bg-[#FEF3C7] text-[#B45309] rounded-full inline-flex items-center text-xs font-semibold">
          Scheduled
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 bg-[#F1F5F9] text-[#56625B] rounded-full inline-flex items-center text-xs font-semibold">
        ● Past
      </span>
    );
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 font-['Inter',sans-serif]">
      <div className="flex flex-col gap-1">
        <h1 className="text-[#17201B] text-2xl sm:text-[26px] font-bold tracking-tight">
          Tea prices
        </h1>
        <p className="text-[#56625B] text-[13px]">
          Set prices by effective date. Past prices stay available for audit.
        </p>
      </div>

      {/* Top Card: Set a new price */}
      <form
        onSubmit={handleSavePrice}
        className="self-stretch p-6 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-5"
      >
        <h2 className="text-[#17201B] text-base font-bold">
          Set a new price
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="price-lkr" className="text-[#17201B] text-xs font-medium">
              Price per kg (LKR) *
            </label>
            <input
              id="price-lkr"
              type="number"
              step="0.01"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="h-11 px-3.5 bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#E1F4E8] text-sm text-[#17201B] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="effective-from" className="text-[#17201B] text-xs font-medium">
              Effective from *
            </label>
            <input
              id="effective-from"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="h-11 px-3.5 bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#E1F4E8] text-sm text-[#17201B] outline-none"
            />
            <span className="text-[#56625B] text-xs">
              Must be after the last finalized settlement.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="applies-to" className="text-[#17201B] text-xs font-medium">
              Applies to
            </label>
            <div className="relative">
              <select
                id="applies-to"
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value)}
                className="w-full h-11 px-3.5 pr-9 appearance-none bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] text-sm text-[#17201B] outline-none cursor-pointer"
              >
                <option value="All areas">All areas</option>
                <option value="Highland Block 03">Highland Block 03</option>
                <option value="Highland Block 04">Highland Block 04</option>
              </select>
              <ChevronDown className="size-4 text-[#56625B] pointer-events-none absolute right-3 top-3.5" />
            </div>
            <span className="text-[#56625B] text-xs">
              Pricing scope pending approval (SRS §8.1).
            </span>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPriceInput('255.00')}
            className="px-4 py-2 bg-white border border-[#DCE2DC] hover:bg-[#F4F6F3] text-[#17201B] rounded-lg text-sm font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0B5D3B] hover:bg-[#08472D] text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors"
          >
            Save price
          </button>
        </div>
      </form>

      {/* Bottom: Price history table */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[#17201B] text-base font-bold">
          Price history
        </h2>

        <div className="self-stretch bg-white rounded-xl border border-[#DCE2DC] overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[680px] text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F6F3] border-b border-[#DCE2DC] text-[#56625B] text-xs font-semibold">
                  <th className="py-3 px-5">Effective from</th>
                  <th className="py-3 px-4 text-right">Price (LKR/kg)</th>
                  <th className="py-3 px-4">Set by</th>
                  <th className="py-3 px-4">Changed on</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE2DC] text-[13px] text-[#17201B]">
                {prices.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F4F6F3]/60 transition-colors">
                    <td className="py-3 px-5 font-medium">{p.effectiveFrom}</td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums">{p.pricePerKg.toFixed(2)}</td>
                    <td className="py-3 px-4">{p.setBy}</td>
                    <td className="py-3 px-4 text-[#56625B]">{p.changedOn}</td>
                    <td className="py-3 px-5">{renderStatus(p.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

