import { getToken } from './auth';

const BASE_URL = 'https://talkcents-backend-7r52622dga-as.a.run.app';

export async function getBudget() {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/api/user/budget`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch budget');
  const data = await res.json();
  console.log("permissions BUDGET", data);
  return data;
}

export async function updateBudget(monthlyBudget: number) {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/api/user/budget`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ monthly_budget: monthlyBudget }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Update failed:', text); // see backend error
    throw new Error('Failed to update budget');
  }

  const data = await res.json();
  console.log("Updated budget:", data);
  return data;
}