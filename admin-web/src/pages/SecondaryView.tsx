import {
  Users,
  Leaf,
  Scale,
  ClipboardList,
  Calculator,
  Coins,
  ArrowLeft,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

export const SecondaryView = () => {
  const {
    activeTab,
    setActiveTab,
    farmers,
    slips,
    requests,
    setIsAddFarmerModalOpen,
    setIsRecordModalOpen,
    setIsSettlementModalOpen,
  } = useDashboard();

  if (activeTab === 'dashboard') return null;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 rounded-xl border border-[#ded8cc] bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-800" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Estate Admin V2 &bull; {activeTab.replace('-', ' ')}
        </span>
      </div>

      {/* FARMERS VIEW */}
      {activeTab === 'farmers' && (
        <div className="rounded-2xl border border-[#ded8cc] bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ece3] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183a27] text-white">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1a2b20]">Registered Tea Growers & Smallholders</h2>
                <p className="text-xs text-[#6e7d73]">
                  1,428 Registered smallholders across Nuwara Eliya, Norwood, Bogawantalawa & Maskeliya
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddFarmerModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#183a27] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#122e1e]"
            >
              <Plus className="h-4 w-4" />
              <span>Enroll New Grower</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#f0ece3] text-[10px] font-bold uppercase tracking-wider text-[#69796e]">
                  <th className="py-2.5 px-3">CODE</th>
                  <th className="py-2.5 px-3">GROWER NAME</th>
                  <th className="py-2.5 px-3">DIVISION</th>
                  <th className="py-2.5 px-3">MOBILE PHONE</th>
                  <th className="py-2.5 px-3">ACREAGE</th>
                  <th className="py-2.5 px-3">BANK PARTNER</th>
                  <th className="py-2.5 px-3">ACCOUNT NO.</th>
                  <th className="py-2.5 px-3 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1e8]">
                {farmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-[#faf7f2]/80">
                    <td className="py-3 px-3 font-bold text-[#183a27]">{farmer.code}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{farmer.name}</td>
                    <td className="py-3 px-3 text-slate-700">{farmer.division}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono">{farmer.phone}</td>
                    <td className="py-3 px-3 text-slate-800 font-medium">{farmer.teaLandAcreage} Acres</td>
                    <td className="py-3 px-3 text-slate-700">{farmer.bankName}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{farmer.accountNumber}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                        {farmer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COLLECTIONS VIEW */}
      {activeTab === 'collections' && (
        <div className="rounded-2xl border border-[#ded8cc] bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ece3] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183a27] text-white">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1a2b20]">Tea Leaf Collections Archive</h2>
                <p className="text-xs text-[#6e7d73]">
                  All intake slips captured through weighbridges 01, 02 & 03
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#183a27] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#122e1e]"
            >
              <Plus className="h-4 w-4" />
              <span>Record New Collection</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#f0ece3] text-[10px] font-bold uppercase tracking-wider text-[#69796e]">
                  <th className="py-2.5 px-3">SLIP ID</th>
                  <th className="py-2.5 px-3">FARMER</th>
                  <th className="py-2.5 px-3">COLLECTOR</th>
                  <th className="py-2.5 px-3 text-right">GROSS (KG)</th>
                  <th className="py-2.5 px-3 text-right">TARE (KG)</th>
                  <th className="py-2.5 px-3 text-right">NET WT (KG)</th>
                  <th className="py-2.5 px-3 text-right">TOTAL (LKR)</th>
                  <th className="py-2.5 px-3 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1e8]">
                {slips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-[#faf7f2]/80">
                    <td className="py-3 px-3 font-bold text-slate-900">{slip.id}</td>
                    <td className="py-3 px-3 font-bold text-[#1b2b21]">{slip.farmerName} ({slip.farmerCode})</td>
                    <td className="py-3 px-3 text-slate-700">{slip.collectorId} • {slip.collectorName}</td>
                    <td className="py-3 px-3 text-right font-medium">{slip.grossKg.toFixed(1)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-rose-600">{slip.tareKg.toFixed(1)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{slip.netKg.toFixed(1)}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-800">
                      LKR {slip.totalPayable.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        slip.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {slip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COLLECTION REQUESTS VIEW */}
      {activeTab === 'collection-requests' && (
        <div className="rounded-2xl border border-[#ded8cc] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-[#f0ece3] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a2b20]">Field Collection Requests Dispatch</h2>
              <p className="text-xs text-[#6e7d73]">
                Smallholder sheds requesting lorry dispatch to prevent post-harvest leaf spoilage
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 bg-[#fbf9f5]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{req.id}</span>
                    <span className="font-semibold text-[#183a27]">{req.sector}</span>
                    <span className="text-xs text-slate-500">• {req.postOrShed}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Grower: <strong>{req.farmerName}</strong> ({req.farmerCode}) &bull; Volume: <strong>{req.bagsCount} Bags (~{req.estimatedKg} kg)</strong>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {req.assignedCollector || 'Pending Collector Assignment'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WEIGHT VERIFICATION VIEW */}
      {activeTab === 'weight-verification' && (
        <div className="rounded-2xl border border-[#ded8cc] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-[#f0ece3] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a2b20]">Weighbridge Discrepancy & Verification Queue</h2>
              <p className="text-xs text-[#6e7d73]">
                6 pending intake slips flagged for excessive moisture or gross/tare discrepancy
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900">
            Intake slips with moisture index exceeding 14.0% or bag tare deductions &gt; 10 kg require chief admin sign-off prior to monthly settlement inclusion.
          </div>

          <div className="space-y-2">
            {slips.filter((s) => s.status === 'Flagged Wt' || s.status === 'Pending').map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white">
                <div>
                  <div className="font-bold text-slate-900">{s.id} &bull; {s.farmerName} ({s.farmerCode})</div>
                  <div className="text-xs text-slate-500">Gross: {s.grossKg} kg | Tare Ded: {s.tareKg} kg | Moisture: {s.moisturePercentage || 14.8}%</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTLEMENTS VIEW */}
      {activeTab === 'settlements' && (
        <div className="rounded-2xl border border-[#ded8cc] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f0ece3] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183a27] text-white">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1a2b20]">Smallholder Settlement Cycles</h2>
                <p className="text-xs text-[#6e7d73]">Monthly green leaf accounting & commercial bank disbursals</p>
              </div>
            </div>
            <button
              onClick={() => setIsSettlementModalOpen(true)}
              className="rounded-xl bg-[#183a27] px-4 py-2 text-xs font-bold text-white hover:bg-[#122e1e]"
            >
              Open October Settlement Wizard
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 bg-[#faf8f4]">
              <div className="text-xs font-bold text-slate-500">October 2024 (Active)</div>
              <div className="mt-2 text-xl font-bold text-[#183a27]">LKR 46.28M</div>
              <div className="text-xs text-slate-600 mt-1">Disbursal Date: Oct 31, 2024</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-[#faf8f4]">
              <div className="text-xs font-bold text-slate-500">September 2024</div>
              <div className="mt-2 text-xl font-bold text-slate-800">LKR 44.12M</div>
              <div className="text-xs text-emerald-700 font-semibold mt-1">Status: Disbursed & Reconciled</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-[#faf8f4]">
              <div className="text-xs font-bold text-slate-500">August 2024</div>
              <div className="mt-2 text-xl font-bold text-slate-800">LKR 42.80M</div>
              <div className="text-xs text-emerald-700 font-semibold mt-1">Status: Disbursed & Reconciled</div>
            </div>
          </div>
        </div>
      )}

      {/* TEA PRICES VIEW */}
      {activeTab === 'tea-prices' && (
        <div className="rounded-2xl border border-[#ded8cc] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-[#f0ece3] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183a27] text-white">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a2b20]">Sri Lanka Tea Board Rate Structure</h2>
              <p className="text-xs text-[#6e7d73]">Regulatory minimum baseline green leaf pricing schedules</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl bg-[#fbf5eb] border border-[#eedec7] p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#3d291a]">November 2024 Baseline Rate (Gazetted)</span>
                <span className="font-extrabold text-emerald-800 text-lg">LKR 255.00 / kg</span>
              </div>
              <p className="text-xs text-[#523d2b] mt-1">Recommended upward revision enacted across High Grown elevation zones.</p>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">October 2024 Active Rate</span>
                <span className="font-extrabold text-slate-900 text-lg">LKR 250.00 / kg</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Current factory gate intake calculation base price.</p>
            </div>
          </div>
        </div>
      )}

      {/* GENERIC OTHER TABS */}
      {!['farmers', 'collections', 'collection-requests', 'weight-verification', 'settlements', 'tea-prices'].includes(activeTab) && (
        <div className="rounded-2xl border border-[#ded8cc] bg-white p-8 text-center space-y-3 shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 capitalize">
            {activeTab.replace('-', ' ')} Module Active
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            This module is connected to the central TeaLedger Estate API and synchronized with Factory Intake Station 04.
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="rounded-xl bg-[#183a27] px-4 py-2 text-xs font-bold text-white hover:bg-[#122e1e]"
          >
            Return to Operations Overview
          </button>
        </div>
      )}
    </div>
  );
};
