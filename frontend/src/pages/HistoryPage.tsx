import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Bookmark,
  GitCompare,
  ArrowUpDown
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
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HistoryIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Analysis History & Archive
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Search, filter, and audit all past network-type investigations stored in your database.
          </p>
        </div>

        <button
          onClick={() => navigate('/analyze')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Search className="w-3.5 h-3.5" />
          Analyze New IP
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by IP, ASN (AS7922), or Organization name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Categories</option>
            <option value="Residential">Residential</option>
            <option value="Hosting / Datacenter">Hosting / Datacenter</option>
            <option value="Enterprise / Campus">Enterprise / Campus</option>
            <option value="Mobile">Mobile</option>
            <option value="Unknown / Insufficient Evidence">Unknown / Insufficient</option>
          </select>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <span className="text-slate-500">Quality:</span>
          <select
            value={quality}
            onChange={(e) => {
              setQuality(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Qualities</option>
            <option value="Strong">Strong Evidence</option>
            <option value="Moderate">Moderate Evidence</option>
            <option value="Limited">Limited Evidence</option>
          </select>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <span className="text-slate-500">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
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
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Bookmarked Only</span>
          </label>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading history ledger...</div>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {item.ip_address}
                        </span>
                        {item.is_saved && (
                          <span title="Bookmarked">
                            <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          </span>
                        )}
                        {item.is_demo && (
                          <span className="text-[9px] font-bold px-1.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {item.network_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.confidence_score}%
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">({item.confidence_level})</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-medium ${
                          item.evidence_quality === 'Strong'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : item.evidence_quality === 'Moderate'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.evidence_quality}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                      {item.org_name || item.asn || 'Unspecified'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(item.created_at).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/report/${item.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.ip_address)}
                          title="Delete snapshot"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
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
          <div className="py-16 text-center">
            <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No matching analyses found
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search terms or filters, or analyze a new IP address.
            </p>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing page {page} of {totalPages} ({total} total analyses)
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
