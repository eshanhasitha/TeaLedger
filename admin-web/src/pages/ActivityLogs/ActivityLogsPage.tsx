import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { exportToCsv } from '../../utils/exportToCsv';

type AuditCategory = 'All' | 'Prices' | 'Settlements' | 'Collections' | 'Accounts';

interface AuditRow {
  id: string;
  time: string;
  user: string;
  action: string;
  record: string;
  details: string;
  category: Exclude<AuditCategory, 'All'>;
}

const AUDIT_LOGS: AuditRow[] = [
  { id: 'A-1', time: '14 Nov, 10:42', user: 'Sunil Jayawardena', action: 'Accepted server weight', record: 'Slip L-4815', details: 'Final weight updated from 37.80 kg to 35.90 kg', category: 'Collections' },
  { id: 'A-2', time: '14 Nov, 09:30', user: 'Sunil Jayawardena', action: 'Scheduled tea price', record: 'Price P-03', details: 'Set LKR 255.00/kg effective 01 Dec 2026', category: 'Prices' },
  { id: 'A-3', time: '13 Nov, 18:10', user: 'Sunil Jayawardena', action: 'Created farmer account', record: 'Farmer F-1428', details: 'Assigned Kamal Perera to Nimal Silva (C-02)', category: 'Accounts' },
  { id: 'A-4', time: '12 Nov, 16:05', user: 'Sunil Jayawardena', action: 'Generated draft settlement', record: 'SET-2026-10', details: 'Calculated Oct 2026 totals for 1,428 farmers', category: 'Settlements' },
  { id: 'A-5', time: '11 Nov, 11:20', user: 'Sunil Jayawardena', action: 'Posted deduction', record: 'Ref D-5017', details: 'Materials LKR 1,500 applied to Ajith Bandara', category: 'Accounts' },
];

export const ActivityLogsPage: React.FC = () => {
  const { addToast } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState<AuditCategory>('All');

  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return AUDIT_LOGS.filter((log) => {
      const matchesSearch =
        !q ||
        log.user.toLowerCase().includes(q) ||
        log.record.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q);
      const matchesCat = filterCat === 'All' || log.category === filterCat;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, filterCat]);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 font-['Inter',sans-serif]">
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#17201B] text-2xl sm:text-[26px] font-bold tracking-tight">
            Audit log
          </h1>
          <p className="text-[#56625B] text-[13px]">
            Who changed what, and when
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            exportToCsv('tealedger-audit-log.csv', filteredLogs);
            addToast({ type: 'success', title: 'Audit Log Exported', message: 'Audit log exported to CSV.' });
          }}
          className="px-4 py-2.5 bg-white border border-[#DCE2DC] hover:bg-[#F4F6F3] text-[#17201B] rounded-lg text-sm font-semibold cursor-pointer transition-colors"
        >
          Export
        </button>
      </div>

      {/* Search & Category Pills */}
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex-1 px-3.5 py-2.5 bg-white rounded-lg border border-[#DCE2DC] flex items-center gap-2 focus-within:border-[#0B5D3B] focus-within:ring-2 focus-within:ring-[#E1F4E8]">
          <Search className="size-4 text-[#56625B] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user or record"
            className="flex-1 text-[#17201B] placeholder:text-[#56625B] text-sm bg-transparent outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#56625B] hover:text-[#17201B] p-0.5 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 overflow-x-auto">
          {(['All', 'Prices', 'Settlements', 'Collections', 'Accounts'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCat(cat)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                filterCat === cat
                  ? 'bg-[#0B5D3B] text-white'
                  : 'bg-white border border-[#DCE2DC] text-[#56625B] hover:text-[#17201B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="self-stretch bg-white rounded-xl border border-[#DCE2DC] overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[780px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F6F3] border-b border-[#DCE2DC] text-[#56625B] text-xs font-semibold">
                <th className="py-3 px-5">Time</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Record</th>
                <th className="py-3 px-5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE2DC] text-[13px] text-[#17201B]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F4F6F3]/60 transition-colors">
                  <td className="py-3 px-5 text-[#56625B] whitespace-nowrap">{log.time}</td>
                  <td className="py-3 px-4">{log.user}</td>
                  <td className="py-3 px-4 font-bold">{log.action}</td>
                  <td className="py-3 px-4 font-medium">{log.record}</td>
                  <td className="py-3 px-5 text-[#56625B]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex justify-between items-center border-t border-[#DCE2DC] bg-white">
          <span className="text-[#56625B] text-xs">Showing 1–{filteredLogs.length} of 2,310</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled className="px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-xs font-semibold opacity-40">Previous</button>
            <button type="button" className="px-3.5 py-1.5 rounded-lg border border-[#DCE2DC] text-xs font-semibold hover:bg-[#F4F6F3] cursor-pointer">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

