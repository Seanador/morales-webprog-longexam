const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const request = async (method, token, body) => {
  const response = await fetch(`${API_URL}/cart`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(result?.message || 'Unable to update your cart.');
  return result;
};

export const getCart = (token) => request('GET', token);
export const saveCart = (token, cartItems) => request('PUT', token, { cartItems });
export const checkout = async (token, productIds) => {
  const response = await fetch(`${API_URL}/order`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ productIds }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.message || 'Unable to confirm your order.');
  return result;
};

export const addToCart = async (token, productId, quantity = 1) => {
  const cart = await getCart(token);
  const itemExists = cart.cartItems.find((item) => String(item.productId?._id || item.productId) === String(productId));
  const cartItems = itemExists
    ? cart.cartItems.map((item) => ({ productId: item.productId?._id || item.productId, quantity: item.quantity + quantity }))
    : [...cart.cartItems.map((item) => ({ productId: item.productId?._id || item.productId, quantity: item.quantity })), { productId, quantity }];
  return saveCart(token, cartItems);
};
