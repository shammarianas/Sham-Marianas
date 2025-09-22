import  { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useUser } from "../Context/UserProvider";

const Cart = () => {
  const { currentUser } = useUser();

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    // Component mounted
  }, [])

  useEffect(() => {
    const fetchCartItems = () => {
      const savedCart = localStorage.getItem("cart");
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    };

    fetchCartItems();

    const handleStorageChange = () => {
      fetchCartItems();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const removeItemFromCart = useCallback(
    (id) => {
      const newCartItems = cartItems.filter((cartItem) => cartItem.id !== id);
      setCartItems(newCartItems);
      localStorage.setItem("cart", JSON.stringify(newCartItems));
    },
    [cartItems]
  );

  const calculateTotal = useCallback(() => {
    const totalNum = cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const discount = Number(item.discount ?? 0) || 0;
      const final = Math.max(0, price - (price * discount) / 100);
      return total + final;
    }, 0);
    return totalNum.toFixed(2);
  }, [cartItems]);

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems, userId: currentUser?.uid }),
      });

      const { id } = await response.json();
      if (id) {
        window.location.href = `https://checkout.stripe.com/pay/${id}`;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Cart | Shammarianas</title>
        <meta
          name="description"
          content="View your cart items and proceed to checkout."
        />
        <meta property="og:title" content="Cart | Shammarianas" />
        <meta
          property="og:description"
          content="View your cart items and proceed to checkout."
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="page_content">
        <div className="cart_main">
          <div className="title">
            <h1>Cart</h1>
          </div>

          {cartItems.length > 0 ? (
            <>
              <div className="cart_items">
                {cartItems.map((item) => (
                  <div className="cart_item" key={item.id}>
                    <Link to={`/View/${item.id}`} key={item.id}>
                      <div className="image">
                        <img src={item.thumbnail} alt="item" />
                      </div>
                      <div className="item_details">
                        <div className="item_title">{item.title}</div>
                        <div className="price">
                          $
                          {(() => {
                            const price = Number(item.price) || 0;
                            const discount = Number(item.discount ?? 0) || 0;
                            const final = Math.max(0, price - (price * discount) / 100);
                            return final.toFixed(2);
                          })()}
                        </div>
                      </div>
                    </Link>
                    <div className="remove_button">
                      <button onClick={() => removeItemFromCart(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart_total">
                <div className="row">
                  <span>Total: ${calculateTotal()}</span>
                </div>
                <div className="checkout_button">
                  <Link to="/Checkout">
                    <button>Checkout</button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="empty_cart">
              <h2>Your cart is empty</h2>
              <Link to="/">
                <button>Continue Shopping</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
