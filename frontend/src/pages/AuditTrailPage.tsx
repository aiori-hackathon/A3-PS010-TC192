import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Lock,
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
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto pb-12 font-sans">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#36D67E]/15 border border-[#36D67E]/30 flex items-center justify-center text-[#36D67E]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Auditable Activity Log & Compliance Ledger
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#A0A0AA] font-mono">
          Traceable audit record of every analysis, authentication event, and decision parameter.
        </p>
      </div>

      {/* Audit Explainer Box */}
      <div className="p-4 rounded-xl backdrop-blur-xl bg-[#36D67E]/10 border border-[#36D67E]/25 text-xs flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#36D67E] shrink-0 mt-0.5" />
        <div className="text-[#36D67E] space-y-1">
          <p className="font-bold font-mono">
            Immutable SHA-256 Analysis Activity Ledger
          </p>
          <p className="text-[11px] text-[#A0A0AA] leading-relaxed font-sans">
            Every network analysis, login attempt, and saved report is recorded with high-precision timestamps, analyst identity, and complete sensor snapshots in an append-only ledger for transparent forensic auditing.
          </p>
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-shard overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#A0A0AA] font-mono">Loading audit records...</div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead className="bg-[#202027]/70 border-b border-white/[0.08] text-[10px] uppercase font-bold text-[#A0A0AA] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target IP</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Metadata & Audit Parameters</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {events.map((evt) => (
                  <tr
                    key={evt.id}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3 px-4 text-[11px] text-[#777782]">
                      #{evt.id}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-white text-[11px]">
                        {evt.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-bold text-[#8C7BFF]">
                      {evt.ip_address || '—'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#36D67E]/15 text-[#36D67E] border border-[#36D67E]/30">
                        {evt.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-sm text-[#A0A0AA] text-[11px] truncate">
                      {JSON.stringify(evt.details)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-[#777782] text-[11px]">
                      {new Date(evt.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-[#A0A0AA] font-mono">
            No audit records found yet.
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-[#202027]/70 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#A0A0AA]">
            <span>
              Page {page} of {totalPages} ({total} audit events)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-white/[0.10] bg-[#202027] text-white disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-white">{page}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-white/[0.10] bg-[#202027] text-white disabled:opacity-40"
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
