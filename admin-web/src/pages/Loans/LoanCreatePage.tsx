import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { farmerService, INITIAL_FARMERS } from '../../services/farmerService';
import { loanService } from '../../services/loanService';
import type { Farmer } from '../../types/farmer.types';

const LOAN_TYPES = [
  'Fertilizer advance',
  'Cash advance',
  'Equipment loan',
  'Emergency loan',
];

const REPAYMENT_MONTHS = [
  'Nov 2026',
  'Dec 2026',
  'Jan 2027',
  'Feb 2027',
];

export const LoanCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useDashboard();

  const [farmers, setFarmers] = useState<Farmer[]>(INITIAL_FARMERS);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(INITIAL_FARMERS[0].id);
  const [loanType, setLoanType] = useState<string>('Fertilizer advance');
  const [firstRepaymentMonth, setFirstRepaymentMonth] = useState<string>('Nov 2026');
  const [principalInput, setPrincipalInput] = useState<string>('40000');
  const [monthlyRepaymentInput, setMonthlyRepaymentInput] = useState<string>('5000');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    farmerService
      .getFarmers({ page: 1, pageSize: 50 })
      .then((res) => {
        if (!ignore && res.items.length > 0) {
          setFarmers(res.items);
          setSelectedFarmerId(res.items[0].id);
        }
      })
      .catch(() => {
        /* fallback to initial farmers */
      });

    return () => {
      ignore = true;
    };
  }, []);

  const principalValue = Math.max(0, Number(principalInput.replace(/,/g, '')) || 0);
  const monthlyRepaymentValue = Math.max(0, Number(monthlyRepaymentInput.replace(/,/g, '')) || 0);
  const estimatedMonths =
    principalValue > 0 && monthlyRepaymentValue > 0
      ? Math.ceil(principalValue / monthlyRepaymentValue)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (principalValue <= 0) {
      setErrorMessage('Please enter a valid positive principal amount.');
      return;
    }

    if (monthlyRepaymentValue <= 0) {
      setErrorMessage('Please enter a valid positive monthly repayment amount.');
      return;
    }

    const farmer = farmers.find((f) => f.id === selectedFarmerId);
    setIsSubmitting(true);

    try {
      const combinedNotes = [
        `${loanType} (First repayment: ${firstRepaymentMonth}, Monthly: LKR ${monthlyRepaymentValue.toLocaleString()})`,
        notes.trim(),
      ]
        .filter(Boolean)
        .join(' — ');

      const created = await loanService.createLoan({
        farmerId: selectedFarmerId,
        farmerName: farmer?.name || 'Farmer',
        principalAmount: principalValue,
        notes: combinedNotes,
      });

      addToast({
        type: 'success',
        title: `Loan ${created.loanCode} Created`,
        message: `LKR ${principalValue.toLocaleString()} issued to ${created.farmerName}.`,
      });

      navigate('/deductions');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create farmer loan.';
      setErrorMessage(msg);
      addToast({
        type: 'error',
        title: 'Loan Creation Failed',
        message: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-start gap-6 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="self-stretch flex flex-col justify-start items-start gap-1 overflow-hidden">
        <h1 className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter'] tracking-tight">
          Create loan
        </h1>
        <div className="self-stretch justify-start text-text-secondary text-xs sm:text-sm font-normal font-['Inter']">
          Record an advance for a farmer
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="self-stretch rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="size-4 sm:size-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Two-Column Content */}
      <div className="self-stretch flex flex-col lg:flex-row justify-start items-start gap-5 overflow-hidden">
        {/* Left Card: Loan Details Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 w-full p-6 sm:p-7 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-5 overflow-hidden shadow-xs"
        >
          <h2 className="self-stretch justify-start text-text-primary text-lg font-bold font-['Inter']">
            Loan details
          </h2>

          {/* Farmer * */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label
              htmlFor="loan-farmer"
              className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
            >
              Farmer *
            </label>
            <div className="relative self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-between items-center overflow-hidden">
              <select
                id="loan-farmer"
                value={selectedFarmerId}
                onChange={(e) => setSelectedFarmerId(e.target.value)}
                className="w-full appearance-none bg-transparent text-text-primary text-sm sm:text-base font-medium font-['Inter'] border-none outline-none cursor-pointer pr-6 focus:ring-0"
              >
                {farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} · ID {f.id}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-4 text-text-secondary pointer-events-none absolute right-3.5" />
            </div>
          </div>

          {/* Row: Loan type & First repayment month */}
          <div className="self-stretch flex flex-col sm:flex-row justify-start items-start gap-5 overflow-hidden">
            <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
              <label
                htmlFor="loan-type"
                className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
              >
                Loan type *
              </label>
              <div className="relative self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-between items-center overflow-hidden">
                <select
                  id="loan-type"
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="w-full appearance-none bg-transparent text-text-primary text-sm sm:text-base font-medium font-['Inter'] border-none outline-none cursor-pointer pr-6 focus:ring-0"
                >
                  {LOAN_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="size-4 text-text-secondary pointer-events-none absolute right-3.5" />
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
              <label
                htmlFor="loan-repayment-month"
                className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
              >
                First repayment month *
              </label>
              <div className="relative self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-between items-center overflow-hidden">
                <select
                  id="loan-repayment-month"
                  value={firstRepaymentMonth}
                  onChange={(e) => setFirstRepaymentMonth(e.target.value)}
                  className="w-full appearance-none bg-transparent text-text-primary text-sm sm:text-base font-medium font-['Inter'] border-none outline-none cursor-pointer pr-6 focus:ring-0"
                >
                  {REPAYMENT_MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="size-4 text-text-secondary pointer-events-none absolute right-3.5" />
              </div>
            </div>
          </div>

          {/* Row: Principal & Monthly repayment */}
          <div className="self-stretch flex flex-col sm:flex-row justify-start items-start gap-5 overflow-hidden">
            <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
              <label
                htmlFor="loan-principal"
                className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
              >
                Principal (LKR) *
              </label>
              <div className="self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-start items-center overflow-hidden">
                <input
                  id="loan-principal"
                  type="number"
                  min="1"
                  step="100"
                  required
                  value={principalInput}
                  onChange={(e) => setPrincipalInput(e.target.value)}
                  className="flex-1 justify-start text-text-primary text-sm sm:text-base font-medium font-['Inter'] bg-transparent border-none outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
              <label
                htmlFor="loan-monthly-repayment"
                className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
              >
                Monthly repayment (LKR) *
              </label>
              <div className="self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-start items-center overflow-hidden">
                <input
                  id="loan-monthly-repayment"
                  type="number"
                  min="1"
                  step="100"
                  required
                  value={monthlyRepaymentInput}
                  onChange={(e) => setMonthlyRepaymentInput(e.target.value)}
                  className="flex-1 justify-start text-text-primary text-sm sm:text-base font-medium font-['Inter'] bg-transparent border-none outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Notes (optional) */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label
              htmlFor="loan-notes"
              className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
            >
              Notes (optional)
            </label>
            <div className="self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-start items-center overflow-hidden">
              <input
                id="loan-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Approved by estate manager"
                className="flex-1 justify-start text-text-primary placeholder:text-text-secondary text-sm sm:text-base font-normal font-['Inter'] bg-transparent border-none outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="self-stretch flex justify-end items-center gap-3 pt-1 overflow-hidden">
            <button
              type="button"
              onClick={() => navigate('/deductions')}
              className="px-5 py-3 sm:py-3.5 bg-surface-card rounded-xl outline outline-[1.50px] outline-offset-[-1.50px] outline-border-default hover:bg-slate-50 active:bg-slate-100 flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <span className="justify-start text-brand-primary text-sm sm:text-base font-semibold font-['Inter']">
                Cancel
              </span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-3 sm:py-3.5 bg-brand-primary hover:bg-brand-primary-hover active:bg-emerald-800 disabled:opacity-60 rounded-xl flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs text-white"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin text-white" />}
              <span className="justify-start text-text-on-primary text-sm sm:text-base font-semibold font-['Inter']">
                {isSubmitting ? 'Creating...' : 'Create loan'}
              </span>
            </button>
          </div>
        </form>

        {/* Right Card: Loan Summary */}
        <div className="w-full lg:w-80 px-6 py-5 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-3.5 overflow-hidden shadow-xs shrink-0">
          <h2 className="self-stretch justify-start text-text-primary text-lg font-bold font-['Inter']">
            Loan summary
          </h2>

          <div className="self-stretch flex justify-between items-center gap-2 overflow-hidden">
            <span className="text-text-secondary text-sm font-normal font-['Inter']">
              Principal
            </span>
            <span className="text-text-primary text-sm font-medium font-['Inter']">
              LKR {principalValue.toLocaleString()}
            </span>
          </div>

          <div className="self-stretch flex justify-between items-center gap-2 overflow-hidden">
            <span className="text-text-secondary text-sm font-normal font-['Inter']">
              Monthly repayment
            </span>
            <span className="text-text-primary text-sm font-medium font-['Inter']">
              LKR {monthlyRepaymentValue.toLocaleString()}
            </span>
          </div>

          <div className="self-stretch flex justify-between items-center gap-2 overflow-hidden">
            <span className="text-text-secondary text-sm font-normal font-['Inter']">
              Estimated duration
            </span>
            <span className="text-text-primary text-sm font-bold font-['Inter']">
              {estimatedMonths} {estimatedMonths === 1 ? 'month' : 'months'}
            </span>
          </div>

          <div className="self-stretch px-3 py-2.5 bg-status-warning-bg rounded-[10px] flex justify-start items-start overflow-hidden">
            <p className="flex-1 justify-start text-status-warning text-xs font-medium font-['Inter'] leading-relaxed">
              Interest, fees and repayment order are pending approval (SRS §8.1). This loan is
              recorded without interest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
