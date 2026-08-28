import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import {
  cancelOrder,
  collectOrder,
  getOrders,
} from '../../assets/order-content';
import { useAuth } from '../../context/AuthContext';

const API =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api/v1';

const peso = (amount) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);

const label = (status) =>
  status.replace(/\b\w/g, (letter) => letter.toUpperCase());

const OrdersPage = () => {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getOrders(token),

      fetch(`${API}/review/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json()),
    ])
      .then(([nextOrders, nextReviews]) => {
        setOrders(nextOrders);
        setReviews(nextReviews);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  const replace = (order) =>
    setOrders((current) =>
      current.map((item) =>
        item._id === order._id ? order : item
      )
    );

  const action = async (request) => {
    try {
      replace(await request());
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
        Your account
      </p>

      <h1 className="mt-2 text-3xl font-bold text-zinc-900">
        My orders
      </h1>

      {error ? (
        <p
          role="alert"
          className="mt-5 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article
            key={order._id}
            className="rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">
                  Order #{order._id.slice(-6).toUpperCase()}
                </h2>

                <p className="text-sm text-zinc-600">
                  {new Date(order.orderedAt).toLocaleString()}
                </p>
              </div>

              <span className="rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold uppercase text-yellow-400">
                {label(order.orderStatus)}
              </span>
            </div>

            <ul className="mt-4 space-y-2 border-t border-zinc-300 pt-4">
              {order.orderItems.map((item) => (
                <li
                  key={String(
                    item.productId?._id || item.productId
                  )}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.productName} × {item.quantity}
                  </span>

                  <span>
                    {peso(
                      item.productPrice * item.quantity
                    )}
                  </span>
                </li>
              ))}
            </ul>

            {order.orderStatus === 'completed' ? (
              <ReviewItems
                order={order}
                token={token}
                reviews={reviews}
                setReviews={setReviews}
                setError={setError}
              />
            ) : null}

            <div className="mt-4 flex items-center justify-between border-t border-zinc-300 pt-4">
              <strong>
                Total: {peso(order.totalAmount)}
              </strong>

              {order.orderStatus === 'pending' ? (
                <Button
                  onClick={() =>
                    action(() =>
                      cancelOrder(token, order._id)
                    )
                  }
                >
                  Cancel order
                </Button>
              ) : null}

              {order.orderStatus === 'ready for pickup' ? (
                <Button
                  variant="primary"
                  onClick={() =>
                    action(() =>
                      collectOrder(token, order._id)
                    )
                  }
                >
                  Order collected
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const ReviewItems = ({
  order,
  token,
  reviews,
  setReviews,
  setError,
}) => (
  <div className="mt-4 space-y-2 border-t border-zinc-300 pt-4">
    <p className="text-sm font-semibold">
      Review completed-order items
    </p>

    {order.orderItems.map((item) => (
      <ReviewForm
        key={String(
          item.productId?._id || item.productId
        )}
        item={item}
        orderId={order._id}
        token={token}
        existing={reviews.some(
          (review) =>
            String(review.orderId) === order._id &&
            String(review.productId) ===
              String(
                item.productId?._id || item.productId
              )
        )}
        setReviews={setReviews}
        setError={setError}
      />
    ))}
  </div>
);

const ReviewForm = ({
  item,
  orderId,
  token,
  existing,
  setReviews,
  setError,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  if (existing) {
    return (
      <p className="text-sm text-zinc-600">
        {item.productName}: review submitted.
      </p>
    );
  }

  const submit = async () => {
    setSaving(true);

    try {
      const response = await fetch(`${API}/review`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          orderId,
          productId:
            item.productId?._id || item.productId,
          reviewRating: Number(rating),
          reviewComment: comment,
        }),
      });

      const review = await response.json();

      if (!response.ok) {
        throw new Error(review.message);
      }

      setReviews((current) => [
        ...current,
        review,
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-3 text-sm">
      <p className="font-medium">
        {item.productName}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <select
          value={rating}
          onChange={(e) =>
            setRating(e.target.value)
          }
          className="rounded border px-2 py-1"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option
              key={value}
              value={value}
            >
              {value} stars
            </option>
          ))}
        </select>

        <input
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          placeholder="Write a review"
          className="min-w-48 flex-1 rounded border px-2 py-1"
        />

        <Button
          disabled={
            saving || !comment.trim()
          }
          onClick={submit}
        >
          {saving
            ? 'Submitting...'
            : 'Submit review'}
        </Button>
      </div>
    </div>
  );
};

export default OrdersPage;