const BASE = '/api';

function token() {
  return localStorage.getItem('nb_token') || sessionStorage.getItem('nb_token') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
  };
}

// ── Auth ────────────────────────────────────
export async function login(email, password, rememberMe) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rememberMe }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function register(email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function getMe() {
  const res = await fetch(`${BASE}/auth/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function forgotPassword(email) {
  const res = await fetch(`${BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

// ── Notes ───────────────────────────────────
export async function fetchNotes(q = '') {
  const url = q ? `${BASE}/notes?q=${encodeURIComponent(q)}` : `${BASE}/notes`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export async function fetchNote(id) {
  const res = await fetch(`${BASE}/notes/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch note');
  return res.json();
}

export async function createNote(data = {}) {
  const res = await fetch(`${BASE}/notes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title: '', content: '', tags: [], ...data }),
  });
  if (!res.ok) throw new Error('Failed to create note');
  return res.json();
}

export async function updateNote(id, data) {
  const res = await fetch(`${BASE}/notes/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update note');
  return res.json();
}

export async function deleteNote(id) {
  const res = await fetch(`${BASE}/notes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete note');
  return res.json();
}
