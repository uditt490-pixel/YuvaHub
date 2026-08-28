import { auth } from './firebase.js';

export async function apiFetch(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  let token = '';
  if (user) {
    token = await user.getIdToken();
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch(e) {}
    throw new Error((errorData as any).error || 'API Request failed');
  }

  return response.json();
}
