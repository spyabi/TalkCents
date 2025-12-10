import { getToken, BASE_URL } from './auth';

export async function fetchCategoryExpenses(from: Date, to: Date) {
  const storedToken = await getToken();
  const query = `?start_date=${from.toISOString().split('T')[0]}&end_date=${to.toISOString().split('T')[0]}`;

  const res = await fetch(`${BASE_URL}/api/insights/category-totals${query}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${storedToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  console.log("permissions INSIGHTS", data);
  return data;
}

export async function fetchDailyExpenses(from: Date, to: Date) {
  const storedToken = await getToken();
  const query = `?start_date=${from.toISOString().split('T')[0]}&end_date=${to.toISOString().split('T')[0]}`;

  const res = await fetch(`${BASE_URL}/api/insights/daily-totals${query}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${storedToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('Failed to fetch daily expenses');
  const data = await res.json();
  console.log("permissions INSIGHTS", data);
  return data;
}
