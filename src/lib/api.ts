import type { Profile, Department, ProblemCategory, Report, ActionTaken, Notification, UserRole } from '@/types';
import type { AnalysisResult } from '@/lib/ai-engine';

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('civiceye_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('civiceye_token', token);
  } else {
    localStorage.removeItem('civiceye_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  auth: {
    async register(email: string, password: string, full_name: string, role: UserRole): Promise<{ user: Profile; token: string }> {
      const data = await request<{ user: Profile; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name, role }),
      });
      setToken(data.token);
      return data;
    },

    async login(email: string, password: string): Promise<{ user: Profile; token: string }> {
      const data = await request<{ user: Profile; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      return data;
    },

    async me(): Promise<Profile | null> {
      const token = getToken();
      if (!token) return null;
      try {
        const data = await request<{ user: Profile }>('/auth/me');
        return data.user;
      } catch {
        setToken(null);
        return null;
      }
    },

    async updateProfile(updates: { full_name?: string; phone?: string }): Promise<Profile> {
      const data = await request<{ user: Profile }>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return data.user;
    },

    logout() {
      setToken(null);
    },
  },

  categories: {
    async list(): Promise<ProblemCategory[]> {
      return request<ProblemCategory[]>('/categories');
    },
  },

  departments: {
    async list(): Promise<Department[]> {
      return request<Department[]>('/departments');
    },
    async create(dept: Partial<Department>): Promise<Department> {
      return request<Department>('/departments', {
        method: 'POST',
        body: JSON.stringify(dept),
      });
    },
  },

  reports: {
    async list(filters: { user_id?: string; status?: string; priority?: string; department_id?: string; limit?: number } = {}): Promise<Report[]> {
      const params = new URLSearchParams();
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.department_id) params.append('department_id', filters.department_id);
      if (filters.limit) params.append('limit', String(filters.limit));

      const qs = params.toString();
      return request<Report[]>(`/reports${qs ? `?${qs}` : ''}`);
    },

    async get(id: string): Promise<Report & { actions_taken: ActionTaken[] }> {
      return request<Report & { actions_taken: ActionTaken[] }>(`/reports/${id}`);
    },

    async create(reportData: {
      category_id?: string | null;
      title: string;
      description: string;
      latitude: number;
      longitude: number;
      location_address?: string | null;
      image_urls?: string[];
      ai_analysis?: AnalysisResult | null;
      priority?: number;
      department_id?: string | null;
    }): Promise<Report> {
      return request<Report>('/reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      });
    },

    async analyze(imageBase64: string, description: string, mimeType?: string): Promise<AnalysisResult> {
      return request<AnalysisResult>('/reports/analyze', {
        method: 'POST',
        body: JSON.stringify({ imageBase64, description, mimeType: mimeType || 'image/jpeg' }),
      });
    },

    async update(id: string, updates: Partial<Report>): Promise<Report> {
      return request<Report>(`/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
  },

  actions: {
    async create(data: {
      report_id: string;
      action_type: string;
      description?: string;
      after_image_urls?: string[];
      cost?: number;
      duration_minutes?: number;
      notes?: string;
    }): Promise<ActionTaken> {
      return request<ActionTaken>('/actions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  notifications: {
    async list(): Promise<Notification[]> {
      return request<Notification[]>('/notifications');
    },
    async markAllRead(): Promise<{ success: boolean }> {
      return request<{ success: boolean }>('/notifications/read-all', {
        method: 'PATCH',
      });
    },
  },

  admin: {
    async getUsers(): Promise<Profile[]> {
      return request<Profile[]>('/admin/users');
    },
    async updateUser(id: string, updates: Partial<Profile>): Promise<Profile> {
      return request<Profile>(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    async getStats(): Promise<{ total_reports: number; resolved_reports: number; total_users: number; total_departments: number }> {
      return request<{ total_reports: number; resolved_reports: number; total_users: number; total_departments: number }>('/admin/stats');
    },
  },
};
