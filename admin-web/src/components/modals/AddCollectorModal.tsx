import { useState } from 'react';
import { X, UserPlus, Truck, Scale, Shield, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import type { CollectorFormData, CollectorStatus } from '../../types/collector.types';

const DIVISIONS = [
  'Nuwara Eliya Central',
  'Norwood',
  'Bogawantalawa',
  'Maskeliya',
  'Hatton',
  'Haputale',
  'Talawakelle',
  'Ratnapura',
];

interface FormErrors {
  fullName?: string;
  nicNumber?: string;
  phoneNumber?: string;
  email?: string;
  assignedDivision?: string;
  assignedRoute?: string;
  vehicleNumber?: string;
  scaleDeviceId?: string;
}

export const AddCollectorModal = () => {
  const { isAddCollectorModalOpen, setIsAddCollectorModalOpen, addCollector } = useDashboard();

  const [formData, setFormData] = useState<CollectorFormData>({
    fullName: '',
    nicNumber: '',
    phoneNumber: '+94 7',
    email: '',
    assignedDivision: 'Nuwara Eliya Central',
    assignedRoute: '',
    vehicleNumber: '',
    scaleDeviceId: 'DIGI-SCALE-',
    status: 'Active',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAddCollectorModalOpen) return null;

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errs.fullName = 'Full legal name must be at least 3 characters.';
    }

    // Sri Lankan NIC: 9 digits + V/X or 12 digits
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!formData.nicNumber.trim() || !nicRegex.test(formData.nicNumber.trim())) {
      errs.nicNumber = 'Enter a valid NIC (e.g., 842301984V or 199023419820).';
    }

    // Phone validation
    const phoneClean = formData.phoneNumber.replace(/[\s-]/g, '');
    if (!phoneClean.startsWith('+94') || phoneClean.length < 11) {
      errs.phoneNumber = 'Valid phone required in +94 format (e.g., +94 77 123 4567).';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Valid corporate or estate email required.';
    }

    if (!formData.assignedRoute.trim()) {
      errs.assignedRoute = 'Collection route path is required.';
    }

    if (!formData.vehicleNumber.trim()) {
      errs.vehicleNumber = 'Assigned vehicle / lorry number is required.';
    }

    if (!formData.scaleDeviceId.trim() || formData.scaleDeviceId === 'DIGI-SCALE-') {
      errs.scaleDeviceId = 'Digital scale serial/ID is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleStatusChange = (status: CollectorStatus) => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate slight async submission
    setTimeout(() => {
      addCollector(formData);
      setIsSubmitting(false);
      setIsAddCollectorModalOpen(false);
      // Reset form
      setFormData({
        fullName: '',
        nicNumber: '',
        phoneNumber: '+94 7',
        email: '',
        assignedDivision: 'Nuwara Eliya Central',
        assignedRoute: '',
        vehicleNumber: '',
        scaleDeviceId: 'DIGI-SCALE-',
        status: 'Active',
      });
      setErrors({});
    }, 450);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsAddCollectorModalOpen(false);
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#d6cfc2] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-collector-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#f0ece3] bg-[#183a27] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 id="add-collector-title" className="text-base font-bold tracking-tight">
                Register Field Tea Collector
              </h2>
              <p className="text-xs text-emerald-200/80">
                Enroll a new field collection officer, assign transport route & pair scale device
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Legal Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Sunil Jayathilake"
                  className={`w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.fullName
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.fullName}</p>
              )}
            </div>

            {/* NIC Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                National Identity Card (NIC) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Shield className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="nicNumber"
                  value={formData.nicNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 842301984V"
                  className={`w-full rounded-xl border bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 uppercase font-mono transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.nicNumber
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
                  }`}
                />
              </div>
              {errors.nicNumber && (
                <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.nicNumber}</p>
              )}
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+94 77 123 4567"
                  className={`w-full rounded-xl border bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 font-mono transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.phoneNumber
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
                  }`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="agent@tealedger.lk"
                  className={`w-full rounded-xl border bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.email}</p>
              )}
            </div>

            {/* Assigned Division */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Division <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <select
                  name="assignedDivision"
                  value={formData.assignedDivision}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 font-semibold transition-colors focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  {DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assigned Collection Route */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Collection Route Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="assignedRoute"
                value={formData.assignedRoute}
                onChange={handleInputChange}
                placeholder="e.g. Norwood Div 02 & Agrapatana Link"
                className={`w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.assignedRoute
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
                }`}
              />
              {errors.assignedRoute && (
                <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.assignedRoute}</p>
              )}
            </div>

            {/* Assigned Vehicle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Transport Vehicle <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Truck className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  placeholder="WP LD-8842 (Isuzu 3.5T Lorry)"
                  className={`w-full rounded-xl border bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.vehicleNumber
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
                  }`}
                />
              </div>
              {errors.vehicleNumber && (
                <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.vehicleNumber}</p>
              )}
            </div>

            {/* Digital Scale Device ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Digital Scale Device ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Scale className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="scaleDeviceId"
                  value={formData.scaleDeviceId}
                  onChange={handleInputChange}
                  placeholder="DIGI-SCALE-09"
                  className={`w-full rounded-xl border bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 font-mono transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.scaleDeviceId
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
                  }`}
                />
              </div>
              {errors.scaleDeviceId && (
                <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.scaleDeviceId}</p>
              )}
            </div>
          </div>

          {/* Initial Status Selector */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Initial Operational Deployment Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Active', 'On Leave', 'Inactive'] as CollectorStatus[]).map((status) => {
                const isSelected = formData.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold border transition-all ${
                      isSelected
                        ? status === 'Active'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                          : status === 'On Leave'
                          ? 'border-amber-600 bg-amber-50 text-amber-800 shadow-2xs'
                          : 'border-rose-600 bg-rose-50 text-rose-800 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        status === 'Active'
                          ? 'bg-emerald-500'
                          : status === 'On Leave'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span>{status}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[#183a27] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#122e1e] transition-colors shadow-xs disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
                  <span>Registering Collector...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 text-emerald-300" />
                  <span>Register Collector</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

