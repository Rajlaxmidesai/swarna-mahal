import { useState } from "react";

function Shop({
  products = [],
  cart = [],
  addToCart,
  updateQuantity,
  removeFromCart,
  setCart,
  navigate,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
}) {
  const [localCategory, setLocalCategory] = useState("All");

  const category = selectedCategory ?? localCategory;
  const changeCategory = setSelectedCategory ?? setLocalCategory;

  const [localSearch, setLocalSearch] = useState("");
  const [localSort, setLocalSort] = useState("default");

  const search = setSearchTerm ? searchTerm : localSearch;
  const changeSearch = setSearchTerm ?? setLocalSearch;

  const sort = setSortBy ? sortBy : localSort;
  const changeSort = setSortBy ?? setLocalSort;

  const categories = [
    "All",
    "Necklaces",
    "Earrings",
    "Rings",
    "Bangles",
    "Sets",
  ];

  let visibleProducts = products.filter((product) => {
    const matchesCategory = category === "All" || product.category === category;

    const matchesSearch = (product.name || "")
      .toLowerCase()
      .includes((search || "").toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (sort === "price-low") {
    visibleProducts.sort((a, b) => a.price - b.price);
  } else if (sort === "price-high") {
    visibleProducts.sort((a, b) => b.price - a.price);
  } else if (sort === "name") {
    visibleProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <main className="shop-page">
      <button
  type="button"
  className="shop-button"
  onClick={() => navigate("/")}
>
  ← Home
</button>
      <button
  className="shop-button"
  onClick={() =>
    document.getElementById("cart")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
>
  🛍 Cart (
  {cart.reduce((total, item) => total + item.quantity, 0)})
</button>
      <h1>Explore Our Collection</h1>
      <p>Discover jewellery crafted for every occasion.</p>

      <div className="shop-tools">
        <input
          className="product-search"
          type="search"
          placeholder="Search jewellery..."
          value={search || ""}
          onChange={(e) => changeSearch(e.target.value)}
        />

        <select
          className="product-sort"
          value={sort || "default"}
          onChange={(e) => changeSort(e.target.value)}
        >
          <option value="default">Sort By</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      <div className="category-filters">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={
              category === item ? "filter-button active" : "filter-button"
            }
            onClick={() => changeCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {visibleProducts.length === 0 ? (
        <p>No jewellery found. Try another search or category.</p>
      ) : (
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
            )}
            
      {cart.length > 0 && (
        <div className="cart-summary" id="cart" aria-live="polite">
          <strong>Your shopping bag</strong>

          {cart.map((item) => (
            <div className="cart-item" key={item.cartItemId}>
              <span>
                {item.name} — ₹
                {Number(item.price).toLocaleString("en-IN")}
              </span>

              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.cartItemId, -1)}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.cartItemId, 1)}
                >
                  +
                </button>
              </div>

              <button
                className="remove-cart-item"
                onClick={() => removeFromCart(item.cartItemId)}
              >
                🗑
              </button>
            </div>
          ))}

          <p>
            {cart.reduce((total, item) => total + item.quantity, 0)} item(s)
            added · Total ₹
            {cart
              .reduce(
                (total, item) => total + item.price * item.quantity,
                0
              )
              .toLocaleString("en-IN")}
          </p>

          <button onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>

          <button className="clear-cart" onClick={() => setCart([])}>
            Clear Cart
          </button>
        </div>
      )}
    </main>
  );
}

export default Shop;
