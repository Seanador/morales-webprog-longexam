import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/Button';
import { checkout, getCart, saveCart } from '../../assets/cart-content';
import { useAuth } from '../../context/AuthContext';
import { resolveProductImage } from '../../assets/product-content';

const peso = (amount) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const CartPage = () => {
  const { token } = useAuth();
  const [cart, setCart] = useState({ cartItems: [] });
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { getCart(token).then(setCart).catch((requestError) => setError(requestError.message)); }, [token]);
  const total = useMemo(() => cart.cartItems.filter((item) => selectedProductIds.includes(String(item.productId._id))).reduce((sum, item) => sum + (item.productId?.productPrice || 0) * item.quantity, 0), [cart, selectedProductIds]);
  const updateCart = async (nextItems) => {
    setSaving(true); setError('');
    try { setCart(await saveCart(token, nextItems)); } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };
  const updateQuantity = (productId, quantity) => {
    const item = cart.cartItems.find((cartItem) => String(cartItem.productId._id) === String(productId));
    const safeQuantity = Math.max(1, Math.min(quantity || 1, item.productId.stockQuantity));
    updateCart(cart.cartItems.map((cartItem) => String(cartItem.productId._id) === String(productId) ? { productId, quantity: safeQuantity } : { productId: cartItem.productId._id, quantity: cartItem.quantity }));
  };
  const removeItem = (productId) => {
    setSelectedProductIds((selected) => selected.filter((id) => id !== String(productId)));
    updateCart(cart.cartItems.filter((item) => String(item.productId._id) !== String(productId)).map((item) => ({ productId: item.productId._id, quantity: item.quantity })));
  };
  const toggleSelection = (productId) => setSelectedProductIds((selected) => selected.includes(String(productId)) ? selected.filter((id) => id !== String(productId)) : [...selected, String(productId)]);
  const confirmOrder = async () => {
    if (!selectedProductIds.length) { setError('Select at least one item to check out.'); return; }
    setCheckingOut(true); setError(''); setSuccess('');
    try {
      await checkout(token, selectedProductIds);
      setCart((currentCart) => ({ ...currentCart, cartItems: currentCart.cartItems.filter((item) => !selectedProductIds.includes(String(item.productId._id))) }));
      setSelectedProductIds([]);
      setSuccess('Your order was placed and is now pending confirmation.');
    } catch (requestError) { setError(requestError.message); }
    finally { setCheckingOut(false); }
  };

  return <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">Your account</p><h1 className="mt-2 text-3xl font-bold text-zinc-900">Shopping cart</h1>
    {error ? <p role="alert" className="mt-5 text-sm text-red-700">{error}</p> : null}
    {success ? <p role="status" className="mt-5 text-sm text-green-700">{success}</p> : null}
    {!cart.cartItems.length ? <div className="mt-6 rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-6"><p>Your cart is empty.</p><Button to="/products" variant="primary" className="mt-5">Shop products</Button></div> : <div className="mt-6 space-y-4">
      {cart.cartItems.map((item) => <article key={item.productId._id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-5"><div className="flex items-center gap-4"><input aria-label={`Select ${item.productId.productName} for checkout`} type="checkbox" checked={selectedProductIds.includes(String(item.productId._id))} disabled={saving || checkingOut} onChange={() => toggleSelection(item.productId._id)} className="h-5 w-5 accent-zinc-900" /><div className="h-20 w-20 overflow-hidden rounded-xl border-2 border-zinc-900 bg-zinc-200"><img src={resolveProductImage(item.productId.productImage)} alt={item.productId.productName} className="h-full w-full object-cover" /></div><div><h2 className="font-semibold text-zinc-900">{item.productId.productName}</h2><p className="mt-1 text-sm text-zinc-600">{peso(item.productId.productPrice)} each · {item.productId.stockQuantity} available</p></div></div><div className="flex items-center gap-3"><label className="text-sm font-medium">Qty <input aria-label={`Quantity for ${item.productId.productName}`} type="number" min="1" max={item.productId.stockQuantity} value={item.quantity} disabled={saving || checkingOut} onChange={(event) => updateQuantity(item.productId._id, Number(event.target.value))} className="ml-2 w-16 rounded-lg border-2 border-zinc-900 bg-white px-2 py-1" /></label><strong>{peso(item.productId.productPrice * item.quantity)}</strong><Button onClick={() => removeItem(item.productId._id)} disabled={saving || checkingOut}>Remove</Button></div></article>)}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-zinc-900 pt-5"><strong className="text-xl text-zinc-900">Selected total: {peso(total)}</strong><div className="flex gap-3"><Button to="/products">Continue shopping</Button><Button onClick={confirmOrder} disabled={saving || checkingOut || !selectedProductIds.length} variant="primary">{checkingOut ? 'Confirming...' : 'Confirm order'}</Button></div></div>
    </div>}
  </section>;
};

export default CartPage;
