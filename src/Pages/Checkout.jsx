import { useState, useEffect, useCallback, createRef } from "react";
import { ethers } from "ethers";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useUser } from "../Context/UserProvider";
import PropTypes from "prop-types";

// Using Stripe Checkout Sessions via backend

const Checkout = () => {
  const { currentUser } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [loading, setLoading] = useState(false);
  // const paymentFormRef = createRef();

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
  }, []);

  const calculateTotal = useCallback(() => {
    const totalNum = cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const discount = Number(item.discount ?? 0) || 0;
      const final = Math.max(0, price - (price * discount) / 100);
      return total + final;
    }, 0);
    return totalNum.toFixed(2);
  }, [cartItems]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addToPurchase = async (assetList) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, "Profiles", currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const currentPurchases = userDoc.data().purchases || [];
        const newPurchases = [...currentPurchases, ...assetList];
        await updateDoc(userRef, { purchases: newPurchases });
      }
    } catch (error) {
      console.error("Error adding to purchases:", error);
    }
  };

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems, userId: currentUser?.uid || "guest" }),
      });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error(data.error || "Unable to start checkout");
    } catch (error) {
      console.error("Payment init failed:", error);
      alert("Payment failed to initialize. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const payWithCrypto = async () => {
    if (!window.ethereum) {
      alert("No Ethereum wallet detected. Please install an Ethereum wallet to proceed.");
      return;
    }

    setLoading(true);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const ethToInrRate = 120000;
      const totalInInr = (calculateTotal() * 1.03).toFixed(2);
      const totalInEth = (totalInInr / ethToInrRate).toFixed(6);

      const transactionParameters = {
        to: "0x3349CfAcd34b41D2Db7Cc88B9038aD0c5f9D6888",
        value: ethers.parseEther(totalInEth.toString()),
        gasLimit: 21000,
      };

      const tx = await signer.sendTransaction(transactionParameters);
      await tx.wait();

      await addToPurchase(cartItems);
      localStorage.removeItem("cart");
      setCartItems([]);
      alert("Payment successful!");
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === "stripe") {
      handleStripePayment();
    } else if (paymentMethod === "crypto") {
      payWithCrypto();
    }
  };

  return (
    <div className="page_content">
      <div className="checkout_main">
        <div className="title">
          <h1>Checkout</h1>
        </div>

        <div className="container">
          <div className="left">
            <form onSubmit={handleSubmit}>
              <h2 className="section_title">Personal Details</h2>
              <div className="section">
                <div className="group">
                  <div className="input_field">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="input_field">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="input_field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <h2 className="section_title">Billing Address</h2>
              <div className="section">
                <div className="input_field">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="group">
                  <div className="input_field">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="input_field">
                    <label>Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <h2 className="section_title">Payment Method</h2>
              <div className="payment_method_selector">
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === "stripe"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Credit/Debit Card
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="crypto"
                    checked={paymentMethod === "crypto"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Cryptocurrency
                </label>
              </div>

              {paymentMethod === "stripe" && (
                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    ref={paymentFormRef}
                    amount={Math.round(parseFloat(calculateTotal()) * 100)}
                    handleStripePayment={handleStripePayment}
                    loading={loading}
                  />
                </Elements>
              )}

              {paymentMethod === "crypto" && (
                <button
                  type="button"
                  className="btn crypto_payment_btn"
                  onClick={payWithCrypto}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Pay with Crypto"}
                </button>
              )}
            </form>
          </div>

          <div className="right">
            <div className="order_details">
              <h2>Order Details</h2>
              <div className="order_list">
                {cartItems.map((item, index) => (
                  <div className="order_item" key={index}>
                    <div className="item_image">
                      {item.thumbs && item.thumbs.length > 0 ? (
                        <img src={item.thumbs[0]} alt={item.name} />
                      ) : item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="placeholder">No Image</div>
                      )}
                    </div>
                    <div className="item_details">
                      <div className="item_name">{item.name}</div>
                      <div className="item_quantity">Quantity: 1</div>
                    </div>
                    <div className="item_price">
                      <span className="original_price">${item.price}</span>
                      {item.discount > 0 && (
                        <span className="discount_percentage">
                          {item.discount}% off
                        </span>
                      )}
                      <span className="final_price">
                        $
                        {(() => {
                          const price = Number(item.price) || 0;
                          const discount = Number(item.discount ?? 0) || 0;
                          const final = Math.max(0, price - (price * discount) / 100);
                          return final.toFixed(2);
                        })()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order_total">
                <div className="row">
                  <span>Sub Total:</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="row">
                  <span>Tax (3%):</span>
                  <span>${(calculateTotal() * 0.03).toFixed(2)}</span>
                </div>
                <div className="row total_amount">
                  <span>Total Amount:</span>
                  <span>${(calculateTotal() * 1.03).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StripePaymentForm = ({ amount, handleStripePayment, loading }) => {
  const stripe = useStripe();
  const elements = useElements();

  const confirmPayment = async (clientSecret) => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    return await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleStripePayment();
      }}
    >
      <div className="stripe_card_element">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn stripe_payment_btn"
      >
        {loading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
      </button>
    </form>
  );
};

StripePaymentForm.propTypes = {
  amount: PropTypes.number.isRequired,
  handleStripePayment: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default Checkout;
