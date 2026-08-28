import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api/v1';

const api = async (path, token, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body
        ? { 'Content-Type': 'application/json' }
        : {}),
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        'The requested action could not be completed.'
    );
  }

  return result;
};

const statuses = [
  'pending',
  'confirmed',
  'ready for pickup',
  'cancelled',
  'completed',
];

const blankProduct = {
  productName: '',
  productSlug: '',
  productDescription: '',
  productPrice: '',
  categoryId: '',
  supplierId: '',
  productImage: '',
  stockQuantity: 0,
  stockStatus: 'In stock',
  isActive: true,
};

const pageSize = 10;

const getPageRows = (rows, page) =>
  rows.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

const useRows = (
  items,
  query,
  sort,
  text,
  value
) =>
  useMemo(
    () =>
      [...items]
        .filter((item) =>
          text(item)
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .sort((a, b) => {
          const left = value(a, sort.field);
          const right = value(b, sort.field);

          const result =
            typeof left === 'number'
              ? left - right
              : String(left || '').localeCompare(
                  String(right || '')
                );

          return sort.direction === 'asc'
            ? result
            : -result;
        }),
    [items, query, sort, text, value]
  );

const Controls = ({
  query,
  setQuery,
  sort,
  setSort,
  choices,
}) => (
  <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search records"
      className="min-w-48 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-900"
    />

    <label className="text-xs font-medium text-zinc-600">
      Sort by

      <select
        value={sort.field}
        onChange={(e) =>
          setSort({
            ...sort,
            field: e.target.value,
          })
        }
        className="ml-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
      >
        {choices.map(([value, label]) => (
          <option
            key={value}
            value={value}
          >
            {label}
          </option>
        ))}
      </select>
    </label>

    <button
      type="button"
      onClick={() =>
        setSort({
          ...sort,
          direction:
            sort.direction === 'asc'
              ? 'desc'
              : 'asc',
        })
      }
      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
    >
      {sort.direction === 'asc'
        ? 'Ascending'
        : 'Descending'}
    </button>
  </div>
);

const DashboardPage = () => {
  const {
    token,
    isAdmin,
    isSupplier,
  } = useAuth();

  const [tab, setTab] = useState('products');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setError('');

      const [
        productData,
        categoryData,
        orderData,
        reviewData,
        userData,
        supplierData,
      ] = await Promise.all([
        api(
          '/products/admin?limit=50',
          token
        ),

        api('/category', token),

        api('/order', token),

        api('/review/manage', token),

        isAdmin
          ? api('/user', token)
          : Promise.resolve([]),

        isAdmin
          ? api('/suppliers', token)
          : Promise.resolve([]),
      ]);

      setProducts(productData.data);
      setCategories(categoryData);
      setOrders(orderData);
      setReviews(reviewData);
      setUsers(userData);
      setSuppliers(supplierData);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin]);

  const mutate = async (
    path,
    options,
    confirmation
  ) => {
    if (
      confirmation &&
      !window.confirm(confirmation)
    ) {
      return false;
    }

    setSaving(true);

    try {
      await api(path, token, options);

      setDraft(null);

      await load();

      return true;
    } catch (requestError) {
      setError(requestError.message);

      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveProduct = () => {
    const body = {
      ...draft,
      productPrice: Number(
        draft.productPrice
      ),
      stockQuantity: Number(
        draft.stockQuantity
      ),
    };

    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.__v;

    mutate(
      draft._id
        ? `/products/${draft._id}`
        : '/products',
      {
        method: draft._id ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      },
      `Are you sure you want to ${
        draft._id
          ? 'save changes to'
          : 'create'
      } this product?`
    );
  };

  const tabs = isSupplier
    ? [
        'products',
        'categories',
        'orders',
        'reviews',
      ]
    : [
        'products',
        'categories',
        'orders',
        'reviews',
        'users',
      ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
        {isSupplier
          ? 'Supplier'
          : 'Administrator'}
      </p>

      <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
        Store dashboard
      </h1>

      {isSupplier ? (
        <p className="mt-2 text-sm text-zinc-600">
          Your dashboard contains only your
          supplier's products, related orders,
          and their reviews.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2 border-b-2 border-zinc-900 pb-4">
        {tabs.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              setTab(name);
              setDraft(null);
            }}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              tab === name
                ? 'bg-blue-900 text-yellow-400 shadow-sm'
                : 'bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-5 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      {tab === 'products' ? (
        <Products
          products={products}
          categories={categories}
          suppliers={suppliers}
          isSupplier={isSupplier}
          draft={draft}
          setDraft={setDraft}
          save={saveProduct}
          saving={saving}
          toggle={(item) =>
            mutate(
              `/products/${item._id}`,
              {
                method: 'PUT',
                body: JSON.stringify({
                  isActive:
                    item.isActive === false,
                }),
              },
              `Are you sure you want to ${
                item.isActive === false
                  ? 'enable'
                  : 'disable'
              } ${item.productName}?`
            )
          }
        />
      ) : null}

      {tab === 'categories' ? (
        <Categories
          categories={categories}
          saving={saving}
          mutate={mutate}
        />
      ) : null}

      {tab === 'orders' ? (
        <Orders
          orders={orders}
          saving={saving}
          setStatus={(id, orderStatus) =>
            mutate(
              `/order/${id}`,
              {
                method: 'PUT',
                body: JSON.stringify({
                  orderStatus,
                }),
              },
              `Are you sure you want to change this order status to ${orderStatus}?`
            )
          }
        />
      ) : null}

      {tab === 'reviews' ? (
        <Reviews reviews={reviews} />
      ) : null}

      {tab === 'users' ? (
        <Users
          users={users}
          suppliers={suppliers}
          saving={saving}
          mutate={mutate}
        />
      ) : null}
    </section>
  );
};

const Products = ({
  products,
  categories,
  suppliers,
  isSupplier,
  draft,
  setDraft,
  save,
  saving,
  toggle,
}) => {
  const [query, setQuery] = useState('');

  const [sort, setSort] = useState({
    field: 'productName',
    direction: 'asc',
  });

  const [page, setPage] = useState(1);

  const rows = useRows(
    products,
    query,
    sort,
    (item) =>
      `${item.productName} ${
        item.productDescription
      } ${
        item.supplierId?.supplierName || ''
      }`,
    (item, field) =>
      field === 'supplier'
        ? item.supplierId?.supplierName
        : item[field]
  );

  return (
    <div className="mt-6">
      <Controls
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        choices={[
          ['productName', 'Product name'],
          ['supplier', 'Supplier'],
          ['productPrice', 'Price'],
          ['stockQuantity', 'Stock'],
          ['createdAt', 'Newest'],
        ]}
      />

      <button
        type="button"
        className="mt-4 rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-yellow-400"
        onClick={() =>
          setDraft(blankProduct)
        }
      >
        Add product
      </button>

      {draft ? (
        <div className="mt-4 rounded-2xl border-2 border-zinc-900 bg-yellow-50 p-4">
          <h2 className="font-semibold">
            {draft._id
              ? 'Edit product'
              : 'New product'}
          </h2>

          <ProductForm
            value={draft}
            setValue={setDraft}
            categories={categories}
            suppliers={suppliers}
            isSupplier={isSupplier}
          />

          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={() =>
                setDraft(null)
              }
            >
              Cancel
            </Button>

            <Button
              primary
              disabled={saving}
              onClick={save}
            >
              {saving
                ? 'Saving…'
                : 'Save'}
            </Button>
          </div>
        </div>
      ) : null}

      <Table
        headers={[
          'Product',
          'Supplier',
          'Stock',
          'Status',
          '',
        ]}
      >
        {getPageRows(rows, page).map(
          (item) => (
            <tr
              key={item._id}
              className="border-t border-zinc-200"
            >
              <td className="px-4 py-3 font-medium">
                {item.productName}
              </td>

              <td className="px-4 py-3">
                {item.supplierId
                  ?.supplierName || '—'}
              </td>

              <td className="px-4 py-3">
                {item.stockQuantity}
              </td>

              <td className="px-4 py-3">
                {item.isActive === false
                  ? 'Disabled'
                  : 'Visible'}
              </td>

              <td className="px-4 py-3">
                <Button
                  onClick={() =>
                    setDraft({
                      ...item,
                      categoryId:
                        item.categoryId?._id ||
                        item.categoryId,
                      supplierId:
                        item.supplierId?._id ||
                        item.supplierId,
                    })
                  }
                >
                  Edit
                </Button>

                <Button
                  disabled={saving}
                  onClick={() =>
                    toggle(item)
                  }
                >
                  {item.isActive === false
                    ? 'Enable'
                    : 'Disable'}
                </Button>
              </td>
            </tr>
          )
        )}
      </Table>

      <Pager
        count={rows.length}
        page={page}
        setPage={setPage}
      />
    </div>
  );
};

const ProductForm = ({
  value,
  setValue,
  categories,
  suppliers,
  isSupplier,
}) => {
  const update = (field, next) =>
    setValue({
      ...value,
      [field]: next,
    });

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <Field
        label="Name"
        value={value.productName}
        onChange={(v) =>
          update('productName', v)
        }
      />

      <Field
        label="Slug"
        value={value.productSlug}
        onChange={(v) =>
          update('productSlug', v)
        }
      />

      <Field
        label="Price"
        type="number"
        value={value.productPrice}
        onChange={(v) =>
          update('productPrice', v)
        }
      />

      <Field
        label="Stock"
        type="number"
        value={value.stockQuantity}
        onChange={(v) =>
          update('stockQuantity', v)
        }
      />

      <Select
        label="Category"
        value={value.categoryId || ''}
        onChange={(v) =>
          update('categoryId', v)
        }
        options={categories.map(
          (item) => [
            item._id,
            item.categoryName,
          ]
        )}
      />

      {!isSupplier ? (
        <Select
          label="Supplier"
          value={value.supplierId || ''}
          onChange={(v) =>
            update('supplierId', v)
          }
          options={suppliers.map(
            (item) => [
              item._id,
              item.supplierName,
            ]
          )}
          optional
        />
      ) : null}

      <Select
        label="Stock status"
        value={value.stockStatus}
        onChange={(v) =>
          update('stockStatus', v)
        }
        options={[
          'In stock',
          'Low stock',
          'Out of stock',
          'Preorder',
        ].map((item) => [
          item,
          item,
        ])}
      />

      <Field
        label="Image path / URL"
        value={value.productImage}
        onChange={(v) =>
          update('productImage', v)
        }
      />

      <label className="sm:col-span-2 text-sm font-medium">
        Description

        <textarea
          value={value.productDescription}
          onChange={(e) =>
            update(
              'productDescription',
              e.target.value
            )
          }
          className="mt-1 min-h-20 w-full rounded-lg border-2 border-zinc-900 bg-white px-3 py-2"
        />
      </label>
    </div>
  );
};

const Categories = ({
  categories,
  saving,
  mutate,
}) => {
  const [form, setForm] = useState(null);

  const save = () =>
    mutate(
      form._id
        ? `/category/${form._id}`
        : '/category',
      {
        method: form._id
          ? 'PUT'
          : 'POST',
        body: JSON.stringify({
          categoryName:
            form.categoryName,
          categoryDescription:
            form.categoryDescription,
        }),
      },
      `Are you sure you want to ${
        form._id
          ? 'save changes to'
          : 'create'
      } this category?`
    ).then((saved) => {
      if (saved) {
        setForm(null);
      }
    });

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Categories
        </h2>

        <Button
          primary
          onClick={() =>
            setForm({
              categoryName: '',
              categoryDescription: '',
            })
          }
        >
          Add category
        </Button>
      </div>

      {form ? (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Category name"
              value={form.categoryName}
              onChange={(value) =>
                setForm({
                  ...form,
                  categoryName: value,
                })
              }
            />

            <Field
              label="Description"
              value={
                form.categoryDescription ||
                ''
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  categoryDescription:
                    value,
                })
              }
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={() =>
                setForm(null)
              }
            >
              Cancel
            </Button>

            <Button
              primary
              disabled={saving}
              onClick={save}
            >
              {saving
                ? 'Saving...'
                : 'Save category'}
            </Button>
          </div>
        </div>
      ) : null}

      <Table
        headers={[
          'Category',
          'Description',
          '',
        ]}
      >
        {categories.map((item) => (
          <tr key={item._id}>
            <td className="px-4 py-3 font-medium">
              {item.categoryName}
            </td>

            <td className="px-4 py-3">
              {item.categoryDescription ||
                '—'}
            </td>

            <td className="px-4 py-3">
              <Button
                onClick={() =>
                  setForm(item)
                }
              >
                Edit
              </Button>

              <Button
                disabled={saving}
                onClick={() =>
                  mutate(
                    `/category/${item._id}`,
                    {
                      method: 'DELETE',
                    },
                    `Are you sure you want to delete ${item.categoryName}? This cannot be undone.`
                  )
                }
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

const Orders = ({
  orders,
  saving,
  setStatus,
}) => {
  const [query, setQuery] = useState('');

  const [sort, setSort] = useState({
    field: 'orderedAt',
    direction: 'desc',
  });

  const [page, setPage] = useState(1);

  const rows = useRows(
    orders,
    query,
    sort,
    (item) =>
      `${
        item.userId?.firstName || ''
      } ${
        item.userId?.lastName || ''
      } ${
        item.orderStatus
      } ${
        item.orderItems
          .map(
            (orderItem) =>
              orderItem.productName
          )
          .join(' ')
      }`,
    (item, field) =>
      field === 'customer'
        ? `${
            item.userId?.firstName || ''
          } ${
            item.userId?.lastName || ''
          }`
        : item[field]
  );

  return (
    <>
      <Controls
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        choices={[
          ['orderedAt', 'Order date'],
          ['customer', 'Customer'],
          ['totalAmount', 'Total'],
          ['orderStatus', 'Status'],
        ]}
      />

      <Table
        headers={[
          'Customer',
          'Items',
          'Total',
          'Status',
        ]}
      >
        {getPageRows(rows, page).map(
          (order) => (
            <tr
              key={order._id}
              className="border-t border-zinc-200"
            >
              <td className="px-4 py-3">
                {order.userId
                  ? `${order.userId.firstName} ${order.userId.lastName}`
                  : 'Unknown'}
              </td>

              <td className="px-4 py-3">
                {order.orderItems
                  .map(
                    (item) =>
                      `${item.productName} × ${item.quantity}`
                  )
                  .join(', ')}
              </td>

              <td className="px-4 py-3">
                ₱{order.totalAmount}
              </td>

              <td className="px-4 py-3">
                <select
                  disabled={saving}
                  value={order.orderStatus}
                  onChange={(e) =>
                    setStatus(
                      order._id,
                      e.target.value
                    )
                  }
                  className="rounded border border-zinc-400 bg-white px-2 py-1"
                >
                  {statuses.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}
                </select>
              </td>
            </tr>
          )
        )}
      </Table>

      <Pager
        count={rows.length}
        page={page}
        setPage={setPage}
      />
    </>
  );
};

const Reviews = ({ reviews }) => {
  const [query, setQuery] = useState('');

  const [sort, setSort] = useState({
    field: 'createdAt',
    direction: 'desc',
  });

  const [page, setPage] = useState(1);

  const rows = useRows(
    reviews,
    query,
    sort,
    (item) =>
      `${
        item.productId?.productName ||
        ''
      } ${
        item.userId?.firstName || ''
      } ${
        item.userId?.lastName || ''
      } ${item.reviewComment}`,
    (item, field) =>
      field === 'product'
        ? item.productId?.productName
        : item[field]
  );

  return (
    <>
      <Controls
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        choices={[
          ['createdAt', 'Newest'],
          ['product', 'Product'],
          ['reviewRating', 'Rating'],
        ]}
      />

      <Table
        headers={[
          'Product',
          'Customer',
          'Rating',
          'Review',
        ]}
      >
        {getPageRows(rows, page).map(
          (item) => (
            <tr
              key={item._id}
              className="border-t border-zinc-200"
            >
              <td className="px-4 py-3 font-medium">
                {item.productId
                  ?.productName ||
                  'Deleted product'}
              </td>

              <td className="px-4 py-3">
                {item.userId
                  ? `${item.userId.firstName} ${item.userId.lastName}`
                  : 'Unknown'}
              </td>

              <td className="px-4 py-3">
                {item.reviewRating}/5
              </td>

              <td className="px-4 py-3">
                {item.reviewComment}
              </td>
            </tr>
          )
        )}
      </Table>

      <Pager
        count={rows.length}
        page={page}
        setPage={setPage}
      />
    </>
  );
};

const Users = ({
  users,
  suppliers,
  saving,
  mutate,
}) => {
  const [page, setPage] = useState(1);

  return (
    <>
      <Table
        headers={[
          'Name',
          'Email',
          'Role',
          'Affiliation',
        ]}
      >
        {getPageRows(users, page).map(
          (item) => (
            <UserRow
              key={item._id}
              user={item}
              suppliers={suppliers}
              saving={saving}
              mutate={mutate}
            />
          )
        )}
      </Table>

      <Pager
        count={users.length}
        page={page}
        setPage={setPage}
      />
    </>
  );
};

const UserRow = ({
  user,
  suppliers,
  saving,
  mutate,
}) => {
  const [value, setValue] = useState({
    ...user,
    affiliation:
      user.affiliation?._id ||
      user.affiliation ||
      '',
  });

  return (
    <tr className="border-t border-zinc-200">
      <td className="px-4 py-3">
        {user.firstName} {user.lastName}
      </td>

      <td className="px-4 py-3">
        {user.email}
      </td>

      <td className="px-4 py-3">
        <select
          value={value.userRole}
          onChange={(e) =>
            setValue({
              ...value,
              userRole: e.target.value,
            })
          }
        >
          {[
            'customer',
            'supplier',
            'admin',
          ].map((role) => (
            <option key={role}>
              {role}
            </option>
          ))}
        </select>
      </td>

      <td className="px-4 py-3">
        <select
          value={value.affiliation}
          onChange={(e) =>
            setValue({
              ...value,
              affiliation:
                e.target.value,
            })
          }
        >
          <option value="">
            Not assigned
          </option>

          {suppliers.map((supplier) => (
            <option
              key={supplier._id}
              value={supplier._id}
            >
              {supplier.supplierName}
            </option>
          ))}
        </select>

        <Button
          disabled={saving}
          onClick={() =>
            mutate(
              `/user/${user._id}`,
              {
                method: 'PUT',
                body: JSON.stringify({
                  firstName:
                    value.firstName,
                  lastName:
                    value.lastName,
                  email: value.email,
                  userRole:
                    value.userRole,
                  affiliation:
                    value.affiliation ||
                    null,
                }),
              },
              `Are you sure you want to save changes for ${user.firstName} ${user.lastName}?`
            )
          }
        >
          Save
        </Button>
      </td>
    </tr>
  );
};

const Table = ({
  headers,
  children,
}) => (
  <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
    <table className="w-full text-left text-sm">
      <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              className="px-4 py-3"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="divide-y divide-zinc-100 text-zinc-700">
        {children}
      </tbody>
    </table>
  </div>
);

const Pager = ({
  count,
  page,
  setPage,
}) => {
  const pages = Math.max(
    1,
    Math.ceil(count / pageSize)
  );

  const current = Math.min(
    page,
    pages
  );

  return (
    <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
      <span>
        {count} record
        {count === 1 ? '' : 's'} · Page{' '}
        {current} of {pages}
      </span>

      <div className="flex gap-2">
        <Button
          disabled={current === 1}
          onClick={() =>
            setPage(current - 1)
          }
        >
          Previous
        </Button>

        <Button
          disabled={current === pages}
          onClick={() =>
            setPage(current + 1)
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = 'text',
}) => (
  <label className="text-sm font-medium text-zinc-700">
    {label}

    <input
      type={type}
      value={value ?? ''}
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-blue-900"
    />
  </label>
);

const Select = ({
  label,
  value,
  onChange,
  options,
  optional,
}) => (
  <label className="text-sm font-medium text-zinc-700">
    {label}

    <select
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-blue-900"
    >
      {optional ? (
        <option value="">
          Not assigned
        </option>
      ) : (
        <option value="">
          Choose {label.toLowerCase()}
        </option>
      )}

      {options.map(([id, name]) => (
        <option
          key={id}
          value={id}
        >
          {name}
        </option>
      ))}
    </select>
  </label>
);

const Button = ({
  children,
  primary,
  ...props
}) => (
  <button
    type="button"
    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
      primary
        ? 'bg-blue-900 text-white hover:bg-blue-800'
        : 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
    }`}
    {...props}
  >
    {children}
  </button>
);

export default DashboardPage;