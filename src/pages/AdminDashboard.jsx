import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "Necklaces",
    price: "",
    image: "",
    description: "",
    stock: 10,
  });

  async function fetchProducts() {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      const data = response.data;
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      setMessage("Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/products",
        {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessage("Product added successfully!");

      setForm({
        name: "",
        category: "Necklaces",
        price: "",
        image: "",
        description: "",
        stock: 10,
      });

      await fetchProducts();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to add product. Please check your login and details.",
      );
    } finally {
      setSaving(false);
    }
  }
  
async function handleEditProduct(product) {
  const name = window.prompt('Product name:', product.name)
  if (name === null) return

  const category = window.prompt('Category:', product.category)
  if (category === null) return

  const priceInput = window.prompt('Price:', product.price)
  if (priceInput === null) return

  const image = window.prompt('Image URL:', product.image)
  if (image === null) return

  const description = window.prompt(
    'Description:',
    product.description || ''
  )
  if (description === null) return

  const stockInput = window.prompt('Stock quantity:', product.stock ?? 0)
  if (stockInput === null) return

  const price = Number(priceInput)
  const stock = Number(stockInput)

  if (
    !name.trim() ||
    !category.trim() ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    !image.trim()
  ) {
    setMessage('Please enter valid product details.')
    return
  }

  try {
    setMessage('')
    const token = localStorage.getItem('token')

    await axios.put(
      `http://localhost:5000/api/products/${product._id}`,
      {
        name: name.trim(),
        category: category.trim(),
        price,
        image: image.trim(),
        description: description.trim(),
        stock,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    setMessage('Product updated successfully!')
    await fetchProducts()
  } catch (error) {
    setMessage(
      error.response?.data?.message ||
        'Unable to update product.'
    )
  }
}

  return (
    <div className="website">
      
<header className="navbar">
  <h2>Swarna Mahal</h2>
  <h3>Admin Dashboard</h3>
  <button onClick={() => window.location.href = '/admin/orders'}>
    Manage Orders
  </button>
</header>


      <main className="admin-dashboard">
        <h1>Product Management</h1>
        <p>Manage the jewellery available in your store.</p>

        <section className="admin-form-section">
          <h2>Add New Jewellery</h2>

          <form className="admin-product-form" onSubmit={handleSubmit}>
            <label>
              Product Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Royal Gold Necklace"
                required
              />
            </label>

            <label>
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="Necklaces">Necklaces</option>
                <option value="Earrings">Earrings</option>
                <option value="Rings">Rings</option>
                <option value="Bangles">Bangles</option>
                <option value="Bracelets">Bracelets</option>
                <option value="Pendants">Pendants</option>
              </select>
            </label>

            <label>
              Price (₹)
              <input
                name="price"
                type="number"
                min="1"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="25000"
                required
              />
            </label>

            <label>
              Stock Quantity
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </label>

            <label className="admin-form-full">
              Image URL
              <input
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/jewellery.jpg"
                required
              />
            </label>

            <label className="admin-form-full">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the jewellery..."
                rows="3"
              />
            </label>

            <button type="submit" disabled={saving}>
              {saving ? "Adding Product..." : "Add Product"}
            </button>
          </form>

          {message && (
            <p className="admin-form-message" role="status">
              {message}
            </p>
          )}
        </section>

        <section>
          <h2>Existing Products ({products.length})</h2>

          {loading && <p>Loading products...</p>}

          {!loading && products.length === 0 && <p>No products found.</p>}

          <div className="admin-product-grid">
            {products.map((product) => (
              <article className="admin-product-card" key={product._id}>
                <div className="admin-product-image-wrap">
                  <img
                    className="admin-product-image"
                    src={product.image}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      event.currentTarget.nextElementSibling.style.display =
                        "flex";
                    }}
                  />
                  <div
                    className="admin-product-image-fallback"
                    style={{ display: "none" }}
                  >
                    {product.name}
                  </div>
                </div>

                <div className="admin-product-info">
                  <h3>{product.name}</h3>
                  <p>{product.category}</p>
                  <strong>
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </strong>
                  <p>Stock: {product.stock ?? 0}</p>

                  
                  <button
                    className="admin-edit-button"
                    onClick={() => handleEditProduct(product)}
                  >
                    Edit Product
                  </button>


                  <button
                    className="admin-delete-button"
                    onClick={async () => {
                      const confirmed = window.confirm(
                        `Are you sure you want to delete "${product.name}"?`,
                      );

                      if (!confirmed) return;

                      try {
                        const token = localStorage.getItem("token");

                        await axios.delete(
                          `http://localhost:5000/api/products/${product._id}`,
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          },
                        );

                        setMessage("Product deleted successfully!");
                        await fetchProducts();
                      } catch (error) {
                        setMessage(
                          error.response?.data?.message ||
                            "Unable to delete product.",
                        );
                      }
                    }}
                  >
                    Delete Product
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
