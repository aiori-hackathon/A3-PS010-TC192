import {
  TokenResponse,
  User,
  IPValidationResult,
  AnalysisResponse,
  DashboardStats,
  BenchmarkResult,
  AuditEvent
} from '../types';

const isSameOrigin = typeof window !== 'undefined' && !window.location.hostname.includes('a3-ps-010-tc-192.vercel.app');
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (isSameOrigin ? '/api/v1' : 'https://a3-ps-010-tc-192-4fs1.vercel.app/api/v1');

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('netevidence_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('netevidence_token');
    localStorage.removeItem('netevidence_user');
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      window.location.href = '/login';
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let msg = data.detail;
    if (Array.isArray(data.detail)) {
      msg = data.detail.map((d: any) => d.msg || d.detail || JSON.stringify(d)).join('; ');
    } else if (typeof data.detail === 'object' && data.detail !== null) {
      msg = JSON.stringify(data.detail);
    }
    throw new Error(msg || `Request failed with status ${response.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (payload: { email: string; password: string; full_name: string }) =>
    request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<User>('/auth/me'),

  // Dashboard
  getDashboardStats: () => request<DashboardStats>('/dashboard/stats'),

  // Analysis
  validateIp: (ip_address: string) =>
    request<IPValidationResult>('/analysis/validate', {
      method: 'POST',
      body: JSON.stringify({ ip_address }),
    }),

  getDemoCases: () => request<any[]>('/analysis/demo-cases'),

  analyzeIp: (payload: { ip_address: string; force_demo?: boolean; demo_case_id?: string }) =>
    request<AnalysisResponse>('/analysis/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAnalysisById: (id: number) => request<AnalysisResponse>(`/analysis/${id}`),

  saveReport: (payload: { analysis_id: number; title: string; notes?: string; tags?: string }) =>
    request<{ message: string; id: number }>('/analysis/save', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  compareAnalyses: (payload: { analysis_id_a: number; analysis_id_b: number }) =>
    request<any>('/analysis/compare', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // History
  getHistory: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request<{ items: any[]; total: number; page: number; total_pages: number }>(
      `/history/?${query.toString()}`
    );
  },

  deleteAnalysis: (id: number) =>
    request<{ message: string }>(`/history/${id}`, {
      method: 'DELETE',
    }),

  // Benchmark
  runBenchmark: () => request<BenchmarkResult>('/benchmark/run'),
  getBenchmarkDataset: () => request<any>('/benchmark/dataset'),
  getTemplateCsvUrl: () => `${API_BASE}/benchmark/template-csv`,
  uploadBenchmarkCsv: async (file: File): Promise<BenchmarkResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('netevidence_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/benchmark/upload-csv`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      let msg = data.detail;
      if (Array.isArray(data.detail)) {
        msg = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
      }
      throw new Error(msg || `CSV evaluation failed with status ${response.status}`);
    }
    return data as BenchmarkResult;
  },

  // Audit
  getAuditTrail: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request<{ items: AuditEvent[]; total: number; page: number; total_pages: number }>(
      `/audit/?${query.toString()}`
    );
  },
};
