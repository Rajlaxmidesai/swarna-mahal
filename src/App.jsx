import { useEffect, useState } from "react";
import "./App.css";

import axios from "axios";
import Signup from "./pages/Signup.jsx";

import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Welcome from "./pages/Welcome.jsx";
import Shop from "./pages/Shop";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AdminOrders from "./pages/AdminOrders.jsx";
const products = [
  {
    id: 1,
    name: "Royal Bridal Necklace",
    category: "Necklaces",
    price: 45999,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=80",
    description: "Traditional elegance for your special day",
  },
  {
    id: 2,
    name: "Golden Drop Earrings",
    category: "Earrings",
    price: 8999,
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=700&q=80",
    description: "A graceful touch of golden beauty",
  },
  {
    id: 3,
    name: "Forever Gold Ring",
    category: "Rings",
    price: 12999,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=80",
    description: "A little symbol of forever",
  },
  {
    id: 4,
    name: "Heritage Gold Necklace",
    category: "Necklaces",
    price: 32999,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80",
    description: "Inspired by timeless Indian artistry",
  },
  {
    id: 5,
    name: "Classic Gold Bangles",
    category: "Bangles",
    price: 18999,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=700&q=80",
    description: "Tradition wrapped around your wrist",
  },
  {
    id: 6,
    name: "Elegant Bridal Set",
    category: "Sets",
    price: 55999,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80",
    description: "A statement for unforgettable occasions",
  },
];

const categories = ["All", "Necklaces", "Earrings", "Rings", "Bangles", "Sets"];

function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
const [cartReady, setCartReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  }

  const getCartKey = (user) => {
  const userId = user?._id || user?.id || user?.email;
  return userId ? `swarnaCart_${userId}` : null;
};

const [cart, setCart] = useState(() => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const key = getCartKey(user);

    return key ? JSON.parse(localStorage.getItem(key)) || [] : [];
  } catch {
    return [];
  }
});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const [customer, setCustomer] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("Unable to load jewellery. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const visibleProducts = products
    .filter((product) =>
      selectedCategory === "All" ? true : product.category === selectedCategory,
    )
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return a.price - b.price;
      }

      if (sortBy === "price-high") {
        return b.price - a.price;
      }

      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      return 0;
    });

  function addToCart(product) {
    const productId = product._id || product.id;

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => (item._id || item.id) === productId,
      );

      if (existingItem) {
        return currentCart.map((item) =>
          (item._id || item.id) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          cartItemId: crypto.randomUUID(),
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(cartItemId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.cartItemId !== cartItemId),
    );
  }

  function updateQuantity(cartItemId, change) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: item.quantity + change,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }
useEffect(() => {
  const key = getCartKey(currentUser);

  if (!key) {
    setCart([]);
    setCartReady(true);
    return;
  }

  try {
    setCart(JSON.parse(localStorage.getItem(key)) || []);
  } catch {
    setCart([]);
  }

  setCartReady(true);
}, [currentUser]);

useEffect(() => {
  const key = getCartKey(currentUser);

  if (!cartReady || !key) return;

  localStorage.setItem(key, JSON.stringify(cart));
}, [cart, currentUser, cartReady]);


  async function handlePlaceOrder(event) {
    event.preventDefault();
    setPlacingOrder(true);
    setOrderMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/orders", {
        ...customer,

        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
      });

      setOrderMessage(
        `Order placed successfully! Order ID: ${response.data.order._id}`,
      );
      setCart([]);
      navigate("/order-success");
      setCustomer({
        customerName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
      });
    } catch (error) {
      setOrderMessage(
        error.response?.data?.message ||
          "Unable to place your order. Please try again.",
      );
    } finally {
      setPlacingOrder(false);
    }
  }
  if (loading) {
    return <div className="loading-message">Loading jewellery...</div>;
  }
  if (error) {
    return (
      <div className="loading-message">
        {error}
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  if (
    !currentUser &&
    location.pathname !== "/login" &&
    location.pathname !== "/signup"
  ) {
    return <Login />;
  }
  if (location.pathname === "/signup") {
    return <Signup />;
  }
  if (location.pathname === "/login") {
    return <Login />;
  }
  if (location.pathname === "/shop") {
    return (
      <Shop
        products={products}
        cart={cart}
        addToCart={addToCart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        setCart={setCart}
        navigate={navigate}
      />
    );
  }
  if (location.pathname === "/welcome") {
    if (!currentUser) {
      navigate("/login");
      return null;
    }

    if (currentUser.role === "admin") {
      navigate("/admin");
      return null;
    }

    return <Welcome />;
  }

  if (location.pathname === "/admin/orders") {
    if (!currentUser) {
      navigate("/login");
      return null;
    }

    if (currentUser.role !== "admin") {
      return (
        <div
          className="website"
          style={{ padding: "60px 20px", textAlign: "center" }}
        >
          <h1>Access Denied</h1>
          <p>You do not have permission to manage orders.</p>
          <button onClick={() => navigate("/")}>Back to Home</button>
        </div>
      );
    }

    return <AdminOrders />;
  }

  if (location.pathname === "/admin") {
    if (!currentUser) {
      navigate("/login");
      return null;
    }

    if (currentUser.role !== "admin") {
      return (
        <div
          className="website"
          style={{ padding: "60px 20px", textAlign: "center" }}
        >
          <h1>Access Denied</h1>
          <p>You do not have permission to access the admin dashboard.</p>
          <button onClick={() => navigate("/")}>Back to Home</button>
        </div>
      );
    }

    return <AdminDashboard />;
  }
  if (location.pathname === "/checkout") {
    return (
      <div className="website">
        <header className="navbar">
          <h2 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            Swarna Mahal
          </h2>
          <button onClick={() => navigate("/")}>Continue Shopping</button>
        </header>

        <main className="checkout-page">
          <h1>Complete Your Order</h1>
          <p>Your jewellery journey is almost complete.</p>

          <div className="checkout-order-summary">
            <h2>Your Shopping Bag</h2>

            {cart.map((item) => (
              <div key={item.cartItemId}>
                <span>{item.name}</span>
                <strong>
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")} ×{" "}
                  {item.quantity}
                </strong>
              </div>
            ))}

            <h3>
              Total: ₹
              {cart
                .reduce((total, item) => total + item.price * item.quantity, 0)
                .toLocaleString("en-IN")}
            </h3>
          </div>

          <form onSubmit={handlePlaceOrder} className="checkout-form">
            <input
              placeholder="Full Name"
              value={customer.customerName}
              onChange={(e) =>
                setCustomer({ ...customer, customerName: e.target.value })
              }
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={customer.email}
              onChange={(e) =>
                setCustomer({ ...customer, email: e.target.value })
              }
              required
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Full Delivery Address"
              value={customer.address}
              onChange={(e) =>
                setCustomer({ ...customer, address: e.target.value })
              }
              required
            />

            <input
              placeholder="City"
              value={customer.city}
              onChange={(e) =>
                setCustomer({ ...customer, city: e.target.value })
              }
              required
            />

            <input
              placeholder="6-digit PIN Code"
              value={customer.pincode}
              onChange={(e) =>
                setCustomer({ ...customer, pincode: e.target.value })
              }
              pattern="[0-9]{6}"
              required
            />

            <button type="submit" disabled={placingOrder || cart.length === 0}>
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </main>
      </div>
    );
  }

  if (location.pathname === "/order-success") {
    return (
      <div className="website">
        <header className="navbar">
          <h2 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            Swarna Mahal
          </h2>
        </header>

        <main className="order-success-page">
          <div className="success-icon">✓</div>

          <p className="success-eyebrow">THANK YOU FOR CHOOSING US</p>

          <h1>Your Order Is Placed!</h1>

          <p>
            Your order has been received successfully. We look forward to making
            your jewellery experience special.
          </p>

          {orderMessage && (
            <div className="order-message" role="status">
              {orderMessage}
            </div>
          )}

          <button onClick={() => navigate("/")}>Continue Shopping</button>
        </main>
      </div>
    );
  }

  return (
    <div className="website">
      <div className="announcement">
        ✨ Celebrate every occasion with timeless jewellery ✨
      </div>

      <header className="navbar">
        <a href="#home" className="logo">
          SWARNA <span>MAHAL</span>
          <small>THE ROYAL JEWELLERY HOUSE</small>
        </a>
        {currentUser ? (
          <span className="welcome-user">Welcome, {currentUser.name}</span>
        ) : (
          <div className="account-actions">
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/signup")}>Sign Up</button>
          </div>
        )}
        <nav>
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#collections">Collections</a>
          <a href="#about">Our Story</a>
          <a href="#contact">Contact</a>
        </nav>

        <button className="shop-button" onClick={() => navigate("/")}>
          🛍 Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
        </button>
        {currentUser && (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">TRADITION • BEAUTY • ELEGANCE</p>
            <h1>
              Jewels that tell
              <br />
              your <em>royal story.</em>
            </h1>
            <p className="hero-description">
              Discover timeless treasures inspired by Indian heritage, crafted
              to make your most precious moments unforgettable.
            </p>
            <a className="hero-button" href="/shop">
              Shop Jewellery <span>↗</span>
            </a>
            <p className="hero-note">Made for your most beautiful moments.</p>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=85"
              alt="Elegant jewellery"
            />
            <div className="image-label">
              <span>THE BRIDAL EDIT</span>
              <strong>Elegance, forever.</strong>
            </div>
          </div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <p className="eyebrow">THE SWARNA MAHAL EDIT</p>
            <h2>
              Shop Our <em>Jewellery</em>
            </h2>
            <p>Discover something beautiful for every occasion.</p>
            <a
              href="/shop"
              className="collection-arrow"
              aria-label="Explore all jewellery"
            >
              ↗
            </a>
          </div>

          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={
                  selectedCategory === category
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product._id || product.id}>
                <div className="product-image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  <span className="product-tag">SWARNA PICK</span>
                </div>

                <div className="product-info">
                  <p className="product-category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>

                  <div className="product-bottom">
                    <strong>
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </strong>

                    {addToCart && (
                      <button onClick={() => addToCart(product)}>
                        + Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
             


          {cart.length > 0 && (
            <div className="cart-summary" aria-live="polite">
              <div>
                <strong>Your shopping bag</strong>

                {cart.map((item) => (
                  <div className="cart-item" key={item.cartItemId}>
                    <span>
                      {item.name} — ₹{item.price.toLocaleString("en-IN")}
                    </span>

                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-cart-item"
                      onClick={() => removeFromCart(item.cartItemId)}
                      aria-label={`Remove ${item.name} from cart`}
                      title="Remove item"
                    >
                      🗑
                    </button>
                  </div>
                ))}

                <p>
                  {cart.reduce((total, item) => total + item.quantity, 0)}{" "}
                  item(s) added · Total ₹
                  {cart
                    .reduce(
                      (total, item) => total + item.price * item.quantity,
                      0,
                    )
                    .toLocaleString("en-IN")}
                </p>
              </div>

              <button onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </button>

              <button className="clear-cart" onClick={() => setCart([])}>
                Clear Cart
              </button>
            </div>
          )}

          {showCheckout && (
            <div className="checkout-panel">
              <h2>Complete Your Order</h2>
              <p>Enter your details for jewellery delivery.</p>
              {orderMessage && (
                <div className="order-message" role="status">
                  {orderMessage}
                </div>
              )}
              <form onSubmit={handlePlaceOrder} className="checkout-form">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customer.customerName}
                  onChange={(e) =>
                    setCustomer({ ...customer, customerName: e.target.value })
                  }
                  required
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  required
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  required
                />

                <textarea
                  placeholder="Full Delivery Address"
                  value={customer.address}
                  onChange={(e) =>
                    setCustomer({ ...customer, address: e.target.value })
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="City"
                  value={customer.city}
                  onChange={(e) =>
                    setCustomer({ ...customer, city: e.target.value })
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="PIN Code"
                  value={customer.pincode}
                  onChange={(e) =>
                    setCustomer({ ...customer, pincode: e.target.value })
                  }
                  pattern="[0-9]{6}"
                  title="Enter a valid 6-digit PIN code"
                  required
                />

                <p>
                  Order Total: ₹
                  {cart
                    .reduce((total, item) => total + item.price, 0)
                    .toLocaleString("en-IN")}
                </p>

                <button type="submit" disabled={placingOrder}>
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>

                <button type="button" onClick={() => setShowCheckout(false)}>
                  Cancel
                </button>
              </form>
            </div>
          )}
        </section>

        <section className="collections" id="collections">
          <div className="section-heading">
            <p className="eyebrow">CURATED WITH LOVE</p>
            <h2>
              Made for <em>Every Occasion</em>
            </h2>
            <p>
              From everyday elegance to your once-in-a-lifetime celebration.
            </p>
          </div>
          <div className="occasion-grid">
            <a
              className="occasion-card"
              href="#shop"
              onClick={() => setSelectedCategory("Necklaces")}
            >
              <span>01 / THE BRIDE</span>
              <strong>Bridal Treasures ↗</strong>
            </a>
            <a
              className="occasion-card"
              href="#shop"
              onClick={() => setSelectedCategory("Earrings")}
            >
              <span>02 / THE CELEBRATION</span>
              <strong>Festive Elegance ↗</strong>
            </a>
            <a
              className="occasion-card"
              href="#shop"
              onClick={() => setSelectedCategory("Rings")}
            >
              <span>03 / THE EVERYDAY</span>
              <strong>Everyday Classics ↗</strong>
            </a>
          </div>
        </section>

        <section className="story" id="about">
          <p className="eyebrow">OUR PROMISE</p>
          <h2>
            Tradition in every detail.
            <br />
            <em>Love in every creation.</em>
          </h2>
          <p>
            At Swarna Mahal, every jewel celebrates your story — from cherished
            traditions to the beginning of forever.
          </p>
        </section>

        <section className="contact" id="contact">
          <p className="eyebrow">LET US HELP YOU FIND YOUR TREASURE</p>
          <h2>
            Your special moment deserves something <em>extraordinary.</em>
          </h2>
          <p>
            Contact us for bridal selections, product enquiries and store
            visits.
          </p>
          <a className="hero-button" href="mailto:hello@swarnamahal.example">
            Enquire With Us ↗
          </a>
        </section>
      </main>

      <footer>
        <a href="#home" className="logo">
          SWARNA <span>MAHAL</span>
          <small>THE ROYAL JEWELLERY HOUSE</small>
        </a>
        <p>
          © {new Date().getFullYear()} Swarna Mahal. A celebration of timeless
          beauty.
        </p>
      </footer>
    </div>
  );
}

export default App;
