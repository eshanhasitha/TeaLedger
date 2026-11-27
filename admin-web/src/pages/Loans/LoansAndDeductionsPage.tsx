import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, RefreshCw, X } from 'lucide-react';
import { loanService, INITIAL_LOANS } from '../../services/loanService';
import { deductionService, INITIAL_DEDUCTIONS } from '../../services/deductionService';
import type {
  AdminLoanRecord,
  LoanRecordStatus,
  LoansOverviewResponse,
} from '../../types/loan.types';
import type {
  AdminDeductionRecord,
  DeductionFilterCategory,
} from '../../types/deduction.types';

type ActiveSubTab = 'Loans' | 'Deductions';

export const LoansAndDeductionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab: ActiveSubTab =
    searchParams.get('tab') === 'deductions' ? 'Deductions' : 'Loans';

  const [subTab, setSubTab] = useState<ActiveSubTab>(initialTab);
  const [loansData, setLoansData] = useState<LoansOverviewResponse>({
    items: INITIAL_LOANS,
    activeLoansCount: 212,
    totalFarmersCount: 1428,
    outstandingTotalLkr: 6400000,
    outstandingFormatted: '6.4M',
    repaidThisMonthLkr: 900000,
    repaidThisMonthFormatted: '0.9M',
    asOfLabel: '14 Nov 2026',
    totalCount: 212,
  });

  const [deductions, setDeductions] = useState<AdminDeductionRecord[]>(INITIAL_DEDUCTIONS);
  const [deductionsTotalCount, setDeductionsTotalCount] = useState<number>(96);
  const [deductionSearch, setDeductionSearch] = useState<string>('');
  const [deductionCategory, setDeductionCategory] = useState<DeductionFilterCategory>('All');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageSize = 4;

  const fetchLoans = () => {
    setIsLoading(true);
    setErrorMessage(null);
    loanService
      .getAdminLoans()
      .then((res) => {
        setLoansData(res);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load loans from backend.'
        );
        setIsLoading(false);
      });
  };

  const fetchDeductions = (search: string, category: DeductionFilterCategory) => {
    setIsLoading(true);
    setErrorMessage(null);
    deductionService
      .getAdminDeductions({ search, category })
      .then((res) => {
        setDeductions(res.items);
        setDeductionsTotalCount(res.totalCount);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load deductions from backend.'
        );
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;

    loanService
      .getAdminLoans()
      .then((loansRes) => {
        if (!ignore) {
          setLoansData(loansRes);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Failed to load loans from backend.'
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    deductionService
      .getAdminDeductions({ search: deductionSearch, category: deductionCategory })
      .then((res) => {
        if (!ignore) {
          setDeductions(res.items);
          setDeductionsTotalCount(res.totalCount);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Failed to load deductions from backend.'
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, [deductionSearch, deductionCategory]);

  const handleTabSwitch = (tab: ActiveSubTab) => {
    setSubTab(tab);
    setCurrentPage(1);
    setSearchParams(tab === 'Deductions' ? { tab: 'deductions' } : {});
  };

  const renderLoanStatusBadge = (status: LoanRecordStatus) => {
    switch (status) {
      case 'Overdue':
        return (
          <div
            data-status="danger"
            className="px-2.5 py-1 bg-status-danger-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-danger text-xs font-semibold font-['Inter']">
              ! Overdue
            </span>
          </div>
        );
      case 'Repaid':
      case 'Closed':
        return (
          <div
            data-status="success"
            className="px-2.5 py-1 bg-status-success-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-success text-xs font-semibold font-['Inter']">
              ✓ Repaid
            </span>
          </div>
        );
      case 'Active':
      default:
        return (
          <div
            data-status="info"
            className="px-2.5 py-1 bg-status-info-bg rounded-[999px] inline-flex justify-start items-center"
          >
            <span className="justify-start text-status-info text-xs font-semibold font-['Inter']">
              ● Active
            </span>
          </div>
        );
    }
  };

  const renderDeductionStatusBadge = (status: AdminDeductionRecord['status']) => {
    if (status === 'Reversed') {
      return (
        <div
          data-status="neutral"
          className="px-2.5 py-1 bg-status-neutral-bg rounded-[999px] inline-flex justify-start items-center"
        >
          <span className="justify-start text-status-neutral text-xs font-semibold font-['Inter']">
            ● Reversed
          </span>
        </div>
      );
    }

    return (
      <div
        data-status="success"
        className="px-2.5 py-1 bg-status-success-bg rounded-[999px] inline-flex justify-start items-center"
      >
        <span className="justify-start text-status-success text-xs font-semibold font-['Inter']">
          ✓ Posted
        </span>
      </div>
    );
  };

  const activeTotalCount = subTab === 'Loans' ? loansData.totalCount : deductionsTotalCount;
  const startRecord = activeTotalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, activeTotalCount);
  const totalPages = Math.max(1, Math.ceil(activeTotalCount / pageSize));

  return (
    <div className="w-full max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-start gap-6 font-['Inter',sans-serif]">
      {/* Backend Notice Banner */}
      {errorMessage && (
        <div className="w-full p-4 rounded-xl border border-amber-200 bg-amber-50/90 text-amber-900 flex items-center justify-between text-xs sm:text-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 sm:size-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-semibold">Notice:</span> {errorMessage} Displaying offline cached records.
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              subTab === 'Loans'
                ? fetchLoans()
                : fetchDeductions(deductionSearch, deductionCategory)
            }
            disabled={isLoading}
            className="px-3 py-1.5 bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      )}

      {/* 1. Header */}
      <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col justify-start items-start gap-1 overflow-hidden">
          <h1 className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter'] tracking-tight">
            Loans &amp; deductions
          </h1>
          <div className="self-stretch justify-start text-text-secondary text-xs sm:text-sm font-normal font-['Inter']">
            Track loans, repayments and deductions applied to settlements
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(subTab === 'Loans' ? '/deductions/loans/new' : '/deductions/new')
          }
          className="w-full sm:w-auto px-5 py-3 sm:py-3.5 bg-brand-primary hover:bg-brand-primary-hover active:bg-emerald-800 rounded-xl flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs text-white shrink-0"
        >
          <span className="text-text-on-primary text-sm sm:text-base font-semibold font-['Inter']">
            {subTab === 'Loans' ? 'Create loan' : 'Add deduction'}
          </span>
        </button>
      </div>

      {/* 2. Pill Switcher: Loans | Deductions */}
      <div className="flex justify-start items-center gap-2 overflow-hidden">
        {(['Loans', 'Deductions'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabSwitch(tab)}
            className={`px-3.5 py-2 rounded-[999px] flex justify-start items-start overflow-hidden text-xs font-semibold font-['Inter'] cursor-pointer transition-all ${
              subTab === tab
                ? 'bg-brand-primary text-text-on-primary shadow-xs'
                : 'bg-surface-card outline outline-1 outline-offset-[-1px] outline-border-default text-text-secondary hover:text-text-primary hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Sub-view Header Controls */}
      {subTab === 'Loans' ? (
        <div className="self-stretch grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-hidden">
          <div className="px-4 py-4 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-1.5 overflow-hidden shadow-xs">
            <div className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']">
              Active loans
            </div>
            <div className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter']">
              {loansData.activeLoansCount}
            </div>
            <div className="self-stretch justify-start text-text-secondary text-xs font-normal font-['Inter']">
              Across {loansData.totalFarmersCount.toLocaleString()} farmers
            </div>
          </div>

          <div className="px-4 py-4 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-1.5 overflow-hidden shadow-xs">
            <div className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']">
              Outstanding (LKR)
            </div>
            <div className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter']">
              {loansData.outstandingFormatted}
            </div>
            <div className="self-stretch justify-start text-text-secondary text-xs font-normal font-['Inter']">
              As of {loansData.asOfLabel}
            </div>
          </div>

          <div className="px-4 py-4 bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start gap-1.5 overflow-hidden shadow-xs">
            <div className="self-stretch justify-start text-text-secondary text-xs font-medium font-['Inter']">
              Repaid this month (LKR)
            </div>
            <div className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter']">
              {loansData.repaidThisMonthFormatted}
            </div>
            <div className="self-stretch justify-start text-text-secondary text-xs font-normal font-['Inter']">
              Posted repayments
            </div>
          </div>
        </div>
      ) : (
        <div className="self-stretch flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 overflow-hidden">
          {/* Deductions Search Input */}
          <div className="flex-1 px-3.5 py-2.5 bg-surface-card rounded-xl outline outline-1 outline-offset-[-1px] outline-border-default flex justify-start items-center gap-2 overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-emerald-200">
            <Search className="size-4 text-text-secondary shrink-0" />
            <input
              type="text"
              value={deductionSearch}
              onChange={(e) => {
                setDeductionSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by farmer or reference"
              className="flex-1 justify-start text-text-primary placeholder:text-text-secondary text-xs sm:text-sm font-normal font-['Inter'] bg-transparent outline-none border-none focus:ring-0"
            />
            {deductionSearch && (
              <button
                type="button"
                onClick={() => {
                  setDeductionSearch('');
                  setCurrentPage(1);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Deductions Category Pills: All / Materials / Loan repayment / Other */}
          <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 lg:pb-0">
            {(['All', 'Materials', 'Loan repayment', 'Other'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setDeductionCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-[999px] flex justify-start items-start overflow-hidden text-xs font-semibold font-['Inter'] whitespace-nowrap cursor-pointer transition-all ${
                  deductionCategory === cat
                    ? 'bg-brand-primary text-text-on-primary shadow-xs'
                    : 'bg-surface-card outline outline-1 outline-offset-[-1px] outline-border-default text-text-secondary hover:text-text-primary hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Data Table */}
      <div className="self-stretch bg-surface-card rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-default flex flex-col justify-start items-start overflow-hidden shadow-xs">
        <div className="w-full overflow-x-auto">
          {subTab === 'Loans' ? (
            <div className="min-w-[760px] w-full">
              {/* Loans Table Header */}
              <div className="self-stretch px-5 py-3 bg-surface-muted flex justify-start items-center gap-4 overflow-hidden border-b border-border-default">
                <div className="w-16 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Loan
                </div>
                <div className="w-40 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Farmer
                </div>
                <div className="w-24 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Principal
                </div>
                <div className="w-24 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Repaid
                </div>
                <div className="w-28 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Outstanding
                </div>
                <div className="w-28 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Next repayment
                </div>
                <div className="flex-1 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Status
                </div>
              </div>

              {/* Loans Table Rows */}
              {loansData.items.map((loan: AdminLoanRecord) => (
                <div
                  key={loan.id}
                  className="self-stretch px-5 py-3 border-b border-border-default flex justify-start items-center gap-4 overflow-hidden hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-16 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                    {loan.loanCode}
                  </div>
                  <div className="w-40 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                    {loan.farmerName}
                  </div>
                  <div className="w-24 text-right justify-start text-text-primary text-xs font-normal font-['Inter']">
                    {loan.principalAmount.toLocaleString()}
                  </div>
                  <div className="w-24 text-right justify-start text-text-primary text-xs font-normal font-['Inter']">
                    {loan.totalRepaid.toLocaleString()}
                  </div>
                  <div className="w-28 text-right justify-start text-text-primary text-xs font-semibold font-['Inter']">
                    {loan.outstandingBalance.toLocaleString()}
                  </div>
                  <div className="w-28 justify-start text-text-primary text-xs font-normal font-['Inter']">
                    {loan.nextRepaymentLabel}
                  </div>
                  <div className="flex-1 flex justify-start items-start overflow-hidden">
                    {renderLoanStatusBadge(loan.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="min-w-[760px] w-full">
              {/* Deductions Table Header */}
              <div className="self-stretch px-5 py-3 bg-surface-muted flex justify-start items-center gap-4 overflow-hidden border-b border-border-default">
                <div className="w-16 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Ref
                </div>
                <div className="w-40 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Farmer
                </div>
                <div className="w-32 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Category
                </div>
                <div className="w-28 text-right justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Amount (LKR)
                </div>
                <div className="w-28 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Date
                </div>
                <div className="w-32 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Posted by
                </div>
                <div className="flex-1 justify-start text-text-secondary text-xs font-semibold font-['Inter']">
                  Status
                </div>
              </div>

              {/* Deductions Table Rows */}
              {deductions.length === 0 ? (
                <div className="p-8 text-center text-text-secondary text-sm">
                  No deductions found matching your criteria.
                </div>
              ) : (
                deductions.map((ded) => (
                  <div
                    key={ded.id}
                    className="self-stretch px-5 py-3 border-b border-border-default flex justify-start items-center gap-4 overflow-hidden hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="w-16 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                      {ded.deductionCode}
                    </div>
                    <div className="w-40 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                      {ded.farmerName}
                    </div>
                    <div className="w-32 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                      {ded.category}
                    </div>
                    <div className="w-28 text-right justify-start text-text-primary text-xs font-semibold font-['Inter']">
                      {ded.amount.toLocaleString()}
                    </div>
                    <div className="w-28 justify-start text-text-primary text-xs font-normal font-['Inter']">
                      {ded.occurredAtLabel}
                    </div>
                    <div className="w-32 justify-start text-text-primary text-xs font-normal font-['Inter'] truncate">
                      {ded.postedBy}
                    </div>
                    <div className="flex-1 flex justify-start items-start overflow-hidden">
                      {renderDeductionStatusBadge(ded.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="self-stretch px-5 py-3 flex justify-between items-center gap-2 overflow-hidden bg-white">
          <div className="flex-1 justify-start text-text-secondary text-xs font-normal font-['Inter']">
            Showing {startRecord}–{endRecord} of {activeTotalCount}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              className={`px-3.5 py-2 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-border-default flex justify-start items-start overflow-hidden text-brand-primary text-xs font-semibold font-['Inter'] transition-colors ${
                currentPage <= 1
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-slate-50 cursor-pointer active:bg-slate-100'
              }`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className={`px-3.5 py-2 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-border-default flex justify-start items-start overflow-hidden text-brand-primary text-xs font-semibold font-['Inter'] transition-colors ${
                currentPage >= totalPages
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-slate-50 cursor-pointer active:bg-slate-100'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
