const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const productImages = import.meta.glob('./img/*', { eager: true, query: '?url', import: 'default' });

export const resolveProductImage = (imagePath) => {
  if (!imagePath || imagePath.startsWith('http')) return imagePath;
  const fileName = imagePath.split('/').pop();
  return productImages[`./img/${fileName}`] || imagePath;
};

const normalizeProduct = (product) => ({
  ...product,
  name: product.productSlug,
  title: product.productName,
  category: product.categoryId?.categoryName || 'Uncategorized',
  price: `PHP ${product.productPrice}`,
  stock: product.stockStatus,
  image: resolveProductImage(product.productImage),
  content: [product.productDescription],
});

const request = async (path) => {
  const result = await fetch(`${API_URL}/products${path}`);
  if (!result.ok) throw new Error('Unable to load products.');
  return result.json();
};

export const getProducts = async (page = 1, limit = 10, filters = {}) => {
  const query = new URLSearchParams({ page, limit });
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const result = await request(`?${query.toString()}`);
  return { products: result.data.map(normalizeProduct), total: result.count };
};

export const getCategories = async () => {
  const result = await fetch(`${API_URL}/category`);
  if (!result.ok) throw new Error('Unable to load categories.');
  return result.json();
};

export const getProduct = async (slug) => {
  const result = await request(`/${encodeURIComponent(slug)}`);
  return normalizeProduct(result.data);
};
