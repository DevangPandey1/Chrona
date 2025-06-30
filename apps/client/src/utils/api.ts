import { AuthResponse, ApiError } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error((data as ApiError).message || 'Something went wrong');
  }
  return data as T;
}

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  console.log('Making registration request to:', `${API_URL}/register`);
  const requestBody = { name: username, email, password };
  console.log('Request body:', { ...requestBody, password: '***' });
  
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  return handleResponse<AuthResponse>(response);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  console.log('Making login request to:', `${API_URL}/login`);
  console.log('Request body:', { email, password: '***' });
  
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  return handleResponse<AuthResponse>(response);
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  return handleResponse(response);
}

// Notes API
export const notesApi = {
  getAll: (tag?: string) => {
    const url = tag ? `/notes?tag=${encodeURIComponent(tag)}` : '/notes';
    return fetchWithAuth(url);
  },
  getTags: () => fetchWithAuth('/notes/tags'),
  create: (data: { title: string; content: string; tags?: string }) =>
    fetchWithAuth('/notes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { title: string; content: string; tags?: string }) =>
    fetchWithAuth(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchWithAuth(`/notes/${id}`, { method: 'DELETE' }),
};

// Journal API
export const journalApi = {
  getAll: () => fetchWithAuth('/journal'),
  create: (data: { entry: string; date: string }) =>
    fetchWithAuth('/journal', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { entry: string }) =>
    fetchWithAuth(`/journal/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchWithAuth(`/journal/${id}`, { method: 'DELETE' }),
};

// Tasks API
export const tasksApi = {
  getAll: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
    }
    const url = params.toString() ? `/tasks?${params.toString()}` : '/tasks';
    return fetchWithAuth(url);
  },
  getById: (id: string) => fetchWithAuth(`/tasks/${id}`),
  getStats: () => fetchWithAuth('/tasks/stats'),
  getByCategory: () => fetchWithAuth('/tasks/by-category'),
  create: (data: any) =>
    fetchWithAuth('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchWithAuth(`/tasks/${id}`, { method: 'DELETE' }),
  bulkUpdate: (taskIds: string[], updates: any) =>
    fetchWithAuth('/tasks/bulk', { 
      method: 'PATCH', 
      body: JSON.stringify({ taskIds, updates }) 
    }),
};

// Events API
export const eventsApi = {
  getAll: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
    }
    const url = params.toString() ? `/events?${params.toString()}` : '/events';
    return fetchWithAuth(url);
  },
  getById: (id: string) => fetchWithAuth(`/events/${id}`),
  getUpcoming: (limit?: number) => {
    const url = limit ? `/events/upcoming?limit=${limit}` : '/events/upcoming';
    return fetchWithAuth(url);
  },
  getToday: () => fetchWithAuth('/events/today'),
  getStats: (period?: string) => {
    const url = period ? `/events/stats?period=${period}` : '/events/stats';
    return fetchWithAuth(url);
  },
  search: (query: string, filters?: any) => {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
    }
    return fetchWithAuth(`/events/search?${params.toString()}`);
  },
  create: (data: any) =>
    fetchWithAuth('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchWithAuth(`/events/${id}`, { method: 'DELETE' }),
  bulkDelete: (eventIds: string[]) =>
    fetchWithAuth('/events/bulk/delete', { 
      method: 'DELETE', 
      body: JSON.stringify({ eventIds }) 
    }),
}; 