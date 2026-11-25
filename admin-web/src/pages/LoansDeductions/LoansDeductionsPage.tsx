import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, Info } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

interface LoanItem {
  id: string;
  farmer: string;
  principal: number;
  repaid: number;
  outstanding: number;
  nextRepayment: string;
  status: 'Active' | 'Overdue' | 'Repaid';
}

interface DeductionItem {
  ref: string;
  farmer: string;
  category: 'Materials' | 'Loan repayment' | 'Other';
  amount: number;
  date: string;
  postedBy: string;
  status: 'Posted' | 'Reversed';
}

const INITIAL_LOANS: LoanItem[] = [
  { id: 'LN-2041', farmer: 'Kamal Perera (F-104)', principal: 40000, repaid: 15000, outstanding: 25000, nextRepayment: 'Nov 2026', status: 'Active' },
  { id: 'LN-2038', farmer: 'Sunil Fernando (F-108)', principal: 25000, repaid: 10000, outstanding: 15000, nextRepayment: 'Nov 2026', status: 'Overdue' },
  { id: 'LN-2034', farmer: 'Priya Kumari (F-112)', principal: 30000, repaid: 30000, outstanding: 0, nextRepayment: '—', status: 'Repaid' },
  { id: 'LN-2029', farmer: 'Ajith Bandara (F-119)', principal: 50000, repaid: 20000, outstanding: 30000, nextRepayment: 'Nov 2026', status: 'Active' },
];

const INITIAL_DEDUCTIONS: DeductionItem[] = [
  { ref: 'D-5020', farmer: 'Kamal Perera (F-104)', category: 'Materials', amount: 1800, date: '14 Nov 2026', postedBy: 'Sunil Jayawardena', status: 'Posted' },
  { ref: 'D-5019', farmer: 'Sunil Fernando (F-108)', category: 'Loan repayment', amount: 2500, date: '13 Nov 2026', postedBy: 'Sunil Jayawardena', status: 'Posted' },
  { ref: 'D-5018', farmer: 'Priya Kumari (F-112)', category: 'Other', amount: 950, date: '12 Nov 2026', postedBy: 'Sunil Jayawardena', status: 'Reversed' },
  { ref: 'D-5017', farmer: 'Ajith Bandara (F-119)', category: 'Materials', amount: 1500, date: '11 Nov 2026', postedBy: 'Sunil Jayawardena', status: 'Posted' },
];

export const LoansDeductionsPage: React.FC = () => {
  const { addToast } = useDashboard();
  const [subTab, setSubTab] = useState<'loans' | 'deductions'>('loans');
  const [viewMode, setViewMode] = useState<'list' | 'create-loan' | 'add-deduction'>('list');

  const [loans, setLoans] = useState<LoanItem[]>(INITIAL_LOANS);
  const [deductions, setDeductions] = useState<DeductionItem[]>(INITIAL_DEDUCTIONS);

  // Deductions filters
  const [deductionSearch, setDeductionSearch] = useState('');
  const [deductionCategory, setDeductionCategory] = useState<'All' | 'Materials' | 'Loan repayment' | 'Other'>('All');

  // Create Loan form state (A10)
  const [loanFarmer, setLoanFarmer] = useState('Kamal Perera (F-104)');
  const [loanType, setLoanType] = useState('Fertilizer advance');
  const [firstMonth, setFirstMonth] = useState('Nov 2026');
  const [principalInput, setPrincipalInput] = useState('40000');
  const [monthlyInput, setMonthlyInput] = useState('5000');
  const [loanNotes, setLoanNotes] = useState('');

  // Add Deduction form state (A12)
  const [dedFarmer, setDedFarmer] = useState('Kamal Perera (F-104)');
  const [dedCategory, setDedCategory] = useState<'Materials (fertilizer)' | 'Loan repayment' | 'Other'>('Materials (fertilizer)');
  const [dedAmount, setDedAmount] = useState('1800');
  const [dedDate, setDedDate] = useState('2026-11-14');
  const [dedReason, setDedReason] = useState('');

  const filteredDeductions = useMemo(() => {
    const q = deductionSearch.toLowerCase().trim();
    return deductions.filter((d) => {
      const matchesSearch =
        !q || d.farmer.toLowerCase().includes(q) || d.ref.toLowerCase().includes(q);
      const matchesCategory = deductionCategory === 'All' || d.category === deductionCategory;
      return matchesSearch && matchesCategory;
    });
  }, [deductions, deductionSearch, deductionCategory]);

  // A10: Create Loan Form
  if (viewMode === 'create-loan') {
    const principalNum = Math.max(0, Number(principalInput) || 0);
    const monthlyNum = Math.max(1, Number(monthlyInput) || 1);
    const estMonths = Math.ceil(principalNum / monthlyNum);

    const handleCreateLoan = (e: React.FormEvent) => {
      e.preventDefault();
      const newLoan: LoanItem = {
        id: `LN-${2042 + loans.length}`,
        farmer: loanFarmer,
        principal: principalNum,
        repaid: 0,
        outstanding: principalNum,
        nextRepayment: firstMonth,
        status: 'Active',
      };
      setLoans((prev) => [newLoan, ...prev]);
      setViewMode('list');
      setSubTab('loans');
      addToast({
        type: 'success',
        title: 'Loan Created',
        message: `Recorded ${loanType} of LKR ${principalNum.toLocaleString()} for ${loanFarmer}.`,
      });
    };

    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 font-['Inter',sans-serif]">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#17201B] text-2xl sm:text-[26px] font-bold tracking-tight">Create loan</h1>
          <p className="text-[#56625B] text-[13px]">Record an advance for a farmer</p>
        </div>

        <form onSubmit={handleCreateLoan} className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left: Loan details (~65%) */}
          <div className="lg:col-span-2 p-6 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-5">
            <h2 className="text-[#17201B] text-base font-bold">Loan details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#17201B] text-xs font-medium">Farmer *</label>
                <div className="relative">
                  <select
                    value={loanFarmer}
                    onChange={(e) => setLoanFarmer(e.target.value)}
                    className="w-full h-11 px-3.5 pr-9 appearance-none bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] text-sm text-[#17201B] outline-none cursor-pointer"
                  >
                    <option value="Kamal Perera (F-104)">Kamal Perera (F-104)</option>
                    <option value="Sunil Fernando (F-108)">Sunil Fernando (F-108)</option>
                    <option value="Priya Kumari (F-112)">Priya Kumari (F-112)</option>
                  </select>
                  <ChevronDown className="size-4 text-[#56625B] pointer-events-none absolute right-3 top-3.5" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#17201B] text-xs font-medium">Loan type *</label>
                <div className="relative">
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    className="w-full h-11 px-3.5 pr-9 appearance-none bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] text-sm text-[#17201B] outline-none cursor-pointer"
                  >
                    <option value="Fertilizer advance">Fertilizer advance</option>
                    <option value="Cash advance">Cash advance</option>
                    <option value="Equipment advance">Equipment advance</option>
                  </select>
                  <ChevronDown className="size-4 text-[#56625B] pointer-events-none absolute right-3 top-3.5" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#17201B] text-xs font-medium">First repayment month *</label>
                <input
                  type="text"
                  value={firstMonth}
                  onChange={(e) => setFirstMonth(e.target.value)}
                  className="h-11 px-3.5 bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] text-sm text-[#17201B] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#17201B] text-xs font-medium">Principal (LKR) *</label>
                <input
                  type="number"
                  value={principalInput}
                  onChange={(e) => setPrincipalInput(e.target.value)}
                  className="h-11 px-3.5 bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] text-sm text-[#17201B] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#17201B] text-xs font-medium">Monthly repayment (LKR) *</label>
                <input
                  type="number"
                  value={monthlyInput}
                  onChange={(e) => setMonthlyInput(e.target.value)}
                  className="h-11 px-3.5 bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] text-sm text-[#17201B] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#17201B] text-xs font-medium">Notes (optional)</label>
                <input
                  type="text"
                  value={loanNotes}
                  onChange={(e) => setLoanNotes(e.target.value)}
                  placeholder="Optional reference note"
                  className="h-11 px-3.5 bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] text-sm text-[#17201B] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2 bg-white border border-[#DCE2DC] hover:bg-[#F4F6F3] text-[#17201B] rounded-lg text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0B5D3B] hover:bg-[#08472D] text-white rounded-lg text-sm font-semibold cursor-pointer"
              >
                Create loan
              </button>
            </div>
          </div>

          {/* Right: Loan summary (~35%) */}
          <div className="p-6 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-4">
            <h2 className="text-[#17201B] text-base font-bold">Loan summary</h2>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#56625B]">Principal</span>
                <span className="font-semibold text-[#17201B] tabular-nums">LKR {principalNum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#56625B]">Monthly repayment</span>
                <span className="font-semibold text-[#17201B] tabular-nums">LKR {monthlyNum.toLocaleString()}</span>
              </div>
              <div className="pt-2.5 border-t border-[#DCE2DC] flex justify-between">
                <span className="text-[#56625B]">Estimated duration</span>
                <span className="font-bold text-[#17201B]">{estMonths} months</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#FEF3C7] text-[#B45309] text-xs leading-relaxed">
              Interest, fees and repayment order are pending approval (SRS §8.1). This loan is recorded without interest.
            </div>
          </div>
        </form>
      </div>
    );
  }

  // A12: Add Deduction Form
  if (viewMode === 'add-deduction') {
    const amountNum = Math.max(0, Number(dedAmount) || 0);
    const estBefore = 53500;
    const estAfter = Math.max(0, estBefore - amountNum);

    const handlePostDeduction = (e: React.FormEvent) => {
      e.preventDefault();
      const normalizedCat: DeductionItem['category'] =
        dedCategory.startsWith('Materials')
          ? 'Materials'
          : dedCategory === 'Loan repayment'
          ? 'Loan repayment'
          : 'Other';

      const newDed: DeductionItem = {
        ref: `D-${5021 + deductions.length}`,
        farmer: dedFarmer,
        category: normalizedCat,
        amount: amountNum,
        date: '14 Nov 2026',
        postedBy: 'Sunil Jayawardena',
        status: 'Posted',
      };
      setDeductions((prev) => [newDed, ...prev]);
      setViewMode('list');
      setSubTab('deductions');
      addToast({
        type: 'success',
        title: 'Deduction Posted',
        message: `Posted LKR ${amountNum.toLocaleString()} (${normalizedCat}) for ${dedFarmer}.`,
      });
    };

    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 font-['Inter',sans-serif]">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#17201B] text-2xl sm:text-[26px] font-bold tracking-tight">Add deduction</h1>
          <p className="text-[#56625B] text-[13px]">Apply a deduction to a farmer&apos;s account</p>
        </div>

        <form onSubmit={handlePostDeduction} className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left: Deduction details */}
          <div className="lg:col-span-2 p-6 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-5">
            <h2 className="text-[#17201B] text-base font-bold">Deduction details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#17201B] text-xs font-medium">Farmer *</label>
                <div className="relative">
                  <select
                    value={dedFarmer}
                    onChange={(e) => setDedFarmer(e.target.value)}
                    className="w-full h-11 px-3.5 pr-9 appearance-none bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] text-sm text-[#17201B] outline-none cursor-pointer"
                  >
                    <option value="Kamal Perera (F-104)">Kamal Perera (F-104)</option>
                    <option value="Sunil Fernando (F-108)">Sunil Fernando (F-108)</option>
                    <option value="Priya Kumari (F-112)">Priya Kumari (F-112)</option>
                  </select>
                  <ChevronDown className="size-4 text-[#56625B] pointer-events-none absolute right-3 top-3.5" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#17201B] text-xs font-medium">Category *</label>
                <div className="relative">
                  <select
                    value={dedCategory}
                    onChange={(e) => setDedCategory(e.target.value as typeof dedCategory)}
                    className="w-full h-11 px-3.5 pr-9 appearance-none bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] text-sm text-[#17201B] outline-none cursor-pointer"
                  >
                    <option value="Materials (fertilizer)">Materials (fertilizer)</option>
                    <option value="Loan repayment">Loan repayment</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="size-4 text-[#56625B] pointer-events-none absolute right-3 top-3.5" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#17201B] text-xs font-medium">Amount (LKR) *</label>
                <input
                  type="number"
                  value={dedAmount}
                  onChange={(e) => setDedAmount(e.target.value)}
                  className="h-11 px-3.5 bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] text-sm text-[#17201B] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#17201B] text-xs font-medium">Date *</label>
                <input
                  type="date"
                  value={dedDate}
                  onChange={(e) => setDedDate(e.target.value)}
                  className="h-11 px-3.5 bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] text-sm text-[#17201B] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#17201B] text-xs font-medium">Reference</label>
                <input
                  type="text"
                  disabled
                  value="D-5021"
                  className="h-11 px-3.5 bg-[#F4F6F3] rounded-lg border border-[#DCE2DC] text-sm text-[#56625B] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#17201B] text-xs font-medium">Reason (optional)</label>
                <input
                  type="text"
                  value={dedReason}
                  onChange={(e) => setDedReason(e.target.value)}
                  placeholder="Optional reason"
                  className="h-11 px-3.5 bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] text-sm text-[#17201B] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2 bg-white border border-[#DCE2DC] hover:bg-[#F4F6F3] text-[#17201B] rounded-lg text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0B5D3B] hover:bg-[#08472D] text-white rounded-lg text-sm font-semibold cursor-pointer"
              >
                Post deduction
              </button>
            </div>
          </div>

          {/* Right: Effect on settlement */}
          <div className="p-6 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-4">
            <h2 className="text-[#17201B] text-base font-bold">Effect on settlement</h2>
            <p className="text-[#56625B] text-xs">Applies to the October 2026 settlement (draft).</p>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#56625B]">Estimated net before</span>
                <span className="font-semibold text-[#17201B] tabular-nums">LKR {estBefore.toLocaleString()}</span>
              </div>
              <div className="pt-2.5 border-t border-[#DCE2DC] flex justify-between">
                <span className="text-[#56625B]">Estimated net after</span>
                <span className="font-bold text-[#17201B] tabular-nums">LKR {estAfter.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] text-xs leading-relaxed flex items-start gap-2">
              <Info className="size-4 shrink-0 mt-0.5" />
              <span>Posted deductions can be reversed but not deleted. This action is recorded in the audit log.</span>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // A9 (Loans) & A11 (Deductions) List Views
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#17201B] text-2xl sm:text-[26px] font-bold tracking-tight">
            Loans &amp; deductions
          </h1>
          <p className="text-[#56625B] text-[13px]">
            Track loans, repayments and deductions applied to settlements
          </p>
        </div>

        <button
          type="button"
          onClick={() => setViewMode(subTab === 'loans' ? 'create-loan' : 'add-deduction')}
          className="px-4 py-2.5 bg-[#0B5D3B] hover:bg-[#08472D] text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors"
        >
          {subTab === 'loans' ? 'Create loan' : 'Add deduction'}
        </button>
      </div>

      {/* Sub-tabs: Loans / Deductions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSubTab('loans')}
          className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
            subTab === 'loans'
              ? 'bg-[#0B5D3B] text-white'
              : 'bg-white border border-[#DCE2DC] text-[#56625B] hover:text-[#17201B]'
          }`}
        >
          Loans
        </button>
        <button
          type="button"
          onClick={() => setSubTab('deductions')}
          className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
            subTab === 'deductions'
              ? 'bg-[#0B5D3B] text-white'
              : 'bg-white border border-[#DCE2DC] text-[#56625B] hover:text-[#17201B]'
          }`}
        >
          Deductions
        </button>
      </div>

      {subTab === 'loans' ? (
        <>
          {/* 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-1">
              <div className="text-[#56625B] text-xs font-medium">Active loans</div>
              <div className="text-[#17201B] text-2xl sm:text-[28px] font-bold">212</div>
              <div className="text-[#56625B] text-xs">Across 1,428 farmers</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-1">
              <div className="text-[#56625B] text-xs font-medium">Outstanding (LKR)</div>
              <div className="text-[#17201B] text-2xl sm:text-[28px] font-bold">6.4M</div>
              <div className="text-[#56625B] text-xs">As of 14 Nov 2026</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#DCE2DC] flex flex-col gap-1">
              <div className="text-[#56625B] text-xs font-medium">Repaid this month (LKR)</div>
              <div className="text-[#17201B] text-2xl sm:text-[28px] font-bold">0.9M</div>
              <div className="text-[#56625B] text-xs">Posted repayments</div>
            </div>
          </div>

          {/* Loans Table */}
          <div className="self-stretch bg-white rounded-xl border border-[#DCE2DC] overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F6F3] border-b border-[#DCE2DC] text-[#56625B] text-xs font-semibold">
                    <th className="py-3 px-5">Loan</th>
                    <th className="py-3 px-4">Farmer</th>
                    <th className="py-3 px-4 text-right">Principal</th>
                    <th className="py-3 px-4 text-right">Repaid</th>
                    <th className="py-3 px-4 text-right">Outstanding</th>
                    <th className="py-3 px-4">Next repayment</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE2DC] text-[13px] text-[#17201B]">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-[#F4F6F3]/60 transition-colors">
                      <td className="py-3 px-5 font-medium">{loan.id}</td>
                      <td className="py-3 px-4">{loan.farmer}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{loan.principal.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{loan.repaid.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-semibold tabular-nums">{loan.outstanding.toLocaleString()}</td>
                      <td className="py-3 px-4 text-[#56625B]">{loan.nextRepayment}</td>
                      <td className="py-3 px-5">
                        {loan.status === 'Active' && (
                          <span className="px-2.5 py-0.5 bg-[#F1F5F9] text-[#56625B] rounded-full text-xs font-semibold">
                            ● Active
                          </span>
                        )}
                        {loan.status === 'Overdue' && (
                          <span className="px-2.5 py-0.5 bg-[#FEF2F2] text-[#B91C1C] rounded-full text-xs font-semibold">
                            ! Overdue
                          </span>
                        )}
                        {loan.status === 'Repaid' && (
                          <span className="px-2.5 py-0.5 bg-[#E1F4E8] text-[#0B5D3B] rounded-full text-xs font-semibold">
                            ✓ Repaid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 flex justify-between items-center border-t border-[#DCE2DC] bg-white">
              <span className="text-[#56625B] text-xs">Showing 1–{loans.length} of 212</span>
              <div className="flex items-center gap-2">
                <button type="button" disabled className="px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-xs font-semibold opacity-40">Previous</button>
                <button type="button" className="px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-xs font-semibold hover:bg-[#F4F6F3] cursor-pointer">Next</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Deductions Search & Category Filter Pills */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex-1 px-3.5 py-2.5 bg-white rounded-lg border border-[#DCE2DC] flex items-center gap-2 focus-within:border-[#0B5D3B] focus-within:ring-2 focus-within:ring-[#E1F4E8]">
              <Search className="size-4 text-[#56625B] shrink-0" />
              <input
                type="text"
                value={deductionSearch}
                onChange={(e) => setDeductionSearch(e.target.value)}
                placeholder="Search by farmer or reference"
                className="flex-1 text-[#17201B] placeholder:text-[#56625B] text-sm bg-transparent outline-none"
              />
              {deductionSearch && (
                <button
                  type="button"
                  onClick={() => setDeductionSearch('')}
                  className="text-[#56625B] hover:text-[#17201B] p-0.5 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 overflow-x-auto">
              {(['All', 'Materials', 'Loan repayment', 'Other'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setDeductionCategory(cat)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    deductionCategory === cat
                      ? 'bg-[#0B5D3B] text-white'
                      : 'bg-white border border-[#DCE2DC] text-[#56625B] hover:text-[#17201B]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Deductions Table */}
          <div className="self-stretch bg-white rounded-xl border border-[#DCE2DC] overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F6F3] border-b border-[#DCE2DC] text-[#56625B] text-xs font-semibold">
                    <th className="py-3 px-5">Ref</th>
                    <th className="py-3 px-4">Farmer</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Amount (LKR)</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Posted by</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE2DC] text-[13px] text-[#17201B]">
                  {filteredDeductions.map((ded) => (
                    <tr key={ded.ref} className="hover:bg-[#F4F6F3]/60 transition-colors">
                      <td className="py-3 px-5 font-medium">{ded.ref}</td>
                      <td className="py-3 px-4">{ded.farmer}</td>
                      <td className="py-3 px-4">{ded.category}</td>
                      <td className="py-3 px-4 text-right font-semibold tabular-nums">{ded.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-[#56625B]">{ded.date}</td>
                      <td className="py-3 px-4">{ded.postedBy}</td>
                      <td className="py-3 px-5">
                        {ded.status === 'Posted' ? (
                          <span className="px-2.5 py-0.5 bg-[#E1F4E8] text-[#0B5D3B] rounded-full text-xs font-semibold">
                            ✓ Posted
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-[#F1F5F9] text-[#56625B] rounded-full text-xs font-semibold">
                            ● Reversed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 flex justify-between items-center border-t border-[#DCE2DC] bg-white">
              <span className="text-[#56625B] text-xs">Showing 1–{filteredDeductions.length} of 96</span>
              <div className="flex items-center gap-2">
                <button type="button" disabled className="px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-xs font-semibold opacity-40">Previous</button>
                <button type="button" className="px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-xs font-semibold hover:bg-[#F4F6F3] cursor-pointer">Next</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

