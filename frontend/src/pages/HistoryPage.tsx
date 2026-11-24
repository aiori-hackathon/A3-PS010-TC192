import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Bookmark,
} from 'lucide-react';
import { api } from '../services/api';

export const HistoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('All');
  const [quality, setQuality] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isSavedOnly, setIsSavedOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.getHistory({
        page,
        limit: 10,
        search,
        category,
        evidence_quality: quality,
        sort_by: sortBy,
        is_saved_only: isSavedOnly,
      });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, category, quality, sortBy, isSavedOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDelete = async (id: number, ip: string) => {
    if (window.confirm(`Are you sure you want to delete the analysis record for ${ip}? This action cannot be undone.`)) {
      try {
        await api.deleteAnalysis(id);
        fetchHistory();
      } catch (err: any) {
        alert(err.message || 'Failed to delete record');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto pb-12 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#8C7BFF]/15 border border-[#8C7BFF]/30 flex items-center justify-center text-[#8C7BFF]">
              <HistoryIcon className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Analysis History & Archive
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#A0A0AA] font-mono">
            Search, filter, and audit all past network-type investigations stored in your database.
          </p>
        </div>

        <button
          onClick={() => navigate('/analyze')}
          className="px-4 py-2 rounded-xl text-xs font-semibold font-mono bg-[#8C7BFF] hover:bg-[#7b68ff] text-white shadow-[0_4px_16px_rgba(140,123,255,0.35)] flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          Analyze New IP
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-shard p-5 space-y-3.5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C7BFF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by IP, ASN (AS7922), or Organization name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-xs font-mono rounded-xl border border-white/[0.10] bg-[#202027] text-white focus:outline-none focus:ring-2 focus:ring-[#8C7BFF]"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium font-mono rounded-xl bg-[#8C7BFF] hover:bg-[#7b68ff] text-white shadow-sm transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/[0.08] text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#A0A0AA]">
            <Filter className="w-3.5 h-3.5 text-[#8C7BFF]" />
            <span>Category:</span>
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 rounded-lg border border-white/[0.10] bg-[#202027] text-[#E5E5EA]"
          >
            <option value="All">All Categories</option>
            <option value="Residential">Residential</option>
            <option value="Hosting / Datacenter">Hosting / Datacenter</option>
            <option value="Enterprise / Campus">Enterprise / Campus</option>
            <option value="Mobile">Mobile</option>
            <option value="Unknown / Insufficient Evidence">Unknown / Insufficient</option>
          </select>

          <span className="text-[#777782]">|</span>

          <span className="text-[#A0A0AA]">Quality:</span>
          <select
            value={quality}
            onChange={(e) => {
              setQuality(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 rounded-lg border border-white/[0.10] bg-[#202027] text-[#E5E5EA]"
          >
            <option value="All">All Qualities</option>
            <option value="Strong">Strong Evidence</option>
            <option value="Moderate">Moderate Evidence</option>
            <option value="Limited">Limited Evidence</option>
          </select>

          <span className="text-[#777782]">|</span>

          <span className="text-[#A0A0AA]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-white/[0.10] bg-[#202027] text-[#E5E5EA]"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="confidence_high">Highest Confidence</option>
            <option value="confidence_low">Lowest Confidence</option>
          </select>

          <label className="flex items-center gap-1.5 ml-auto cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSavedOnly}
              onChange={(e) => setIsSavedOnly(e.target.checked)}
              className="rounded border-white/20 bg-[#202027] text-[#8C7BFF] focus:ring-[#8C7BFF]"
            />
            <span className="text-[#A0A0AA] font-medium">Bookmarked Only</span>
          </label>
        </div>
      </div>

      {/* Table / List */}
      <div className="glass-shard overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#A0A0AA] font-mono">Loading history ledger...</div>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#202027]/70 border-b border-white/[0.08] text-[10px] uppercase font-bold text-[#A0A0AA] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Target IP</th>
                  <th className="py-3 px-4">Network Category</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Evidence Quality</th>
                  <th className="py-3 px-4">Operator / ASN</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {item.ip_address}
                        </span>
                        {item.is_saved && (
                          <span title="Bookmarked">
                            <Bookmark className="w-3.5 h-3.5 text-[#F0B45C] fill-[#F0B45C]" />
                          </span>
                        )}
                        {item.is_demo && (
                          <span className="text-[9px] font-bold px-1.5 rounded bg-[#F0B45C]/15 text-[#F0B45C] border border-[#F0B45C]/30">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-lg font-semibold text-[11px] bg-[#8C7BFF]/15 text-[#B9ABFF] border border-[#8C7BFF]/30">
                        {item.network_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-white">
                        {item.confidence_score}%
                      </span>
                      <span className="text-[10px] text-[#777782] ml-1">({item.confidence_level})</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-medium ${
                          item.evidence_quality === 'Strong'
                            ? 'text-[#36D67E]'
                            : item.evidence_quality === 'Moderate'
                            ? 'text-[#F0B45C]'
                            : 'text-[#A0A0AA]'
                        }`}
                      >
                        {item.evidence_quality}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-[#A0A0AA] font-sans">
                      {item.org_name || item.asn || 'Unspecified'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[#777782] text-[11px]">
                      {new Date(item.created_at).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/report/${item.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-[#8C7BFF]/15 hover:bg-[#8C7BFF]/30 text-[#B9ABFF] font-semibold text-[11px] flex items-center gap-1 transition-colors border border-[#8C7BFF]/30"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.ip_address)}
                          title="Delete snapshot"
                          className="p-1 rounded-lg text-[#777782] hover:text-[#FF626E] hover:bg-white/[0.05] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center font-mono">
            <Search className="w-8 h-8 text-[#777782] mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">
              No matching analyses found
            </h4>
            <p className="text-xs text-[#A0A0AA] mt-1">
              Try adjusting your search terms or filters, or analyze a new IP address.
            </p>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-[#202027]/70 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#A0A0AA]">
            <span>
              Showing page {page} of {totalPages} ({total} total analyses)
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
