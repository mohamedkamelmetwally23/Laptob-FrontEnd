const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/laptops`;

async function request(path = '', options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'تعذر الاتصال بالخادم');
  }
  return response.status === 204 ? null : response.json();
}

export const laptopApi = {
  list: () => request(),
  create: laptop => request('', { method: 'POST', body: JSON.stringify(laptop) }),
  update: (id, laptop) => request(`/${id}`, { method: 'PUT', body: JSON.stringify(laptop) }),
  remove: id => request(`/${id}`, { method: 'DELETE' }),
  import: laptops => request('/import', { method: 'POST', body: JSON.stringify({ laptops }) }),
};
