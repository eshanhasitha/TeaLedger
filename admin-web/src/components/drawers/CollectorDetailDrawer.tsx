import { useState, useMemo } from 'react';
import {
  X,
  Scale,
  MapPin,
  Phone,
  Mail,
  Shield,
  Users,
  Calendar,
  BatteryMedium,
  Clock,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import type {
  TeaCollector,
  CollectorStatus,
} from '../../types/collector.types';
import { collectorService } from '../../services/collectorService';

interface CollectorDetailDrawerProps {
  collector: TeaCollector | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: CollectorStatus) => void;
}

type TabType = 'smallholders' | 'scale-logs' | 'performance';

export const CollectorDetailDrawer = ({
  collector,
  isOpen,
  onClose,
  onUpdateStatus,
}: CollectorDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('smallholders');

  const smallholders = useMemo(() => {
    if (!collector) return [];
    return collectorService.getAssignedSmallholdersSync(collector.id);
  }, [collector]);

  const scaleLogs = useMemo(() => {
    if (!collector) return [];
    return collectorService.getCollectorScaleLogsSync(collector.id);
  }, [collector]);

  const performance = useMemo(() => {
    if (!collector) return null;
    return collectorService.getRoutePerformanceSync(collector.id);
  }, [collector]);

  if (!isOpen || !collector) return null;

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
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-[#dcd6c8] animate-in slide-in-from-right duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="collector-drawer-title"
        >
          {/* Top Header Card */}
          <div className="bg-[#183a27] text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-black text-emerald-200 shadow-inner">
                {initials}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="collector-drawer-title" className="text-lg font-bold text-white tracking-tight">
                    {collector.fullName}
                  </h2>
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wide text-emerald-200">
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
                    Joined {collector.registeredDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Telemetry pill row */}
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-xs">
              <div className="rounded-xl bg-white/10 p-2.5">
                <div className="text-[10px] font-medium text-emerald-200/80 uppercase">Route / Division</div>
                <div className="mt-0.5 font-bold truncate text-white" title={collector.assignedRoute}>
                  {collector.assignedDivision}
                </div>
              </div>

              <div className="rounded-xl bg-white/10 p-2.5">
                <div className="text-[10px] font-medium text-emerald-200/80 uppercase">Vehicle</div>
                <div className="mt-0.5 font-bold truncate text-white" title={collector.vehicleNumber}>
                  {collector.vehicleNumber.split('(')[0]}
                </div>
              </div>

              <div className="rounded-xl bg-white/10 p-2.5">
                <div className="text-[10px] font-medium text-emerald-200/80 uppercase">Scale Status</div>
                <div className="mt-0.5 flex items-center gap-1.5 font-bold text-white">
                  <span className={`h-2 w-2 rounded-full ${collector.scaleStatus === 'Online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                  <span className="truncate">{collector.scaleDeviceId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact Bar */}
          <div className="flex items-center justify-between border-b border-[#f0ece3] bg-[#fbf9f5] px-6 py-3 text-xs">
            <div className="flex items-center gap-4">
              <a
                href={`tel:${collector.phoneNumber}`}
                className="flex items-center gap-1.5 font-semibold text-emerald-800 hover:text-emerald-950 font-mono"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-700" />
                <span>{collector.phoneNumber}</span>
              </a>
              <span className="text-slate-300">|</span>
              <a
                href={`mailto:${collector.email}`}
                className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 truncate"
              >
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{collector.email}</span>
              </a>
            </div>

            {/* Quick Status Toggle */}
            <div className="flex items-center gap-1.5">
              {collector.status === 'Active' ? (
                <button
                  onClick={() => onUpdateStatus(collector.id, 'On Leave')}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  Set On Leave
                </button>
              ) : (
                <button
                  onClick={() => onUpdateStatus(collector.id, 'Active')}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  Mark Active
                </button>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-[#eae5da] bg-white px-6">
            <button
              onClick={() => setActiveTab('smallholders')}
              className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 transition-all mr-6 ${
                activeTab === 'smallholders'
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Assigned Smallholders</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] text-emerald-800 font-bold">
                {smallholders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('scale-logs')}
              className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 transition-all mr-6 ${
                activeTab === 'scale-logs'
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Scale className="h-4 w-4" />
              <span>Scale Telemetry & Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'performance'
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Route KPIs</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* 1. ASSIGNED SMALLHOLDERS TAB */}
            {activeTab === 'smallholders' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">
                    {collector.assignedRoute}
                  </span>
                  <span>Total {collector.activeFarmersCount} Registered Growers</span>
                </div>

                    <div className="space-y-2.5">
                      {smallholders.map((sh) => (
                        <div
                          key={sh.code}
                          className="rounded-xl border border-slate-200 bg-[#fbfaf7] p-3.5 hover:border-emerald-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-[#183a27] px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                                {sh.code}
                              </span>
                              <h3 className="font-bold text-slate-900 text-xs">{sh.name}</h3>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600">
                              {sh.acreage} Acres
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 border-t border-slate-200/60 pt-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {sh.division}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              Last Pick: <strong>{sh.lastCollectionTime || 'Morning Slot'}</strong>
                            </span>
                            <span className="font-bold text-emerald-800">
                              ~{sh.estDailyKg} kg / day
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. SCALE LOGS & TELEMETRY TAB */}
                {activeTab === 'scale-logs' && (
                  <div className="space-y-4">
                    {/* Scale Device Specs Card */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-emerald-800" />
                          <span className="font-bold text-xs text-emerald-950">
                            {collector.scaleDeviceId}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Bluetooth Ble 5.2 Active
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs border-t border-emerald-200/60 pt-3">
                        <div>
                          <span className="text-[10px] text-emerald-800 uppercase font-semibold">Battery Charge</span>
                          <div className="flex items-center gap-1.5 mt-0.5 font-bold text-slate-800">
                            <BatteryMedium className="h-4 w-4 text-emerald-600" />
                            <span>{collector.batteryLevel || 88}% Charged</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-800 uppercase font-semibold">Calibration Check</span>
                          <div className="mt-0.5 flex items-center gap-1 font-bold text-slate-800">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Passed (Tare 0.00kg)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scale Intake Slip Stream */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Recent Electronic Scale Logs
                      </h4>

                      <div className="space-y-2">
                        {scaleLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-white hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">{log.slipId}</span>
                                <span className="text-[11px] text-slate-500">• {log.timestamp}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                {log.farmerName} ({log.farmerCode})
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xs font-extrabold text-slate-900">
                                {log.netKg.toFixed(1)} kg Net
                              </div>
                              <span
                                className={`inline-block mt-0.5 rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                                  log.status === 'Verified'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {log.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. ROUTE PERFORMANCE TAB */}
                {activeTab === 'performance' && performance && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[#ded8cc] bg-[#faf8f4] p-3.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Monthly Intake Volume
                        </span>
                        <div className="mt-1 text-xl font-black text-[#183a27]">
                          {performance.monthlyIntakeTons.toFixed(1)} Tons
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 mt-0.5 inline-block">
                          Top 15% Factory Route
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#ded8cc] bg-[#faf8f4] p-3.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          On-Time Arrival Rate
                        </span>
                        <div className="mt-1 text-xl font-black text-slate-800">
                          {performance.onTimeIntakeRate}%
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5 inline-block">
                          Target: &gt; 90% daily
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#ded8cc] bg-[#faf8f4] p-3.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Route Smallholder Coverage
                        </span>
                        <div className="mt-1 text-xl font-black text-slate-800">
                          {performance.routeCoveragePercentage}%
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5 inline-block">
                          {collector.activeFarmersCount} / {collector.activeFarmersCount + 3} visited
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#ded8cc] bg-[#faf8f4] p-3.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Vehicle Fuel Efficiency
                        </span>
                        <div className="mt-1 text-xl font-black text-slate-800">
                          {performance.fuelEfficiencyKmPerL} km/L
                        </div>
                        <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 inline-block">
                          Optimal for Hill Incline
                        </span>
                      </div>
                    </div>

                    {/* Operational Route Guide */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-emerald-800" />
                        <span>Transit Route Waypoints</span>
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Starts daily at <strong>07:30 AM</strong> from Factory Intake Shed 04 &rarr;
                        proceeds via {collector.assignedRoute} &rarr; returns to Weighbridge for 
                        electronic leaf discharge by <strong>02:00 PM</strong>.
                      </p>
                    </div>
                  </div>
                )}
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-[#eae5da] bg-white p-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close Details
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
