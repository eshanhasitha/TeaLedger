import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

interface ExportJob {
  id: string;
  report: string;
  period: string;
  generatedBy: string;
  generatedOn: string;
  format: string;
  status: 'Ready' | 'Generating' | 'Failed';
}

const REPORT_CARDS = [
  {
    id: 'collections',
    title: 'Collections summary',
    description: 'Daily and monthly intake totals by collector, area and slip status.',
  },
  {
    id: 'farmer-statement',
    title: 'Farmer statement',
    description: 'Individual grower leaf weights, gross earnings, loan repayments and net pay.',
  },
  {
    id: 'settlement',
    title: 'Settlement report',
    description: 'Full monthly settlement ledger reconciled to verified weighbridge slips.',
  },
  {
    id: 'loan-outstanding',
    title: 'Loan outstanding',
    description: 'Active advances, monthly deductions and remaining balances per farmer.',
  },
];

const INITIAL_EXPORTS: ExportJob[] = [
  { id: 'EXP-01', report: 'Settlement report', period: 'Oct 2026', generatedBy: 'Sunil Jayawardena', generatedOn: '14 Nov 2026, 09:15', format: 'CSV', status: 'Ready' },
  { id: 'EXP-02', report: 'Collections summary', period: 'Nov 2026', generatedBy: 'Sunil Jayawardena', generatedOn: '14 Nov 2026, 08:40', format: 'CSV', status: 'Generating' },
  { id: 'EXP-03', report: 'Loan outstanding', period: 'Oct 2026', generatedBy: 'Sunil Jayawardena', generatedOn: '12 Nov 2026, 17:05', format: 'PDF', status: 'Failed' },
];

export const ReportsPage: React.FC = () => {
  const { addToast } = useDashboard();
  const [period, setPeriod] = useState('Oct 2026');
  const [area, setArea] = useState('All areas');
  const [format, setFormat] = useState('CSV');
  const [exports, setExports] = useState<ExportJob[]>(INITIAL_EXPORTS);

  const handleGenerate = (reportTitle: string) => {
    const newJob: ExportJob = {
      id: `EXP-0${exports.length + 1}`,
      report: reportTitle,
      period,
      generatedBy: 'Sunil Jayawardena',
      generatedOn: 'Just now',
      format,
      status: 'Ready',
    };
    setExports((prev) => [newJob, ...prev]);
    addToast({
      type: 'success',
      title: 'Report Generated',
      message: `${reportTitle} (${period}, ${format}) is ready for download.`,
    });
  };

  const renderStatus = (status: ExportJob['status']) => {
    if (status === 'Ready') {
      return (
        <span className="px-2.5 py-0.5 bg-[#E1F4E8] text-[#0B5D3B] rounded-full text-xs font-semibold">
          ✓ Ready
        </span>
      );
    }
    if (status === 'Generating') {
      return (
        <span className="px-2.5 py-0.5 bg-[#FEF3C7] text-[#B45309] rounded-full text-xs font-semibold">
          ⟳ Generating
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 bg-[#FEF2F2] text-[#B91C1C] rounded-full text-xs font-semibold">
        ! Failed
      </span>
    );
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 font-['Inter',sans-serif]">
      <div className="flex flex-col gap-1">
        <h1 className="text-[#17201B] text-2xl sm:text-[26px] font-bold tracking-tight">
          Reports
        </h1>
        <p className="text-[#56625B] text-[13px]">
          Generate and export operational and financial reports
        </p>
      </div>

      {/* Filter Dropdown Pills */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 pl-3.5 pr-8 appearance-none bg-white border border-[#DCE2DC] rounded-full text-xs font-semibold text-[#17201B] outline-none cursor-pointer"
          >
            <option value="Oct 2026">Period: Oct 2026</option>
            <option value="Nov 2026">Period: Nov 2026</option>
            <option value="Sep 2026">Period: Sep 2026</option>
          </select>
          <ChevronDown className="size-3.5 text-[#56625B] pointer-events-none absolute right-3 top-2.5" />
        </div>

        <div className="relative">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="h-9 pl-3.5 pr-8 appearance-none bg-white border border-[#DCE2DC] rounded-full text-xs font-semibold text-[#17201B] outline-none cursor-pointer"
          >
            <option value="All areas">Area: All areas</option>
            <option value="Highland Block 03">Area: Highland Block 03</option>
            <option value="Highland Block 04">Area: Highland Block 04</option>
          </select>
          <ChevronDown className="size-3.5 text-[#56625B] pointer-events-none absolute right-3 top-2.5" />
        </div>

        <div className="relative">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="h-9 pl-3.5 pr-8 appearance-none bg-white border border-[#DCE2DC] rounded-full text-xs font-semibold text-[#17201B] outline-none cursor-pointer"
          >
            <option value="CSV">Format: CSV</option>
            <option value="PDF">Format: PDF</option>
          </select>
          <ChevronDown className="size-3.5 text-[#56625B] pointer-events-none absolute right-3 top-2.5" />
        </div>
      </div>

      {/* 2x2 Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_CARDS.map((card) => (
          <div
            key={card.id}
            className="p-5 bg-white rounded-xl border border-[#DCE2DC] flex items-center justify-between gap-4"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-[#17201B] text-base font-bold">{card.title}</h3>
              <p className="text-[#56625B] text-xs leading-relaxed">{card.description}</p>
            </div>
            <button
              type="button"
              onClick={() => handleGenerate(card.title)}
              className="px-4 py-2 bg-white border border-[#DCE2DC] hover:bg-[#F4F6F3] text-[#17201B] rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors"
            >
              Generate
            </button>
          </div>
        ))}
      </div>

      {/* Recent Exports Table */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[#17201B] text-base font-bold">
          Recent exports
        </h2>

        <div className="self-stretch bg-white rounded-xl border border-[#DCE2DC] overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F6F3] border-b border-[#DCE2DC] text-[#56625B] text-xs font-semibold">
                  <th className="py-3 px-5">Report</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Generated by</th>
                  <th className="py-3 px-4">Generated on</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE2DC] text-[13px] text-[#17201B]">
                {exports.map((job) => (
                  <tr key={job.id} className="hover:bg-[#F4F6F3]/60 transition-colors">
                    <td className="py-3 px-5 font-medium">{job.report}</td>
                    <td className="py-3 px-4">{job.period}</td>
                    <td className="py-3 px-4">{job.generatedBy}</td>
                    <td className="py-3 px-4 text-[#56625B]">{job.generatedOn}</td>
                    <td className="py-3 px-4 font-medium">{job.format}</td>
                    <td className="py-3 px-5">{renderStatus(job.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[#56625B] text-xs">
          Exports apply the same access rules as on-screen data. Report definitions are subject to approval.
        </p>
      </div>
    </div>
  );
};

