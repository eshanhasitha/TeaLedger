import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { farmerService } from '../../services/farmerService';
import type { FarmerStatus } from '../../types/farmer.types';

const AREA_OPTIONS = [
  'Highland Block 03',
  'Highland Block 04',
  'Highland Block 05',
  'Maskeliya Block 01',
  'Norwood Block 02',
  'Bogawantalawa Block 01',
];

const COLLECTOR_OPTIONS = [
  { label: 'Nimal Silva (C-02)', name: 'Nimal Silva', id: 'COL-402' },
  { label: 'Rohan Dias (C-04)', name: 'Rohan Dias', id: 'COL-404' },
  { label: 'Saman Kumara (C-01)', name: 'Saman Kumara', id: 'COL-401' },
  { label: 'Sunil Bandara (C-03)', name: 'Sunil Bandara', id: 'COL-403' },
];

export const FarmerCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useDashboard();

  // Form State
  const [fullName, setFullName] = useState<string>('Kamal Perera');
  const [mobileNumber, setMobileNumber] = useState<string>('077 123 4567');
  const [area, setArea] = useState<string>('Highland Block 03');
  const [selectedCollector, setSelectedCollector] = useState<string>('Nimal Silva (C-02)');
  const [status, setStatus] = useState<FarmerStatus>('Active');

  // Validation State
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 10-digit Sri Lankan mobile number validation (e.g. 0771234567, 0712345678)
  const rawDigits = mobileNumber.replace(/\D/g, '');
  const isMobileValid = rawDigits.length === 10 || (rawDigits.length === 9 && !mobileNumber.startsWith('0'));
  const showMobileError = isTouched && (!mobileNumber.trim() || !isMobileValid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTouched(true);
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!isMobileValid) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const collectorObj = COLLECTOR_OPTIONS.find((c) => c.label === selectedCollector);
      const collectorName = collectorObj?.name || 'Nimal Silva';

      await farmerService.createFarmer({
        name: fullName.trim(),
        phone: mobileNumber.trim(),
        area,
        division: area.split(' ')[0] || 'Highland',
        collectorName,
        status,
        advanceLkr: 0,
      });

      addToast({
        type: 'success',
        title: 'Farmer Account Created',
        message: `${fullName} enrolled under ${area} and assigned to ${collectorName}.`,
      });

      navigate('/farmers');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register farmer. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-start gap-6 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="self-stretch flex flex-col justify-start items-start gap-1 overflow-hidden">
        <h1 className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter'] tracking-tight">
          Add farmer
        </h1>
        <div className="self-stretch justify-start text-text-secondary text-xs sm:text-sm font-normal font-['Inter']">
          Create a farmer account and assign a collector
        </div>
      </div>

      {/* Backend / Validation Error Alert */}
      {errorMessage && (
        <div className="self-stretch rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
          <AlertCircle className="size-4 sm:size-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="self-stretch p-6 sm:p-7 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-5 overflow-hidden shadow-xs"
      >
        <div className="self-stretch justify-start text-text-primary text-lg font-bold font-['Inter']">
          Farmer details
        </div>

        {/* Row 1: Full name & Mobile number */}
        <div className="self-stretch flex flex-col sm:flex-row justify-start items-start gap-5 overflow-hidden">
          {/* Full Name */}
          <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label
              htmlFor="farmer-name"
              className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
            >
              Full name *
            </label>
            <div className="self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-start items-center overflow-hidden transition-all">
              <input
                id="farmer-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter grower's full legal name"
                className="flex-1 justify-start text-text-primary text-sm sm:text-base font-medium font-['Inter'] bg-transparent border-none outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label
              htmlFor="farmer-phone"
              className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
            >
              Mobile number *
            </label>
            <div
              className={`self-stretch px-3.5 py-3 bg-surface-card rounded-xl flex justify-start items-center overflow-hidden transition-all ${
                showMobileError
                  ? 'outline outline-2 outline-offset-[-2px] outline-status-danger'
                  : 'outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary'
              }`}
            >
              <input
                id="farmer-phone"
                type="tel"
                required
                value={mobileNumber}
                onBlur={() => setIsTouched(true)}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  if (!isTouched) setIsTouched(true);
                }}
                placeholder="077 123 4567"
                className="flex-1 justify-start text-text-primary text-sm sm:text-base font-medium font-['Inter'] bg-transparent border-none outline-none focus:ring-0"
              />
            </div>
            {showMobileError && (
              <div className="self-stretch justify-start text-status-danger text-xs font-medium font-['Inter']">
                ! Enter a valid 10-digit mobile number
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Farmer ID & Area / block */}
        <div className="self-stretch flex flex-col sm:flex-row justify-start items-start gap-5 overflow-hidden">
          {/* Farmer ID (Auto assigned) */}
          <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']">
              Farmer ID
            </label>
            <div className="self-stretch px-3.5 py-3 bg-surface-muted rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default flex justify-start items-center overflow-hidden">
              <span className="flex-1 justify-start text-text-secondary text-sm sm:text-base font-normal font-['Inter'] select-none">
                Assigned automatically on save
              </span>
            </div>
          </div>

          {/* Area / Block */}
          <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label
              htmlFor="farmer-area"
              className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
            >
              Area / block *
            </label>
            <div className="relative self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-between items-center overflow-hidden transition-all">
              <select
                id="farmer-area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full appearance-none bg-transparent text-text-primary text-sm sm:text-base font-medium font-['Inter'] border-none outline-none cursor-pointer pr-6 focus:ring-0"
              >
                {AREA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="text-slate-900 bg-white">
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-4 text-text-secondary pointer-events-none absolute right-3.5" />
            </div>
          </div>
        </div>

        {/* Row 3: Assigned Collector & Account Status */}
        <div className="self-stretch flex flex-col sm:flex-row justify-start items-start gap-5 overflow-hidden">
          {/* Assigned Collector */}
          <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label
              htmlFor="farmer-collector"
              className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
            >
              Assigned collector *
            </label>
            <div className="relative self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-between items-center overflow-hidden transition-all">
              <select
                id="farmer-collector"
                value={selectedCollector}
                onChange={(e) => setSelectedCollector(e.target.value)}
                className="w-full appearance-none bg-transparent text-text-primary text-sm sm:text-base font-medium font-['Inter'] border-none outline-none cursor-pointer pr-6 focus:ring-0"
              >
                {COLLECTOR_OPTIONS.map((c) => (
                  <option key={c.label} value={c.label} className="text-slate-900 bg-white">
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-4 text-text-secondary pointer-events-none absolute right-3.5" />
            </div>
            <div className="self-stretch justify-start text-text-secondary text-xs font-normal font-['Inter']">
              The collector will see this farmer in their app.
            </div>
          </div>

          {/* Account Status */}
          <div className="flex-1 w-full flex flex-col justify-start items-start gap-1.5 overflow-hidden">
            <label
              htmlFor="farmer-status"
              className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']"
            >
              Account status
            </label>
            <div className="relative self-stretch px-3.5 py-3 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default focus-within:outline-brand-primary flex justify-between items-center overflow-hidden transition-all">
              <select
                id="farmer-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as FarmerStatus)}
                className="w-full appearance-none bg-transparent text-text-primary text-sm sm:text-base font-medium font-['Inter'] border-none outline-none cursor-pointer pr-6 focus:ring-0"
              >
                <option value="Active" className="text-slate-900 bg-white">
                  Active
                </option>
                <option value="Inactive" className="text-slate-900 bg-white">
                  Inactive
                </option>
              </select>
              <ChevronDown className="size-4 text-text-secondary pointer-events-none absolute right-3.5" />
            </div>
          </div>
        </div>

        {/* Action Buttons: Cancel & Save farmer */}
        <div className="self-stretch flex justify-end items-center gap-3 pt-3 overflow-hidden">
          {/* Cancel */}
          <button
            type="button"
            onClick={() => navigate('/farmers')}
            className="px-5 py-3.5 bg-surface-card rounded-xl outline outline-[1.50px] outline-offset-[-1.50px] outline-border-default hover:bg-slate-50 active:bg-slate-100 flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <span className="justify-start text-brand-primary text-sm sm:text-base font-semibold font-['Inter']">
              Cancel
            </span>
          </button>

          {/* Save Farmer */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-3.5 bg-brand-primary hover:bg-brand-primary-hover active:bg-emerald-800 disabled:opacity-60 rounded-xl flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs text-white"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin text-white" />}
            <span className="justify-start text-text-on-primary text-sm sm:text-base font-semibold font-['Inter']">
              {isSubmitting ? 'Saving farmer...' : 'Save farmer'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
