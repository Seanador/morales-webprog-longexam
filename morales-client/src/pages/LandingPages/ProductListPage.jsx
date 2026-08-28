import Button from '../../components/Button.jsx';
import ProductList from '../../components/ProductList.jsx';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../../assets/product-content.js';

const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(() => searchParams.get('category') || '');
  const [sort, setSort] = useState('-price');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 10;
  const pageCount = Math.ceil(total / limit);

  const changePage = (nextPage) => {
    setLoading(true);
    setError('');
    setPage(nextPage);
  };

  const applySearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const changeFilter = (setFilter) => (event) => {
    setPage(1);
    setFilter(event.target.value);
  };

  useEffect(() => {
    getProducts(page, limit, { search, category, sort })
      .then(({ products: fetchedProducts, total: fetchedTotal }) => {
        setProducts(fetchedProducts);
        setTotal(fetchedTotal);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [page, search, category, sort]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
          Products
        </p>
        <h1 className="max-w-xl text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
          Shop Bulldog Merch
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-600 sm:text-base">
          Browse National University's Official Merchandise Product Catalog
        </p>
        <div className="mt-6">
          <Button to="/">Back Home</Button>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Featured Products
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-900">Product card grid</h2>
        </div>

        <form onSubmit={applySearch} className="mb-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
          <label className="sr-only" htmlFor="product-search">Search products</label>
          <input
            id="product-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products"
            className="min-w-0 rounded-full border-2 border-zinc-900 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <Button type="submit">Search</Button>
          <select
            value={category}
            onChange={changeFilter(setCategory)}
            aria-label="Filter by category"
            className="rounded-full border-2 border-zinc-900 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">All categories</option>
            {categories.map((item) => <option key={item._id} value={item.categoryName}>{item.categoryName}</option>)}
          </select>
          <select
            value={sort}
            onChange={changeFilter(setSort)}
            aria-label="Sort products"
            className="rounded-full border-2 border-zinc-900 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="-price">Price: High to low</option>
            <option value="price">Price: Low to high</option>
            <option value="name">Name: A to Z</option>
          </select>
        </form>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {loading ? <p className="text-sm text-zinc-600">Loading products...</p> : null}
        {!error && !loading ? <ProductList products={products} /> : null}

        {!error && pageCount > 1 ? (
          <div className="mt-8 flex items-center justify-between gap-4 border-t-2 border-zinc-900 pt-6">
            <Button onClick={() => changePage(page - 1)} disabled={page === 1}>
              Previous
            </Button>
            <span className="text-sm font-semibold text-zinc-700">
              Page {page} of {pageCount}
            </span>
            <Button onClick={() => changePage(page + 1)} disabled={page === pageCount}>
              Next
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default ProductListPage
