import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../hooks/useAuth';
import { farmerService, INITIAL_FARMERS } from '../../services/farmerService';
import { deductionService } from '../../services/deductionService';
import type { Farmer } from '../../types/farmer.types';

const DEDUCTION_CATEGORIES = [
  'Materials (fertilizer)',
  'Loan repayment',
  'Transport',
  'Other',
];

export const DeductionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useDashboard();
  const { user } = useAuth();

  const [farmers, setFarmers] = useState<Farmer[]>(INITIAL_FARMERS);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(INITIAL_FARMERS[0].id);
  const [categoryLabel, setCategoryLabel] = useState<string>('Materials (fertilizer)');
  const [amountInput, setAmountInput] = useState<string>('1800');
  const [dateInput, setDateInput] = useState<string>('2026-10-10');
  const [referenceCode] = useState<string>('D-5021');
  const [reason, setReason] = useState<string>('');

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

  const estimatedNetBefore = 53500;
  const amountValue = Math.max(0, Number(amountInput.replace(/,/g, '')) || 0);
  const estimatedNetAfter = Math.max(0, estimatedNetBefore - amountValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (amountValue <= 0) {
      setErrorMessage('Please enter a valid positive deduction amount.');
      return;
    }

    if (!dateInput) {
      setErrorMessage('Please select a deduction date.');
      return;
    }

    const farmer = farmers.find((f) => f.id === selectedFarmerId);
    setIsSubmitting(true);

    try {
      const created = await deductionService.createDeduction({
        farmerId: selectedFarmerId,
        farmerName: farmer?.name || 'Farmer',
        categoryLabel,
        amount: amountValue,
        occurredAt: dateInput,
        referenceCode,
        reason,
        postedBy: user?.name ? `${user.name.split(' ')[0]} J.` : 'Sunil J.',
      });

      addToast({
        type: 'success',
        title: `Deduction ${created.deductionCode} Posted`,
        message: `LKR ${amountValue.toLocaleString()} applied to ${created.farmerName}'s settlement.`,
      });

      navigate('/deductions?tab=deductions');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to post deduction.';
      setErrorMessage(msg);
      addToast({
        type: 'error',
        title: 'Posting Failed',
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
          Add deduction
        </h1>
        <div className="self-stretch justify-start text-text-secondary text-xs sm:text-sm font-normal font-['Inter']">
          Apply a deduction to a farmer’s account
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
        {/* Left Card: Deduction Details Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 w-full p-6 sm:p-7 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-5 overflow-hidden shadow-xs"
        >
          <h2 className="self-stretch justify-start text-text-primary text-lg font-bold font-['Inter']">
            Deduction details
          </h2>

          {/* Farmer * */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label
              htmlFor="deduction-farmer"
              className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
            >
              Farmer *
            </label>
            <div className="relative self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-between items-center overflow-hidden">
              <select
                id="deduction-farmer"
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

          {/* Row: Category & Amount (LKR) */}
          <div className="self-stretch flex flex-col sm:flex-row justify-start items-start gap-5 overflow-hidden">
            <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
              <label
                htmlFor="deduction-category"
                className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
              >
                Category *
              </label>
              <div className="relative self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-between items-center overflow-hidden">
                <select
                  id="deduction-category"
                  value={categoryLabel}
                  onChange={(e) => setCategoryLabel(e.target.value)}
                  className="w-full appearance-none bg-transparent text-text-primary text-sm sm:text-base font-medium font-['Inter'] border-none outline-none cursor-pointer pr-6 focus:ring-0"
                >
                  {DEDUCTION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="size-4 text-text-secondary pointer-events-none absolute right-3.5" />
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
              <label
                htmlFor="deduction-amount"
                className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
              >
                Amount (LKR) *
              </label>
              <div className="self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-start items-center overflow-hidden">
                <input
                  id="deduction-amount"
                  type="number"
                  min="1"
                  step="10"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="flex-1 justify-start text-text-primary text-sm sm:text-base font-medium font-['Inter'] bg-transparent border-none outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Row: Date & Reference */}
          <div className="self-stretch flex flex-col sm:flex-row justify-start items-start gap-5 overflow-hidden">
            <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
              <label
                htmlFor="deduction-date"
                className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
              >
                Date *
              </label>
              <div className="self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-start items-center overflow-hidden">
                <input
                  id="deduction-date"
                  type="date"
                  required
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="flex-1 justify-start text-text-primary text-sm sm:text-base font-medium font-['Inter'] bg-transparent border-none outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
              <label className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']">
                Reference
              </label>
              <div className="self-stretch px-3.5 py-3 bg-surface-muted rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default flex justify-start items-center overflow-hidden">
                <span className="flex-1 justify-start text-text-primary text-sm sm:text-base font-medium font-['Inter'] select-none">
                  {referenceCode}
                </span>
              </div>
            </div>
          </div>

          {/* Reason (optional) */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label
              htmlFor="deduction-reason"
              className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
            >
              Reason (optional)
            </label>
            <div className="self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-start items-center overflow-hidden">
              <input
                id="deduction-reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Fertilizer issued at store"
                className="flex-1 justify-start text-text-primary placeholder:text-text-secondary text-sm sm:text-base font-normal font-['Inter'] bg-transparent border-none outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="self-stretch flex justify-end items-center gap-3 pt-1 overflow-hidden">
            <button
              type="button"
              onClick={() => navigate('/deductions?tab=deductions')}
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
                {isSubmitting ? 'Posting...' : 'Post deduction'}
              </span>
            </button>
          </div>
        </form>

        {/* Right Card: Effect on settlement */}
        <div className="w-full lg:w-80 px-6 py-5 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-3.5 overflow-hidden shadow-xs shrink-0">
          <h2 className="self-stretch justify-start text-text-primary text-lg font-bold font-['Inter']">
            Effect on settlement
          </h2>

          <p className="self-stretch justify-start text-text-secondary text-xs font-normal font-['Inter']">
            Applies to the October 2026 settlement (draft).
          </p>

          <div className="self-stretch flex justify-between items-center gap-2 overflow-hidden">
            <span className="text-text-secondary text-sm font-normal font-['Inter']">
              Estimated net before
            </span>
            <span className="text-text-primary text-sm font-medium font-['Inter']">
              LKR {estimatedNetBefore.toLocaleString()}
            </span>
          </div>

          <div className="self-stretch flex justify-between items-center gap-2 overflow-hidden">
            <span className="text-text-secondary text-sm font-normal font-['Inter']">
              Estimated net after
            </span>
            <span className="text-text-primary text-sm font-bold font-['Inter']">
              LKR {estimatedNetAfter.toLocaleString()}
            </span>
          </div>

          <div className="self-stretch px-3 py-2.5 bg-status-info-bg rounded-[10px] flex justify-start items-start overflow-hidden">
            <p className="flex-1 justify-start text-status-info text-xs font-medium font-['Inter'] leading-relaxed">
              Posted deductions can be reversed but not deleted. This action is recorded in the
              audit log.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
