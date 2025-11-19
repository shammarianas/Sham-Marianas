import { useState, useEffect, useCallback } from "react";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useUser } from "../Context/UserProvider";
import { useLocation, useNavigate } from "react-router-dom";

// STRIPE IMPORTS
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const Checkout = () => {
  const { currentUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [cartItems, setCartItems] = useState([]);
  const [subscriptionItem, setSubscriptionItem] = useState(null);
  const [isSubscription, setIsSubscription] = useState(false);
  const [freeTrial, setFreeTrial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [cardName, setCardName] = useState("");

  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  useEffect(() => {
    const pendingSubscription = localStorage.getItem("pendingSubscription");
    if (pendingSubscription) {
      const subscriptionData = JSON.parse(pendingSubscription);
      setSubscriptionItem(subscriptionData);
      setIsSubscription(true);
      if (currentUser?.email) {
        setPersonalInfo((prev) => ({
          ...prev,
          email: currentUser.email,
          firstName: currentUser.displayName?.split(" ")[0] || "",
          lastName: currentUser.displayName?.split(" ")[1] || "",
        }));
      }
    }

    if (location.state?.freeTrial) {
      setFreeTrial(true);
      setIsSubscription(true);
    }

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, [currentUser, location.state]);

  const calculateTotal = useCallback(() => {
    if (isSubscription) {
      if (freeTrial) return 0;
      return subscriptionItem?.price || 0;
    }

    const totalNum = cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const discount = Number(item.discount ?? 0) || 0;
      const final = Math.max(0, price - (price * discount) / 100);
      return total + final;
    }, 0);
    return totalNum.toFixed(2);
  }, [cartItems, isSubscription, subscriptionItem, freeTrial]);

  const updateUserSubscription = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, "Profiles", currentUser.uid);
      await updateDoc(userRef, {
        subscription: {
          plan: subscriptionItem?.name || "pro",
          billingCycle: subscriptionItem?.billingCycle || "monthly",
          status: freeTrial ? "trial" : "active",
          startDate: new Date().toISOString(),
          trialEnd: freeTrial
            ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        },
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  };

  const handlePersonalInfoChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleBillingAddressChange = (e) => {
    setBillingAddress({ ...billingAddress, [e.target.name]: e.target.value });
  };

  // MAIN FIX YAHAN HAI — TERA PURA handleSubmit FIXED!
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      alert("Stripe is not loaded yet.");
      return;
    }

    setLoading(true);

    if (freeTrial) {
      await updateUserSubscription();
      localStorage.removeItem("pendingSubscription");
      navigate("/stock", {
        state: { message: "Free trial started successfully!", type: "trial" },
      });
      setLoading(false);
      return;
    }

    try {
      const totalAmount = parseFloat(calculateTotal()) * 1.03;

      const response = await fetch(
        "https://us-central1-sham-marianas.cloudfunctions.net/createPaymentIntent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalAmount }),
        }
      );

      if (!response.ok) throw new Error("Failed to create payment intent");

      const { clientSecret } = await response.json();

      // YE HAI STRIPE KA SAHI TARIKA ALAG FIELDS KE LIYE
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: {
              name: cardName,
              email: personalInfo.email,
              address: {
                line1: billingAddress.address || "N/A",
                city: billingAddress.city || "N/A",
                state: billingAddress.state || "N/A",
                postal_code: billingAddress.zipCode || "00000",
                country:
                  billingAddress.country === "United States" ? "US" : "IN",
              },
            },
          },
        }
      );

      if (error) {
        alert(error.message || "Payment failed");
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        if (isSubscription) {
          await updateUserSubscription();
          localStorage.removeItem("pendingSubscription");
        }

        navigate("/success", {
          state: {
            message: "Payment successful!",
            type: isSubscription ? "subscription" : "purchase",
          },
        });
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  const getOrderTitle = () => {
    if (isSubscription)
      return freeTrial ? "Start Your Free Trial" : "Complete Your Subscription";
    return "Complete Your Purchase";
  };

  const steps = [
    { number: 1, title: "Personal Info", icon: "user" },
    { number: 2, title: "Billing Address", icon: "map-marker-alt" },
    { number: 3, title: "Payment", icon: "credit-card" },
  ];

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "India",
  ];

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <div className="header-content">
            <h1>{getOrderTitle()}</h1>
            <p>Secure checkout with enterprise-grade security</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div key={step.number} className="step-container">
              <div
                className={`step ${activeStep >= step.number ? "active" : ""}`}
              >
                <div className="step-icon">
                  <i className={`fas fa-${step.icon}`}></i>
                </div>
                <div className="step-content">
                  <div className="step-number">Step {step.number}</div>
                  <div className="step-title">{step.title}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`step-connector ${
                    activeStep > step.number ? "active" : ""
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div className="checkout-content">
          <div className="form-section">
            <form onSubmit={handleSubmit}>
              {/* Step 1 & 2 - Bilkul Same */}
              {activeStep === 1 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h2>
                      <i className="fas fa-user"></i> Personal Information
                    </h2>
                    <p>Tell us about yourself</p>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={personalInfo.firstName}
                        onChange={handlePersonalInfoChange}
                        className="form-input"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={personalInfo.lastName}
                        onChange={handlePersonalInfoChange}
                        className="form-input"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={personalInfo.email}
                        onChange={handlePersonalInfoChange}
                        className="form-input"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={personalInfo.phone}
                        onChange={handlePersonalInfoChange}
                        className="form-input"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate(-1)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={nextStep}
                    >
                      Continue to Billing
                    </button>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h2>
                      <i className="fas fa-map-marker-alt"></i> Billing Address
                    </h2>
                    <p>Where should we send your receipt?</p>
                  </div>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">Street Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={billingAddress.address}
                        onChange={handleBillingAddressChange}
                        className="form-input"
                        placeholder="123 Main Street"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={billingAddress.city}
                        onChange={handleBillingAddressChange}
                        className="form-input"
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={billingAddress.state}
                        onChange={handleBillingAddressChange}
                        className="form-input"
                        placeholder="NY"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ZIP Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={billingAddress.zipCode}
                        onChange={handleBillingAddressChange}
                        className="form-input"
                        placeholder="10001"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country *</label>
                      <select
                        name="country"
                        value={billingAddress.country}
                        onChange={handleBillingAddressChange}
                        className="form-input"
                        required
                      >
                        {countries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={prevStep}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={nextStep}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment - UI 100% SAME, PAYMENT WORKING */}
              {activeStep === 3 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h2>
                      <i className="fas fa-credit-card"></i> Payment Information
                    </h2>
                    <p>Enter your card details securely</p>
                  </div>

                  <div className="payment-section">
                    <div className="payment-method-header">
                      <div className="payment-method-icon">
                        <i className="fab fa-cc-stripe"></i>
                      </div>
                      <div className="payment-method-info">
                        <h3>Credit/Debit Card</h3>
                        <p>Pay securely with Stripe</p>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label className="form-label">Card Number *</label>
                        <div className="input-with-icon">
                          <div className="stripe-input">
                            <CardNumberElement
                              options={{
                                style: {
                                  base: {
                                    fontSize: "18px",
                                    color: "#424770",
                                    "::placeholder": { color: "#aab7c4" },
                                  },
                                },
                              }}
                            />
                          </div>
                          <i className="fas fa-credit-card input-icon"></i>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Expiry Date *</label>
                        <div className="stripe-input">
                          <CardExpiryElement
                            options={{
                              style: {
                                base: { fontSize: "18px", color: "#424770" },
                              },
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">CVV *</label>
                        <div className="input-with-icon">
                          <div className="stripe-input">
                            <CardCvcElement
                              options={{
                                style: {
                                  base: { fontSize: "18px", color: "#424770" },
                                },
                              }}
                            />
                          </div>
                          <i className="fas fa-lock input-icon"></i>
                        </div>
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">Name on Card *</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="form-input"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>

                    <div className="security-notice">
                      <i className="fas fa-shield-alt"></i>
                      <span>
                        Your payment information is encrypted and secure
                      </span>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={prevStep}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className={`btn btn-primary ${loading ? "loading" : ""}`}
                      disabled={loading || !cardName}
                      style={{
                        position: "relative",
                        minHeight: "56px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        overflow: "hidden",
                      }}
                    >
                      {/* Default Text */}
                      {!loading && (
                        <span>
                          {freeTrial
                            ? "Start Free Trial"
                            : `Pay $${(calculateTotal() * 1.03).toFixed(2)}`}
                        </span>
                      )}

                      {/* Processing Text + Spinner */}
                      {loading && (
                        <>
                          <div
                            className="spinner"
                            style={{
                              width: "20px",
                              height: "20px",
                              border: "2px solid transparent",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                            }}
                          ></div>
                          <span>Processing...</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary - Bilkul Same */}
          <div className="order-summary">
            <div className="summary-card">
              <div className="summary-header">
                <h3>Order Summary</h3>
                <div className="order-type-badge">
                  {isSubscription ? "SUBSCRIPTION" : "PURCHASE"}
                </div>
              </div>

              <div className="order-items">
                {isSubscription ? (
                  <div className="subscription-item">
                    <div className="item-icon">
                      <i className="fas fa-crown"></i>
                    </div>
                    <div className="item-details">
                      <h4>
                        {freeTrial ? "Pro Plan Trial" : subscriptionItem?.name}
                      </h4>
                      <p>
                        {freeTrial
                          ? "14 days free trial"
                          : `${subscriptionItem?.billingCycle} billing`}
                      </p>
                      {freeTrial && (
                        <div className="trial-note">
                          ${subscriptionItem?.price}/month after trial
                        </div>
                      )}
                    </div>
                    <div className="item-price">
                      {freeTrial ? "FREE" : `$${subscriptionItem?.price}`}
                    </div>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <div className="order-item" key={index}>
                      <div className="item-image">
                        {item.thumbs?.[0] ? (
                          <img src={item.thumbs[0]} alt={item.name} />
                        ) : item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="image-placeholder">
                            <i className="fas fa-box"></i>
                          </div>
                        )}
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>License: Commercial</p>
                      </div>
                      <div className="item-price">
                        {item.discount > 0 && (
                          <span className="original-price">${item.price}</span>
                        )}
                        <span className="final-price">
                          $
                          {(
                            Number(item.price) -
                            (Number(item.price) * Number(item.discount || 0)) /
                              100
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="total-row">
                  <span>Tax</span>
                  <span>${(calculateTotal() * 0.03).toFixed(2)}</span>
                </div>
                {freeTrial && (
                  <div className="total-row discount">
                    <span>Free Trial Discount</span>
                    <span>-${calculateTotal()}</span>
                  </div>
                )}
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>
                    {freeTrial
                      ? "FREE"
                      : `$${(calculateTotal() * 1.03).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {freeTrial && (
                <div className="trial-disclaimer">
                  <i className="fas fa-info-circle"></i>
                  <p>
                    No charges today. Your trial starts immediately and you can
                    cancel anytime.
                  </p>
                </div>
              )}

              <div className="security-features">
                <div className="security-feature">
                  <i className="fas fa-shield-check"></i>
                  <span>SSL Secure Payment</span>
                </div>
                <div className="security-feature">
                  <i className="fas fa-lock"></i>
                  <span>256-bit Encryption</span>
                </div>
                <div className="security-feature">
                  <i className="fas fa-check-circle"></i>
                  <span>PCI Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
