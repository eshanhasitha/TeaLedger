import { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

export const AddFarmerModal = () => {
  const { isAddFarmerModalOpen, setIsAddFarmerModalOpen, addFarmer } = useDashboard();

  const [name, setName] = useState('');
  const [code, setCode] = useState('TR-1082');
  const [division, setDivision] = useState('Norwood Div 02');
  const [phone, setPhone] = useState('+94 7');
  const [nic, setNic] = useState('');
  const [acreage, setAcreage] = useState<number>(2.5);
  const [bankName, setBankName] = useState('Commercial Bank of Ceylon');
  const [accountNumber, setAccountNumber] = useState('');

  if (!isAddFarmerModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    addFarmer({
      code,
      name,
      division,
      phone,
      nic: nic || 'N/A',
      teaLandAcreage: acreage,
      bankName,
      accountNumber: accountNumber || 'Pending Registration',
    });

    setIsAddFarmerModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-[#ded8cc] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#ece8e0] bg-[#faf8f4] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#183a27] text-white">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18291e]">
                Enroll New Tea Smallholder
              </h3>
              <p className="text-xs text-[#6e7d73]">
                Register grower for digital passbook & intake weighing
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddFarmerModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                Grower Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-[#ded8cc] px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                Division / Estate
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full rounded-xl border border-[#ded8cc] bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
              >
                <option value="Norwood Div 02">Norwood Div 02</option>
                <option value="Bogawantalawa East">Bogawantalawa East</option>
                <option value="Maskeliya Valley">Maskeliya Valley</option>
                <option value="Agrapatana Upper">Agrapatana Upper</option>
                <option value="Radella Lower Valley">Radella Lower Valley</option>
                <option value="Talawakelle West">Talawakelle West</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. S. P. Wickremasinghe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#ded8cc] px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                Mobile Phone
              </label>
              <input
                type="text"
                required
                placeholder="+94 77..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[#ded8cc] px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                National ID (NIC)
              </label>
              <input
                type="text"
                placeholder="781203491V"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                className="w-full rounded-xl border border-[#ded8cc] px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                Acreage
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={acreage}
                onChange={(e) => setAcreage(parseFloat(e.target.value) || 1)}
                className="w-full rounded-xl border border-[#ded8cc] px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                Bank Partner
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-xl border border-[#ded8cc] bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
              >
                <option value="Commercial Bank of Ceylon">Commercial Bank</option>
                <option value="Bank of Ceylon">Bank of Ceylon (BOC)</option>
                <option value="Hatton National Bank">Hatton National Bank</option>
                <option value="People's Bank">People's Bank</option>
                <option value="Sampath Bank">Sampath Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                Account Number
              </label>
              <input
                type="text"
                placeholder="8004128910"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full rounded-xl border border-[#ded8cc] px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddFarmerModalOpen(false)}
              className="rounded-xl border border-[#ded8cc] px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#183a27] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#122e1e] transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Register Grower</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
