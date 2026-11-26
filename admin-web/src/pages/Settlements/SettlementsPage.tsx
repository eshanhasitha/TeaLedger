import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { exportToCsv } from '../../utils/exportToCsv';

interface SettlementCycle {
  id: string;
  period: string;
  farmers: number;
  verifiedKg: number;
  grossLkr: string;
  netPayableLkr: string;
  finalizedOn: string;
  status: 'Draft' | 'Finalized';
}

interface SettlementFarmerRow {
  id: string;
  farmer: string;
  collectedKg: number;
  grossLkr: number;
  loanRepay: number;
  materials: number;
  netPayable: number;
  status: 'Ready' | 'Needs review';
}

const INITIAL_CYCLES: SettlementCycle[] = [
  { id: 'SET-2026-10', period: 'October 2026', farmers: 1428, verifiedKg: 98420, grossLkr: '9,842,000', netPayableLkr: '8,120,450', finalizedOn: '—', status: 'Draft' },
  { id: 'SET-2026-09', period: 'September 2026', farmers: 1420, verifiedKg: 94110, grossLkr: '9,411,000', netPayableLkr: '7,890,200', finalizedOn: '01 Oct 2026', status: 'Finalized' },
  { id: 'SET-2026-08', period: 'August 2026', farmers: 1412, verifiedKg: 91250, grossLkr: '9,125,000', netPayableLkr: '7,640,100', finalizedOn: '01 Sep 2026', status: 'Finalized' },
  { id: 'SET-2026-07', period: 'July 2026', farmers: 1405, verifiedKg: 89300, grossLkr: '8,930,000', netPayableLkr: '7,412,800', finalizedOn: '01 Aug 2026', status: 'Finalized' },
];

const REVIEW_ROWS: SettlementFarmerRow[] = [
  { id: 'F-01', farmer: 'Kamal Perera (F-104)', collectedKg: 142.5, grossLkr: 35625, loanRepay: 5000, materials: 1800, netPayable: 28825, status: 'Ready' },
  { id: 'F-02', farmer: 'Sunil Fernando (F-108)', collectedKg: 98.0, grossLkr: 24500, loanRepay: 2500, materials: 0, netPayable: 22000, status: 'Ready' },
  { id: 'F-03', farmer: 'Priya Kumari (F-112)', collectedKg: 164.0, grossLkr: 41000, loanRepay: 4000, materials: 2200, netPayable: 34800, status: 'Needs review' },
  { id: 'F-04', farmer: 'Ajith Bandara (F-119)', collectedKg: 112.0, grossLkr: 28000, loanRepay: 0, materials: 1500, netPayable: 26500, status: 'Ready' },
  { id: 'F-05', farmer: 'Nimali Jayaweera (F-125)', collectedKg: 88.5, grossLkr: 22125, loanRepay: 3000, materials: 950, netPayable: 18175, status: 'Needs review' },
];

export const SettlementsPage: React.FC = () => {
  const { addToast } = useDashboard();
  const [cycles, setCycles] = useState<SettlementCycle[]>(INITIAL_CYCLES);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || null;

  const handleFinalize = () => {
    if (!selectedCycle) return;
    setCycles((prev) =>
      prev.map((c) =>
        c.id === selectedCycle.id
          ? { ...c, status: 'Finalized', finalizedOn: '14 Nov 2026' }
          : c
      )
    );
    setIsConfirmModalOpen(false);
    addToast({
      type: 'success',
      title: 'Settlement Finalized',
      message: `${selectedCycle.period} settlement posted to ${selectedCycle.farmers.toLocaleString()} farmer passbooks.`,
    });
  };

  // A2: Settlement Review View
  if (selectedCycle) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 font-['Inter',sans-serif]">
        {/* Top back link */}
        <div>
          <button
            type="button"
            onClick={() => setSelectedCycleId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#56625B] hover:text-[#17201B] cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Back to Settlements
          </button>
        </div>

        {/* Header */}
        <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <h1 className="text-[#17201B] text-2xl sm:text-[26px] font-bold tracking-tight">
              {selectedCycle.period} settlement
            </h1>
            <p className="text-[#56625B] text-[13px]">
              Review farmer settlements before finalizing. Totals reconcile to verified collections.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
              {selectedCycle.status === 'Draft' ? (
                <span className="px-2.5 py-0.5 bg-[#FEF3C7] text-[#B45309] rounded-full text-xs font-semibold">
                  ⟳ Draft · awaiting approval
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-[#E1F4E8] text-[#0B5D3B] rounded-full text-xs font-semibold">
                  ✓ Finalized
                </span>
              )}
              <span className="text-[#56625B] text-xs">
                Calculated 31 Oct 2026, 18:00 · {selectedCycle.status === 'Draft' ? 'Not yet posted to passbooks' : `Posted ${selectedCycle.finalizedOn}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                exportToCsv(`${selectedCycle.id}-review.csv`, REVIEW_ROWS);
                addToast({ type: 'success', title: 'CSV Exported', message: 'Settlement review exported.' });
              }}
              className="px-4 py-2.5 bg-white border border-[#DCE2DC] hover:bg-[#F4F6F3] text-[#17201B] rounded-lg text-sm font-semibold cursor-pointer transition-colors"
            >
              Export CSV
            </button>
            {selectedCycle.status === 'Draft' && (
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                className="px-4 py-2.5 bg-[#0B5D3B] hover:bg-[#08472D] text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors"
              >
                Finalize settlement
              </button>
            )}
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-1">
            <div className="text-[#56625B] text-xs font-medium">Farmers included</div>
            <div className="text-[#17201B] text-2xl sm:text-[28px] font-bold">{selectedCycle.farmers.toLocaleString()}</div>
            <div className="text-[#56625B] text-xs">3 need review</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-1">
            <div className="text-[#56625B] text-xs font-medium">Verified weight</div>
            <div className="text-[#17201B] text-2xl sm:text-[28px] font-bold">{selectedCycle.verifiedKg.toLocaleString()} kg</div>
            <div className="text-[#56625B] text-xs">Oct 1–31, 2026</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-1">
            <div className="text-[#56625B] text-xs font-medium">Gross earnings</div>
            <div className="text-[#17201B] text-2xl sm:text-[28px] font-bold">LKR 9.84M</div>
            <div className="text-[#56625B] text-xs">98,420 kg × price per rule</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-1">
            <div className="text-[#56625B] text-xs font-medium">Net payable</div>
            <div className="text-[#17201B] text-2xl sm:text-[28px] font-bold">LKR 8.12M</div>
            <div className="text-[#56625B] text-xs">After loans and materials</div>
          </div>
        </div>

        {/* Green Info Banner */}
        <div className="px-4 py-3 rounded-xl bg-[#E1F4E8] border border-[#0B5D3B]/20 text-[#0B5D3B] text-xs sm:text-[13px] flex items-center gap-2.5">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>
            Reconciled: gross earnings equal verified collections multiplied by the applicable price. Settlement formula is a placeholder until approved (SRS §8.1).
          </span>
        </div>

        {/* Table */}
        <div className="self-stretch bg-white rounded-xl border border-[#DCE2DC] overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[780px] text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F6F3] border-b border-[#DCE2DC] text-[#56625B] text-xs font-semibold">
                  <th className="py-3 px-5">Farmer</th>
                  <th className="py-3 px-4 text-right">Collected (kg)</th>
                  <th className="py-3 px-4 text-right">Gross (LKR)</th>
                  <th className="py-3 px-4 text-right">Loan repay</th>
                  <th className="py-3 px-4 text-right">Materials</th>
                  <th className="py-3 px-4 text-right">Net payable</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE2DC] text-[13px] text-[#17201B]">
                {REVIEW_ROWS.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F4F6F3]/60 transition-colors">
                    <td className="py-3 px-5 font-medium">{row.farmer}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{row.collectedKg.toFixed(1)}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{row.grossLkr.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{row.loanRepay.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{row.materials.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums">{row.netPayable.toLocaleString()}</td>
                    <td className="py-3 px-5">
                      {row.status === 'Ready' ? (
                        <span className="px-2.5 py-0.5 bg-[#E1F4E8] text-[#0B5D3B] rounded-full text-xs font-semibold">
                          ✓ Ready
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-[#FEF2F2] text-[#B91C1C] rounded-full text-xs font-semibold">
                          ! Needs review
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 flex justify-between items-center border-t border-[#DCE2DC] bg-white">
            <span className="text-[#56625B] text-xs">Showing 1–5 of {selectedCycle.farmers.toLocaleString()}</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled className="px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-xs font-semibold opacity-40">Previous</button>
              <button type="button" className="px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-xs font-semibold hover:bg-[#F4F6F3] cursor-pointer">Next</button>
            </div>
          </div>
        </div>

        {/* A3: Confirm Finalize Modal */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-[460px] bg-white rounded-xl border border-[#DCE2DC] p-6 flex flex-col gap-4 shadow-xl">
              <h3 className="text-[#17201B] text-lg font-bold">
                Finalize {selectedCycle.period} settlement?
              </h3>
              <p className="text-[#56625B] text-sm leading-relaxed">
                This posts {selectedCycle.farmers.toLocaleString()} settlement records to farmer passbooks. Finalized settlements cannot be edited; corrections need an approved adjustment.
              </p>
              <div className="p-3 rounded-lg bg-[#FEF2F2] border border-rose-200 text-[#B91C1C] text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>3 farmers still need review. Resolve them before finalizing.</span>
              </div>
              <div className="flex justify-end items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#DCE2DC] hover:bg-[#F4F6F3] text-[#17201B] rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalize}
                  className="px-4 py-2 bg-[#0B5D3B] hover:bg-[#08472D] text-white rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Finalize {selectedCycle.farmers.toLocaleString()} records
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // A13: Settlements History List
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 font-['Inter',sans-serif]">
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#17201B] text-2xl sm:text-[26px] font-bold tracking-tight">
            Settlements
          </h1>
          <p className="text-[#56625B] text-[13px]">
            Monthly settlement history and review
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            exportToCsv('tealedger-settlements.csv', cycles);
            addToast({ type: 'success', title: 'Settlements Exported', message: 'Settlement history exported to CSV.' });
          }}
          className="px-4 py-2.5 bg-white border border-[#DCE2DC] hover:bg-[#F4F6F3] text-[#17201B] rounded-lg text-sm font-semibold cursor-pointer transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="self-stretch bg-white rounded-xl border border-[#DCE2DC] overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[780px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F6F3] border-b border-[#DCE2DC] text-[#56625B] text-xs font-semibold">
                <th className="py-3 px-5">Period</th>
                <th className="py-3 px-4 text-right">Farmers</th>
                <th className="py-3 px-4 text-right">Verified (kg)</th>
                <th className="py-3 px-4 text-right">Gross (LKR)</th>
                <th className="py-3 px-4 text-right">Net payable (LKR)</th>
                <th className="py-3 px-4">Finalized on</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE2DC] text-[13px] text-[#17201B]">
              {cycles.map((cycle) => (
                <tr
                  key={cycle.id}
                  onClick={() => setSelectedCycleId(cycle.id)}
                  className="hover:bg-[#F4F6F3]/60 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-5 font-semibold text-[#0B5D3B] hover:underline">{cycle.period}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{cycle.farmers.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{cycle.verifiedKg.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{cycle.grossLkr}</td>
                  <td className="py-3 px-4 text-right font-semibold tabular-nums">{cycle.netPayableLkr}</td>
                  <td className="py-3 px-4 text-[#56625B]">{cycle.finalizedOn}</td>
                  <td className="py-3 px-5">
                    {cycle.status === 'Draft' ? (
                      <span className="px-2.5 py-0.5 bg-[#FEF3C7] text-[#B45309] rounded-full text-xs font-semibold">
                        ⟳ Draft
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-[#E1F4E8] text-[#0B5D3B] rounded-full text-xs font-semibold">
                        ✓ Finalized
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex justify-between items-center border-t border-[#DCE2DC] bg-white">
          <span className="text-[#56625B] text-xs">Showing 1–{cycles.length} of 12</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled className="px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-xs font-semibold opacity-40">Previous</button>
            <button type="button" className="px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-xs font-semibold hover:bg-[#F4F6F3] cursor-pointer">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

