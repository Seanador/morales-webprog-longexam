const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const request = async (path, token, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || 'Unable to update your orders.');
  return result;
};

export const getOrders = (token) => request('/order', token);
export const cancelOrder = (token, id) => request(`/order/${id}/cancel`, token, { method: 'PATCH' });
export const collectOrder = (token, id) => request(`/order/${id}/collect`, token, { method: 'PATCH' });
