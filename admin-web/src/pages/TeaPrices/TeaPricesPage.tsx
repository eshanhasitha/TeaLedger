import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../hooks/useAuth';
import { teaPriceService, INITIAL_TEA_PRICES } from '../../services/teaPriceService';
import { collectorService, INITIAL_FIGMA_COLLECTORS } from '../../services/collectorService';
import type { TeaPriceRecord, TeaPriceStatus } from '../../types/teaPrice.types';
import type { TeaCollector } from '../../types/collector.types';

export const TeaPricesPage: React.FC = () => {
  const { addToast } = useDashboard();
  const { user } = useAuth();

  const [priceHistory, setPriceHistory] = useState<TeaPriceRecord[]>(INITIAL_TEA_PRICES);
  const [collectors, setCollectors] = useState<TeaCollector[]>(INITIAL_FIGMA_COLLECTORS);

  // Form State
  const [priceInput, setPriceInput] = useState<string>('105.00');
  const [effectiveFrom, setEffectiveFrom] = useState<string>('2026-12-01');
  const [appliesTo, setAppliesTo] = useState<string>('All areas');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCollector = collectors.find(
    (c) => c.id === appliesTo || c.collectorCode === appliesTo
  );
  const activeCollectorId = selectedCollector?.id || collectors[0]?.id;

  const fetchHistory = (collectorId?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    teaPriceService
      .getPriceHistory(collectorId, user?.name || 'Sunil Jayawardena')
      .then((records) => {
        setPriceHistory(records);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : 'Failed to load tea price history from backend.';
        setErrorMessage(msg);
        setPriceHistory(INITIAL_TEA_PRICES);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;

    collectorService
      .getCollectors()
      .then((list) => {
        if (!ignore && list.length > 0) {
          setCollectors(list);
        }
      })
      .catch(() => {
        /* fallback to initial collectors */
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    teaPriceService
      .getPriceHistory(activeCollectorId, user?.name || 'Sunil Jayawardena')
      .then((records) => {
        if (!ignore && records.length > 0) {
          setPriceHistory(records);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err instanceof Error ? err.message : 'Failed to load tea price history from backend.';
          setErrorMessage(msg);
          setPriceHistory(INITIAL_TEA_PRICES);
        }
      });

    return () => {
      ignore = true;
    };
  }, [activeCollectorId, user?.name]);

  const handleReset = () => {
    setPriceInput('105.00');
    setEffectiveFrom('2026-12-01');
    setAppliesTo('All areas');
    setErrorMessage(null);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedPrice = Number(priceInput);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Please enter a valid positive price per kg in LKR.');
      return;
    }

    if (!effectiveFrom) {
      setErrorMessage('Please select an effective date.');
      return;
    }

    setIsSaving(true);
    try {
      const appliesLabel = selectedCollector
        ? `${selectedCollector.fullName} (${selectedCollector.collectorCode || selectedCollector.id})`
        : appliesTo;

      const created = await teaPriceService.setMonthlyPrice({
        collectorId: activeCollectorId,
        appliesToLabel: appliesLabel,
        pricePerKg: parsedPrice,
        effectiveFrom,
        setBy: user?.name || 'Sunil Jayawardena',
      });

      setPriceHistory((prev) => {
        const updatedPrev =
          created.status === 'Current'
            ? prev.map((p) => (p.status === 'Current' ? { ...p, status: 'Past' as const } : p))
            : prev;
        return [created, ...updatedPrev];
      });

      addToast({
        type: 'success',
        title: 'Tea Price Saved',
        message: `LKR ${parsedPrice.toFixed(2)}/kg scheduled effective ${created.effectiveFromLabel}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save monthly tea price.';
      setErrorMessage(msg);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: msg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStatusBadge = (status: TeaPriceStatus) => {
    switch (status) {
      case 'Scheduled':
        return (
          <div
            data-status="warning"
            className="px-2.5 py-1 bg-status-warning-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-warning text-xs font-semibold font-['Inter']">
              ◔ Scheduled
            </span>
          </div>
        );
      case 'Current':
        return (
          <div
            data-status="success"
            className="px-2.5 py-1 bg-status-success-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-success text-xs font-semibold font-['Inter']">
              ✓ Current
            </span>
          </div>
        );
      case 'Past':
      default:
        return (
          <div
            data-status="neutral"
            className="px-2.5 py-1 bg-status-neutral-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-neutral text-xs font-semibold font-['Inter']">
              ● Past
            </span>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-start gap-6 font-['Inter',sans-serif]">
      {/* Backend Connection Notice */}
      {errorMessage && (
        <div className="w-full p-4 rounded-xl border border-amber-200 bg-amber-50/90 text-amber-900 flex items-center justify-between text-xs sm:text-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 sm:size-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-semibold">Notice:</span> {errorMessage}
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchHistory(activeCollectorId)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      )}

      {/* 1. Header */}
      <div className="self-stretch flex flex-col justify-start items-start gap-1 overflow-hidden">
        <h1 className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter'] tracking-tight">
          Tea prices
        </h1>
        <div className="self-stretch justify-start text-text-secondary text-xs sm:text-sm font-normal font-['Inter']">
          Set prices by effective date. Past prices stay available for audit.
        </div>
      </div>

      {/* 2. Set a new price Form Card */}
      <form
        onSubmit={handleSavePrice}
        className="self-stretch px-5 sm:px-6 py-5 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-4 overflow-hidden shadow-xs"
      >
        <h2 className="self-stretch justify-start text-text-primary text-lg font-bold font-['Inter']">
          Set a new price
        </h2>

        <div className="self-stretch flex flex-col md:flex-row justify-start items-start gap-5 overflow-hidden">
          {/* Price per kg (LKR) * */}
          <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label
              htmlFor="tea-price-input"
              className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
            >
              Price per kg (LKR) *
            </label>
            <div className="self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-start items-center overflow-hidden transition-all">
              <input
                id="tea-price-input"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="flex-1 justify-start text-text-primary text-sm sm:text-base font-medium font-['Inter'] bg-transparent border-none outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Effective from * */}
          <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label
              htmlFor="tea-effective-date"
              className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
            >
              Effective from *
            </label>
            <div className="self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-start items-center overflow-hidden transition-all">
              <input
                id="tea-effective-date"
                type="date"
                required
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="flex-1 justify-start text-text-primary text-sm sm:text-base font-medium font-['Inter'] bg-transparent border-none outline-none focus:ring-0"
              />
            </div>
            <div className="self-stretch justify-start text-text-secondary text-xs font-normal font-['Inter']">
              Must be after the last finalized settlement.
            </div>
          </div>

          {/* Applies to */}
          <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label
              htmlFor="tea-applies-to"
              className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
            >
              Applies to
            </label>
            <div className="relative self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-between items-center overflow-hidden transition-all">
              <select
                id="tea-applies-to"
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value)}
                className="w-full appearance-none bg-transparent text-text-primary text-sm sm:text-base font-medium font-['Inter'] border-none outline-none cursor-pointer pr-6 focus:ring-0"
              >
                <option value="All areas">All areas</option>
                {collectors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.collectorCode || c.id})
                  </option>
                ))}
              </select>
              <ChevronDown className="size-4 text-text-secondary pointer-events-none absolute right-3.5" />
            </div>
            <div className="self-stretch justify-start text-text-secondary text-xs font-normal font-['Inter']">
              Pricing scope pending approval (SRS §8.1).
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="self-stretch flex justify-end items-center gap-3 pt-1 overflow-hidden">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-3 sm:py-3.5 bg-surface-card rounded-xl outline outline-[1.50px] outline-offset-[-1.50px] outline-border-default hover:bg-slate-50 active:bg-slate-100 flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <span className="justify-start text-brand-primary text-sm sm:text-base font-semibold font-['Inter']">
              Cancel
            </span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-3 sm:py-3.5 bg-brand-primary hover:bg-brand-primary-hover active:bg-emerald-800 disabled:opacity-60 rounded-xl flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs text-white"
          >
            {isSaving && <Loader2 className="size-4 animate-spin text-white" />}
            <span className="justify-start text-text-on-primary text-sm sm:text-base font-semibold font-['Inter']">
              {isSaving ? 'Saving price...' : 'Save price'}
            </span>
          </button>
        </div>
      </form>

      {/* 3. Price History Section */}
      <h2 className="self-stretch justify-start text-text-primary text-lg font-bold font-['Inter']">
        Price history
      </h2>

      <div className="self-stretch bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start overflow-hidden shadow-xs">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[680px] w-full">
            {/* Table Header */}
            <div className="self-stretch px-5 py-3 bg-surface-muted flex justify-start items-center gap-4 overflow-hidden border-b border-border-default">
              <div className="w-36 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Effective from
              </div>
              <div className="w-28 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Price (LKR/kg)
              </div>
              <div className="w-44 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Set by
              </div>
              <div className="w-36 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Changed on
              </div>
              <div className="flex-1 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                Status
              </div>
            </div>

            {/* Data Rows */}
            {priceHistory.map((item, idx) => (
              <div
                key={item.id}
                className={`self-stretch px-5 py-3 flex justify-start items-center gap-4 overflow-hidden hover:bg-slate-50/80 transition-colors ${
                  idx < priceHistory.length - 1 ? 'border-b border-border-default' : ''
                }`}
              >
                <div className="w-36 justify-start text-text-primary text-xs font-normal font-['Inter']">
                  {item.effectiveFromLabel}
                </div>
                <div className="w-28 text-right justify-start text-text-primary text-xs font-semibold font-['Inter']">
                  {item.pricePerKg.toFixed(2)}
                </div>
                <div className="w-44 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                  {item.setBy}
                </div>
                <div className="w-36 justify-start text-text-primary text-xs font-normal font-['Inter']">
                  {item.changedOnLabel}
                </div>
                <div className="flex-1 flex justify-start items-start overflow-hidden">
                  {renderStatusBadge(item.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
