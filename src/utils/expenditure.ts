import { getToken } from '../utils/auth'; // you already have this
const BASE_URL = 'http://18.234.224.108:8000/api';

export type Expenditure = {
  id: string;
  name: string;
  category: string;
  amount: number;
  status: 'PENDING' | 'APPROVED';
  // ...add other fields if your backend returns them
};

async function authFetch(input: string, init: RequestInit = {}) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };
  const res = await fetch(`${BASE_URL}${input}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res;
}

// GET /expenditure
export async function getExpenditures(): Promise<Expenditure[]> {
  const res = await authFetch('/expenditure');
  return res.json();
}

// POST /expenditure
export async function createExpenditure(body: {
  name: string; category: string; amount: number;
}): Promise<Expenditure> {
  const res = await authFetch('/expenditure', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.json();
}

// GET /expenditure/approved
export async function getApproved(): Promise<Expenditure[]> {
  const res = await authFetch('/expenditure/approved');
  return res.json();
}

// GET /expenditure/pending
export async function getPending(): Promise<Expenditure[]> {
  const res = await authFetch('/expenditure/pending');
  return res.json();
}

// PATCH /expenditure/{id}
export async function updateExpenditure(
  id: string,
  body: Partial<Pick<Expenditure, 'name' | 'category' | 'amount' | 'status'>>
): Promise<Expenditure> {
  const res = await authFetch(`/expenditure/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return res.json();
}

// DELETE /expenditure/{id}
export async function deleteExpenditure(id: string): Promise<void> {
  await authFetch(`/expenditure/${id}`, { method: 'DELETE' });
}

// PATCH /expenditure/approve/{id}
export async function approveOne(id: string): Promise<Expenditure> {
  const res = await authFetch(`/expenditure/approve/${id}`, { method: 'PATCH' });
  return res.json();
}

// POST /expenditure/approve
export async function approveAll(): Promise<{ count: number }> {
  const res = await authFetch('/expenditure/approve', { method: 'POST' });
  return res.json();
}
