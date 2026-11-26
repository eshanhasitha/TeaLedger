import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  Phone,
  Mail,
  Shield,
  Users,
  Calendar,
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import type {
  TeaCollector,
  CollectorStatus,
} from '../../types/collector.types';
import { collectorService } from '../../services/collectorService';

export const CollectorDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { collectors, updateCollectorStatus, setActiveTab } = useDashboard();

  const collector: TeaCollector | undefined = collectors.find(
    (c) => c.id.toLowerCase() === id?.toLowerCase()
  );

  const smallholders = useMemo(() => {
    if (!collector) return [];
    return collectorService.getAssignedSmallholdersSync(collector.id);
  }, [collector]);

  const performance = useMemo(() => {
    if (!collector) return null;
    return collectorService.getRoutePerformanceSync(collector.id);
  }, [collector]);

  const handleBack = () => {
    setActiveTab('collectors');
    navigate('/collectors');
  };

  if (!collector) {
    return (
      <div className="rounded-2xl border border-[#ded8cc] bg-white p-8 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-800">Collector Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested collector ID &ldquo;{id}&rdquo; was not found in the estate registry.
        </p>
        <button
          onClick={handleBack}
          className="rounded-xl bg-[#183a27] px-4 py-2 text-xs font-bold text-white hover:bg-[#122e1e]"
        >
          Return to Collectors Roster
        </button>
      </div>
    );
  }

  const initials = collector.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const getStatusBadge = (status: CollectorStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'On Leave':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Inactive':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Suspended':
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-xl border border-[#ded8cc] bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-800" />
          <span>Back to Field Collectors</span>
        </button>

        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Collector Profile &bull; {collector.id}
        </span>
      </div>

      {/* Hero Profile Card */}
      <div className="rounded-2xl border border-[#d6cfc2] bg-white overflow-hidden shadow-xs">
        <div className="bg-[#183a27] text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-black text-emerald-200 shadow-inner">
                {initials}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold text-white tracking-tight">
                    {collector.fullName}
                  </h1>
                  <span className="rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-mono font-bold tracking-wide text-emerald-200">
                    {collector.id}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusBadge(
                      collector.status
                    )}`}
                  >
                    {collector.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100/80">
                  <span className="flex items-center gap-1 font-mono">
                    <Shield className="h-3.5 w-3.5 text-emerald-300" />
                    NIC: {collector.nicNumber}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-emerald-300" />
                    Registered {collector.registeredDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {collector.status === 'Active' ? (
                <button
                  onClick={() => updateCollectorStatus(collector.id, 'On Leave')}
                  className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs"
                >
                  Set On Leave
                </button>
              ) : (
                <button
                  onClick={() => updateCollectorStatus(collector.id, 'Active')}
                  className="rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  Mark Active
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contact & Route Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-[#faf8f4] border-t border-[#f0ece3] text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Phone Contact</span>
            <div className="mt-0.5 flex items-center gap-1.5 font-mono font-bold text-slate-800">
              <Phone className="h-3.5 w-3.5 text-emerald-700" />
              <span>{collector.phoneNumber}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Work Email</span>
            <div className="mt-0.5 flex items-center gap-1.5 font-medium text-slate-700 truncate">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate">{collector.email}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Transit Vehicle</span>
            <div className="mt-0.5 flex items-center gap-1.5 font-bold text-slate-800">
              <Truck className="h-3.5 w-3.5 text-slate-500" />
              <span>{collector.vehicleNumber}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Digital Scale Device</span>
            <div className="mt-0.5 flex items-center gap-1.5 font-mono font-bold text-slate-800">
              <span className={`h-2 w-2 rounded-full ${collector.scaleStatus === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span>{collector.scaleDeviceId}</span>
              <span className="text-[11px] text-slate-500 font-normal">({collector.batteryLevel || 85}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      {performance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Monthly Intake Volume
            </span>
            <div className="mt-1 text-2xl font-black text-[#183a27]">
              {performance.monthlyIntakeTons.toFixed(1)} Tons
            </div>
            <span className="text-xs font-semibold text-emerald-700 mt-0.5 inline-block">
              Top 15% Factory Route
            </span>
          </div>

          <div className="rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              On-Time Intake Rate
            </span>
            <div className="mt-1 text-2xl font-black text-slate-800">
              {performance.onTimeIntakeRate}%
            </div>
            <span className="text-xs text-slate-500 mt-0.5 inline-block">
              Target: &gt; 90% daily
            </span>
          </div>

          <div className="rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Smallholder Coverage
            </span>
            <div className="mt-1 text-2xl font-black text-slate-800">
              {performance.routeCoveragePercentage}%
            </div>
            <span className="text-xs text-slate-500 mt-0.5 inline-block">
              {collector.activeFarmersCount} active growers
            </span>
          </div>

          <div className="rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Vehicle Fuel Efficiency
            </span>
            <div className="mt-1 text-2xl font-black text-slate-800">
              {performance.fuelEfficiencyKmPerL} km/L
            </div>
            <span className="text-xs font-semibold text-emerald-700 mt-0.5 inline-block">
              Optimal for Hill Incline
            </span>
          </div>
        </div>
      )}

      {/* Assigned Smallholders Table */}
      <div className="rounded-2xl border border-[#ded8cc] bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#f0ece3] pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900">
              Assigned Smallholders on {collector.assignedRoute}
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {smallholders.length} Registered Growers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f0ece3] text-[10px] font-bold uppercase tracking-wider text-[#69796e]">
                <th className="py-2.5 px-3">CODE</th>
                <th className="py-2.5 px-3">GROWER NAME</th>
                <th className="py-2.5 px-3">DIVISION</th>
                <th className="py-2.5 px-3">ACREAGE</th>
                <th className="py-2.5 px-3">EST. DAILY KG</th>
                <th className="py-2.5 px-3">LAST PICKUP</th>
                <th className="py-2.5 px-3 text-right">CONTACT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f1e8]">
              {smallholders.map((sh) => (
                <tr key={sh.code} className="hover:bg-[#faf8f4]/80">
                  <td className="py-3 px-3 font-mono font-bold text-emerald-800">{sh.code}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{sh.name}</td>
                  <td className="py-3 px-3 text-slate-600">{sh.division}</td>
                  <td className="py-3 px-3 text-slate-800 font-medium">{sh.acreage} Acres</td>
                  <td className="py-3 px-3 font-bold text-emerald-900">~{sh.estDailyKg} kg</td>
                  <td className="py-3 px-3 text-slate-500">{sh.lastCollectionTime || 'Morning Slot'}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">{sh.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
