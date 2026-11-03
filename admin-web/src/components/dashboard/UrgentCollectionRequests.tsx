import React, { useState } from 'react';
import { AlertOctagon, UserPlus, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const UrgentCollectionRequests: React.FC = () => {
  const { requests, assignCollectorToRequest } = useDashboard();
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const collectorsList = [
    'C-02 • Nalin Kumara',
    'C-04 • Priyantha Kumara',
    'C-08 • Dilshan Perera',
    'C-11 • Kasun Wickrama',
    'C-15 • Roshan Dias',
  ];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#ded8cc] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0ece3] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a2b20]">
                Urgent Field Collection Requests
              </h2>
              <p className="text-xs text-[#6e7d73]">
                Growers awaiting lorry/truck pickup to prevent leaf fermentation
              </p>
            </div>
          </div>

          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
            14 Urgent Sheds
          </span>
        </div>

        {/* Requests List */}
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f0ece3] text-[10px] font-bold uppercase tracking-wider text-[#69796e]">
                <th className="py-2.5 px-2">REQ ID</th>
                <th className="py-2.5 px-2">SECTOR / ESTATE</th>
                <th className="py-2.5 px-2">FARMER</th>
                <th className="py-2.5 px-2">EST. VOLUME</th>
                <th className="py-2.5 px-2">ASSIGNED COLLECTOR</th>
                <th className="py-2.5 px-2 text-center">STATUS</th>
                <th className="py-2.5 px-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f1e8]">
              {requests.slice(0, 3).map((req) => (
                <tr key={req.id} className="hover:bg-[#faf7f2]/80 transition-colors">
                  <td className="py-3 px-2 font-bold text-slate-900 whitespace-nowrap">
                    {req.id}
                  </td>

                  <td className="py-3 px-2">
                    <div className="font-semibold text-slate-800">{req.sector}</div>
                    <div className="text-[11px] text-[#6e7d73]">{req.postOrShed}</div>
                  </td>

                  <td className="py-3 px-2">
                    <div className="font-semibold text-slate-800">{req.farmerName}</div>
                    <div className="text-[11px] text-[#6e7d73]">{req.farmerCode}</div>
                  </td>

                  <td className="py-3 px-2 whitespace-nowrap">
                    <span className="font-bold text-slate-900">
                      {req.bagsCount} Bags
                    </span>{' '}
                    <span className="text-[11px] text-slate-500">
                      (~{req.estimatedKg} kg)
                    </span>
                  </td>

                  <td className="py-3 px-2 whitespace-nowrap">
                    {req.assignedCollector ? (
                      <span className="font-medium text-emerald-900">
                        {req.assignedCollector}
                      </span>
                    ) : (
                      <span className="font-bold text-rose-600">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3 px-2 text-center whitespace-nowrap">
                    {req.status === 'En Route' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                        En Route
                      </span>
                    )}
                    {req.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
                        Pending
                      </span>
                    )}
                    {req.status === 'Accepted' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                        Accepted
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-2 text-right whitespace-nowrap">
                    {!req.assignedCollector ? (
                      <div className="relative inline-block">
                        {assigningId === req.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  assignCollectorToRequest(req.id, e.target.value);
                                  setAssigningId(null);
                                }
                              }}
                              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px]"
                              defaultValue=""
                            >
                              <option value="" disabled>
                                Select Collector
                              </option>
                              {collectorsList.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setAssigningId(null)}
                              className="text-xs text-slate-400 hover:text-slate-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssigningId(req.id)}
                            className="flex items-center gap-1 rounded-lg bg-[#183a27] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#122e1e] transition-colors"
                          >
                            <UserPlus className="h-3 w-3" />
                            <span>Dispatch</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center justify-end gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Track
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

