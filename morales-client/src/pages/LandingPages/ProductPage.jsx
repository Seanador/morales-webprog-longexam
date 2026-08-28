import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import { getProduct } from '../../assets/product-content.js';
import { addToCart } from '../../assets/cart-content.js';
import { useAuth } from '../../context/AuthContext.jsx';

function ProductPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { token, user, isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    getProduct(name).then(setProduct).catch((requestError) => setError(requestError.message));
  }, [name]);
  useEffect(() => { setQuantity(1); }, [product?._id]);
  useEffect(() => { if (product?._id) fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/review?productId=${product._id}`).then((response) => response.json()).then(setReviews).catch(() => setReviews([])); }, [product?._id]);

  const handleAddToCart = async () => {
    if (!user) return navigate('/auth/signin');
    setAdding(true); setCartMessage('');
    try {
      await addToCart(token, product._id, quantity);
      setCartMessage('Added to your cart.');
    } catch (requestError) {
      setCartMessage(requestError.message);
    } finally {
      setAdding(false);
    }
  };

  if (error || !product) {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-zinc-900">
              {error ? 'Product not found' : 'Loading product...'}
            </h1>
            <Button to="/products" className="mt-6">Back to Products</Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4">
            <Button to="/products">Back to Products</Button>
          </div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            {product.category}
          </p>
          <h1 className="text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
            {product.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <span className="font-bold text-zinc-900">{product.price}</span>
            <span>{product.stock}</span>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 overflow-hidden rounded-[1.25rem] border-2 border-zinc-900 bg-zinc-200">
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full object-contain p-4"
            />
          </div>

          <div className="prose prose-sm max-w-none space-y-4 text-zinc-700">
            {product.content.map((paragraph, index) => (
              <p key={index} className="text-base leading-7 text-zinc-700 whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 border-t-2 border-zinc-900 pt-6">
            {!isAdmin ? <div className="mb-4 flex flex-wrap items-end gap-3"><label className="text-sm font-medium text-zinc-900">Quantity<input aria-label="Quantity to add" type="number" min="1" max={product.stockQuantity} value={quantity} disabled={adding || product.stockQuantity < 1} onChange={(event) => setQuantity(Math.max(1, Math.min(Number(event.target.value) || 1, product.stockQuantity)))} className="ml-2 w-16 rounded-lg border-2 border-zinc-900 bg-white px-2 py-1" /></label><span className="pb-1 text-sm text-zinc-600">{product.stockQuantity} available</span><Button onClick={handleAddToCart} disabled={adding || product.stockQuantity < 1} variant="primary">{adding ? 'Adding...' : product.stockQuantity < 1 ? 'Out of Stock' : 'Add to Cart'}</Button></div> : null}
            <Button to="/products">Back to Products</Button>
            {cartMessage ? <p role="status" className="mt-4 text-sm font-medium text-zinc-700">{cartMessage}</p> : null}
          </div>
          <div className="mt-8 border-t-2 border-zinc-900 pt-6"><h2 className="text-xl font-bold text-zinc-900">Customer reviews</h2>{reviews.length ? <div className="mt-4 space-y-3">{reviews.map((review) => <article key={review._id} className="rounded-lg border border-zinc-300 bg-white p-4"><p className="font-semibold">{review.reviewRating}/5 stars <span className="ml-2 text-sm font-normal text-zinc-600">{review.userId ? `${review.userId.firstName} ${review.userId.lastName}` : 'Customer'}</span></p><p className="mt-2 text-sm text-zinc-700">{review.reviewComment}</p></article>)}</div> : <p className="mt-3 text-sm text-zinc-600">No reviews yet.</p>}</div>
        </div>
      </section>
    </div>
  );
}

export default ProductPage;
