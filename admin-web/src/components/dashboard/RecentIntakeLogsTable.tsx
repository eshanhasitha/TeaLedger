import { useState, type ChangeEvent } from 'react';
import {
  FileText,
  Filter,
  Download,
  RefreshCw,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import type { IntakeSlip } from '../../types/dashboard.types';

export const RecentIntakeLogsTable = () => {
  const {
    slips,
    searchQuery,
    verifySlip,
    setSelectedSlipForReview,
    setSelectedSlipForPrint,
    triggerScaleSync,
    isScaleSyncing,
    addToast,
  } = useDashboard();

  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Flagged Wt' | 'Pending'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Filter slips by search query and status filter
  const filteredSlips = slips.filter((slip) => {
    const matchesSearch =
      !searchQuery ||
      slip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slip.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slip.farmerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slip.collectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slip.division.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || slip.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSlips.length / itemsPerPage));
  const displayedSlips = filteredSlips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as IntakeSlip['status'] | 'All';
    setStatusFilter(value);
  };

  const handleExportCSV = () => {
    const headers = [
      'Slip ID',
      'Farmer Name',
      'Farmer Code',
      'Division',
      'Collector',
      'Gross Kg',
      'Tare Kg',
      'Net Kg',
      'Rate (LKR)',
      'Total Payable (LKR)',
      'Status',
      'Timestamp',
    ];
    const rows = filteredSlips.map((s) => [
      s.id,
      `"${s.farmerName}"`,
      s.farmerCode,
      `"${s.division}"`,
      `"${s.collectorName}"`,
      s.grossKg,
      s.tareKg,
      s.netKg,
      s.ratePerKg,
      s.totalPayable,
      s.status,
      s.timestamp,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tea_intake_slips_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'CSV Export Generated',
      message: `${filteredSlips.length} intake slips exported successfully.`,
    });
  };

  return (
    <div className="rounded-2xl border border-[#ded8cc] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f0ece3] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#183a27] text-emerald-200">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a2b20]">
              Recent Tea Leaf Intake Logs
            </h2>
            <p className="text-xs text-[#6e7d73]">
              Real-time electronic scale stream from Weighbridge 01, 02 & 03
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter toggle */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="appearance-none rounded-xl border border-[#ded8cc] bg-[#fbf9f5] px-3 py-1.5 pr-8 text-xs font-semibold text-slate-700 hover:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified Only</option>
              <option value="Flagged Wt">Flagged Weight Only</option>
              <option value="Pending">Pending Only</option>
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-[#ded8cc] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-600 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={triggerScaleSync}
            disabled={isScaleSyncing}
            className="flex items-center gap-1.5 rounded-xl border border-[#ded8cc] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-600 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-emerald-700 ${
                isScaleSyncing ? 'animate-spin' : ''
              }`}
            />
            <span>{isScaleSyncing ? 'Syncing...' : 'Sync Scale'}</span>
          </button>
        </div>
      </div>

      {/* Table responsive wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#f0ece3] text-[10px] font-bold uppercase tracking-wider text-[#69796e]">
              <th className="py-3 px-3">SLIP ID</th>
              <th className="py-3 px-3">FARMER</th>
              <th className="py-3 px-3">COLLECTOR</th>
              <th className="py-3 px-3 text-right">GROSS (KG)</th>
              <th className="py-3 px-3 text-right">TARE/DED (KG)</th>
              <th className="py-3 px-3 text-right">NET WT (KG)</th>
              <th className="py-3 px-3 text-right">RATE (LKR)</th>
              <th className="py-3 px-3 text-right">TOTAL PAYABLE</th>
              <th className="py-3 px-3 text-center">STATUS</th>
              <th className="py-3 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f1e8]">
            {displayedSlips.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No intake slips match your search criteria.
                </td>
              </tr>
            ) : (
              displayedSlips.map((slip: IntakeSlip) => (
                <tr
                  key={slip.id}
                  className="hover:bg-[#faf7f2]/80 transition-colors"
                >
                  {/* Slip ID */}
                  <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {slip.id}
                  </td>

                  {/* Farmer */}
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[#1b2b21]">{slip.farmerName}</div>
                    <div className="text-[11px] text-[#6e7d73]">
                      {slip.farmerCode} • {slip.division}
                    </div>
                  </td>

                  {/* Collector */}
                  <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                    <span className="font-semibold text-slate-900">
                      {slip.collectorId}
                    </span>{' '}
                    • {slip.collectorName}
                  </td>

                  {/* Gross (kg) */}
                  <td className="py-3.5 px-3 text-right font-medium text-slate-800">
                    {slip.grossKg.toFixed(1)}
                  </td>

                  {/* Tare/Ded (kg) */}
                  <td className="py-3.5 px-3 text-right font-semibold text-rose-600">
                    {slip.tareKg < 0 ? slip.tareKg.toFixed(1) : `-${slip.tareKg.toFixed(1)}`}
                  </td>

                  {/* Net Wt (kg) */}
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                    {slip.netKg.toFixed(1)}
                  </td>

                  {/* Rate (LKR) */}
                  <td className="py-3.5 px-3 text-right text-slate-600">
                    {slip.ratePerKg.toFixed(2)}
                  </td>

                  {/* Total Payable */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">
                      LKR
                    </span>
                    <span className="font-bold text-slate-900">
                      {slip.totalPayable.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {slip.status === 'Verified' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                        Verified
                      </span>
                    )}
                    {slip.status === 'Flagged Wt' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                        Flagged Wt
                      </span>
                    )}
                    {slip.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedSlipForPrint(slip)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                        title="Print Intake Slip"
                      >
                        <Printer className="h-4 w-4" />
                      </button>

                      {slip.status === 'Flagged Wt' && (
                        <button
                          onClick={() => setSelectedSlipForReview(slip)}
                          className="rounded-lg border border-[#ded8cc] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#183a27] hover:border-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          Review
                        </button>
                      )}

                      {slip.status === 'Pending' && (
                        <button
                          onClick={() => verifySlip(slip.id)}
                          className="rounded-lg bg-emerald-50 border border-emerald-300 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Pagination */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ece3] pt-3 text-xs text-[#6e7d73]">
        <div>
          Showing {displayedSlips.length} of {180 + slips.length} Intake slips recorded today
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-[#ded8cc] bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          <span className="px-2 text-xs font-semibold text-slate-800">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-[#ded8cc] bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
