export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export async function generateAdapter(payload: any) {
  const res = await fetch(`${API_BASE}/api/adapter/generate`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error('API error');
  return res.json();
}
