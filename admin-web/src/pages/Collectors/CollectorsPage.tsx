import { useState, useMemo } from 'react';
import {
  UserCheck,
  Truck,
  Scale,
  Search,
  Plus,
  Download,
  Filter,
  Users,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  BatteryMedium,
  Clock,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  SearchX,
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import type { CollectorStatus } from '../../types/collector.types';
import { collectorService } from '../../services/collectorService';

const DIVISIONS = [
  'All Divisions',
  'Nuwara Eliya Central',
  'Norwood',
  'Bogawantalawa',
  'Maskeliya',
  'Hatton',
  'Haputale',
  'Talawakelle',
  'Ratnapura',
];

export const CollectorsPage = () => {
  const {
    collectors,
    updateCollectorStatus,
    setIsAddCollectorModalOpen,
    setSelectedCollectorForDetail,
  } = useDashboard();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CollectorStatus | 'All'>('All');
  const [divisionFilter, setDivisionFilter] = useState('All Divisions');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Sorting state
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'intake'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dynamic Metrics Calculation
  const stats = useMemo(() => {
    const totalCollectors = collectors.length;
    const activeToday = collectors.filter((c) => c.status === 'Active').length;
    const todayIntakeKg = collectors.reduce((sum, c) => sum + c.todayIntakeKg, 0);
    const onLeave = collectors.filter((c) => c.status === 'On Leave').length;

    return {
      totalCollectors,
      activeToday,
      todayIntakeKg,
      onLeave,
    };
  }, [collectors]);

  // Filtered & Sorted Collectors
  const filteredCollectors = useMemo(() => {
    return collectors
      .filter((c) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          c.fullName.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.nicNumber.toLowerCase().includes(query) ||
          c.assignedRoute.toLowerCase().includes(query) ||
          c.vehicleNumber.toLowerCase().includes(query) ||
          c.phoneNumber.includes(query);

        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesDivision =
          divisionFilter === 'All Divisions' || c.assignedDivision === divisionFilter;

        return matchesSearch && matchesStatus && matchesDivision;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return sortOrder === 'asc'
            ? a.fullName.localeCompare(b.fullName)
            : b.fullName.localeCompare(a.fullName);
        }
        if (sortBy === 'intake') {
          return sortOrder === 'asc'
            ? a.todayIntakeKg - b.todayIntakeKg
            : b.todayIntakeKg - a.todayIntakeKg;
        }
        return sortOrder === 'asc'
          ? a.id.localeCompare(b.id)
          : b.id.localeCompare(a.id);
      });
  }, [collectors, searchQuery, statusFilter, divisionFilter, sortBy, sortOrder]);

  // Paginated items
  const totalPages = Math.max(1, Math.ceil(filteredCollectors.length / itemsPerPage));
  const displayedCollectors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCollectors.slice(start, start + itemsPerPage);
  }, [filteredCollectors, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setDivisionFilter('All Divisions');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    collectorService.exportRouteRosterCSV(filteredCollectors);
  };

  const toggleSort = (field: 'id' | 'name' | 'intake') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadgeStyle = (status: CollectorStatus) => {
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
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header & Metric Cards */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <h1 className="text-xl font-black tracking-tight text-[#16271c]">
                Field Tea Collectors
              </h1>
            </div>
            <p className="text-xs text-[#5f7165] mt-0.5">
              Manage estate field collection agents, assigned transit routes, and active weigh scale telemetry
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-[#ded8cc] bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="h-4 w-4 text-emerald-800" />
              <span>Export Route Roster (CSV)</span>
            </button>

            <button
              onClick={() => setIsAddCollectorModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#183a27] px-4 py-2 text-xs font-bold text-white hover:bg-[#122e1e] transition-colors shadow-xs"
            >
              <Plus className="h-4 w-4 text-emerald-300" />
              <span>+ Add New Collector</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Registered Collectors */}
          <div className="rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#69796e]">
                TOTAL COLLECTORS
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f6f2] text-emerald-800">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-[#16271c]">
                {stats.totalCollectors}
              </span>
              <span className="text-xs font-semibold text-slate-500">registered officers</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>Coverage: 100% Hill Basins</span>
              <span className="font-semibold text-emerald-700">All Sectors</span>
            </div>
          </div>

          {/* Actively Deployed Today */}
          <div className="rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#69796e]">
                ACTIVELY DEPLOYED
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f6f2] text-emerald-800">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-[#16271c]">
                {stats.activeToday} / {stats.totalCollectors}
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                {Math.round((stats.activeToday / (stats.totalCollectors || 1)) * 100)}% Deployed
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Transmitting real-time GPS & weights</span>
            </div>
          </div>

          {/* Today's Route Collections */}
          <div className="rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#69796e]">
                TODAY'S ROUTE INTAKE
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f6f2] text-emerald-800">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-[#16271c]">
                {stats.todayIntakeKg.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">kg collected</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
              Discharged to Factory Station 04
            </div>
          </div>

          {/* Scheduled Leave */}
          <div className="rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#69796e]">
                ON SCHEDULED LEAVE
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-amber-900">
                {stats.onLeave}
              </span>
              <span className="text-xs font-semibold text-slate-500">agents on rest</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
              Routes reassigned to backup officers
            </div>
          </div>
        </div>
      </div>

      {/* 2. Action & Filter Bar */}
      <div className="rounded-2xl border border-[#ded8cc] bg-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Collector ID, Name, NIC, Route, or Vehicle..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as CollectorStatus | 'All');
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Division Filter */}
            <select
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              {DIVISIONS.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>

            {(searchQuery || statusFilter !== 'All' || divisionFilter !== 'All Divisions') && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Collectors Data Table */}
      <div className="rounded-2xl border border-[#ded8cc] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f0ece3] bg-[#fcfbf9] text-[10px] font-bold uppercase tracking-wider text-[#69796e]">
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>COLLECTOR PROFILE</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">CONTACT INFO</th>
                <th className="py-3 px-4">ASSIGNED ROUTE & VEHICLE</th>
                <th className="py-3 px-4 text-center">GROWERS</th>
                <th
                  onClick={() => toggleSort('intake')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-emerald-800 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>TODAY INTAKE</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">SCALE TELEMETRY</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f5f1e8]">
              {displayedCollectors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <SearchX className="h-6 w-6" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-slate-800">
                      No matching tea collectors found
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                      No records matched &ldquo;{searchQuery || statusFilter || divisionFilter}&rdquo;. Try clearing filters or searching another route.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#183a27] px-4 py-2 text-xs font-bold text-white hover:bg-[#122e1e]"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Reset All Filters</span>
                    </button>
                  </td>
                </tr>
              ) : (
                displayedCollectors.map((collector) => {
                  const initials = collector.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={collector.id}
                      className="hover:bg-[#faf8f4]/80 transition-colors group"
                    >
                      {/* Collector Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#183a27] text-xs font-extrabold text-white shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                              {collector.fullName}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="font-mono font-bold text-emerald-800">
                                {collector.id}
                              </span>
                              <span>&bull;</span>
                              <span className="font-mono text-slate-500">{collector.nicNumber}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-mono font-semibold text-slate-700">
                            <Phone className="h-3 w-3 text-emerald-700" />
                            <span>{collector.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[160px]">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="truncate">{collector.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Route & Vehicle */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                            <span className="truncate max-w-[210px]" title={collector.assignedRoute}>
                              {collector.assignedRoute}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                            <Truck className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[190px]">{collector.vehicleNumber}</span>
                          </div>
                        </div>
                      </td>

                      {/* Smallholders Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
                          <Users className="h-3 w-3 text-slate-500" />
                          <span>{collector.activeFarmersCount}</span>
                        </span>
                      </td>

                      {/* Today Intake */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900">
                          {collector.todayIntakeKg > 0
                            ? `${collector.todayIntakeKg.toLocaleString()} kg`
                            : '—'}
                        </div>
                        {collector.todayIntakeKg > 0 && (
                          <span className="text-[10px] font-semibold text-emerald-700">
                            Station 04 Discharged
                          </span>
                        )}
                      </td>

                      {/* Scale Telemetry */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                collector.scaleStatus === 'Online'
                                  ? 'bg-emerald-500 animate-pulse'
                                  : 'bg-slate-300'
                              }`}
                            />
                            <span className="font-mono font-bold text-[11px] text-slate-800">
                              {collector.scaleDeviceId}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <BatteryMedium className="h-3 w-3 text-emerald-700" />
                            <span>{collector.batteryLevel || 85}% Charged</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusBadgeStyle(
                            collector.status
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              collector.status === 'Active'
                                ? 'bg-emerald-600'
                                : collector.status === 'On Leave'
                                ? 'bg-amber-600'
                                : 'bg-rose-600'
                            }`}
                          />
                          {collector.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCollectorForDetail(collector)}
                            className="flex items-center gap-1 rounded-lg border border-[#d6cfc2] bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-900 transition-colors shadow-2xs"
                            title="View Route & Smallholders"
                          >
                            <Eye className="h-3.5 w-3.5 text-emerald-800" />
                            <span>View</span>
                          </button>

                          {collector.status === 'Active' ? (
                            <button
                              onClick={() => updateCollectorStatus(collector.id, 'On Leave')}
                              className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
                              title="Mark as On Leave"
                            >
                              Leave
                            </button>
                          ) : (
                            <button
                              onClick={() => updateCollectorStatus(collector.id, 'Active')}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                              title="Mark as Active"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer */}
        {filteredCollectors.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ece3] bg-[#fcfbf9] px-4 py-3 text-xs text-slate-600">
            <div>
              Showing{' '}
              <span className="font-bold text-slate-900">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="font-bold text-slate-900">
                {Math.min(currentPage * itemsPerPage, filteredCollectors.length)}
              </span>{' '}
              of <span className="font-bold text-slate-900">{filteredCollectors.length}</span>{' '}
              collectors
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors ${
                      currentPage === page
                        ? 'bg-[#183a27] text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
