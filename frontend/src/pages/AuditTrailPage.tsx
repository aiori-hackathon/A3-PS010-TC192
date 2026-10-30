import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Search,
  Lock,
  Calendar,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { AuditEvent } from '../types';

export const AuditTrailPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAuditTrail = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAuditTrail({ page, limit: 15 });
      setEvents(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditTrail();
  }, [page]);

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Auditable Activity Log & Compliance Ledger
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Traceable audit record of every analysis, authentication event, and decision parameter.
        </p>
      </div>

      {/* Audit Explainer Box */}
      <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-start gap-3">
        <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-emerald-900 dark:text-emerald-200 space-y-1">
          <p className="font-semibold">
            Auditable Analysis Activity Logs
          </p>
          <p className="text-[11px] opacity-90 leading-relaxed">
            Every network analysis, login attempt, and saved report is recorded with high-precision timestamps, user identity, and complete sensor snapshots in an append-only ledger for transparent verification.
          </p>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target IP</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Metadata & Audit Parameters</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {events.map((evt) => (
                  <tr
                    key={evt.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      #{evt.id}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                        {evt.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-900 dark:text-slate-100">
                      {evt.ip_address || '—'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {evt.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-sm text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {JSON.stringify(evt.details)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(evt.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400">
            No audit records found yet.
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages} ({total} audit events)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-slate-800 dark:text-slate-200">{page}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
