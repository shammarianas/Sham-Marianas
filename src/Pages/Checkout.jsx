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

  // آپ کے Checkout.js میں line 115 کے قریب
  const updateUserSubscription = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, "Profiles", currentUser.uid);
      const pendingSub = JSON.parse(
        localStorage.getItem("pendingSubscription") || "{}"
      );

      // بس status اور basic info update کریں
      const basicUpdate = {
        subscription: {
          status: freeTrial ? "trial" : "active",
          startDate: new Date().toISOString(),
          // Webhook باقی details fill کرے گا
        },
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userRef, basicUpdate);

      console.log("✅ Basic subscription status updated");
    } catch (error) {
      console.error("Error updating subscription:", error);
      // Ignore error - webhook will handle
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

    // 🆕 ADD: Payment processing state کو localStorage میں save کریں
    localStorage.setItem("paymentProcessing", "true");

    if (freeTrial) {
      await updateUserSubscription();
      localStorage.removeItem("pendingSubscription");
      localStorage.removeItem("paymentProcessing"); // 🆕 CLEAR
      navigate("/stock", {
        state: { message: "Free trial started successfully!", type: "trial" },
      });
      setLoading(false);
      return;
    }

    try {
      const totalAmount = parseFloat(calculateTotal()) * 1.03;

      // ============ FIXED METADATA LOGIC ============
      let metadata = {
        userId: currentUser?.uid || "guest",
        timestamp: new Date().toISOString(), // 🆕 ADD: Timestamp for tracking
      };

      // 1. INDIVIDUAL vs TEAM SUBSCRIPTION IDENTIFICATION
      if (isSubscription) {
        // 🆕 IMPROVED: localStorage سے direct data لینا
        const pendingSub = JSON.parse(
          localStorage.getItem("pendingSubscription") || "{}"
        );

        // 🆕 BETTER DETECTION: Multiple ways to detect team plan
        const isTeamPlan =
          pendingSub?.isTeamPlan ||
          pendingSub?.plan === "team" ||
          pendingSub?.name?.toLowerCase().includes("team") ||
          subscriptionItem?.name?.toLowerCase().includes("team");

        const teamSize = isTeamPlan
          ? pendingSub?.teamMembers || subscriptionItem?.teamMembers || 2
          : 1;

        metadata = {
          ...metadata,
          plan: isTeamPlan ? "team" : "individual", // "individual" OR "team"
          type: isTeamPlan ? "team" : "individual", // same for webhook
          teamSize: teamSize,
          billingCycle:
            pendingSub?.billingCycle ||
            subscriptionItem?.billingCycle ||
            "monthly",
          subscriptionName:
            pendingSub?.name || subscriptionItem?.name || "Individual Plan",
          subscriptionId: pendingSub?.id, // 🆕 ADD: Subscription ID for tracking
        };
      }
      // 2. SINGLE ASSET PURCHASE
      else if (cartItems.length > 0) {
        metadata = {
          ...metadata,
          assetId: cartItems[0]?.id || cartItems[0]?.assetId,
          assetName: cartItems[0]?.name || "Asset Purchase",
          assetType: "single_purchase",
          cartItemsCount: cartItems.length, // 🆕 ADD: Total items in cart
        };
      }

      console.log("📦 Sending metadata to Stripe:", metadata); // Debug log

      // 🆕 ADD: Retry logic for network issues
      let response;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          response = await fetch(
            "https://us-central1-sham-marianas.cloudfunctions.net/createPaymentIntent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Request-ID": `req_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`, // 🆕 ADD: Request ID
              },
              body: JSON.stringify({
                amount: totalAmount,
                metadata: metadata,
              }),
            }
          );
          break; // Success, exit loop
        } catch (fetchError) {
          retryCount++;
          if (retryCount > maxRetries) throw fetchError;
          console.log(`Retrying fetch (${retryCount}/${maxRetries})...`);
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          ); // Exponential backoff
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Payment intent error response:", errorText);
        throw new Error(`Failed to create payment intent: ${response.status}`);
      }

      const { clientSecret, paymentIntentId } = await response.json(); // 🆕 ADD: paymentIntentId اگر server سے آئے

      if (!clientSecret) {
        throw new Error("No client secret received from server");
      }

      // 🆕 ADD: Save payment intent ID for recovery
      localStorage.setItem(
        "lastPaymentIntent",
        JSON.stringify({
          id: paymentIntentId || "pending",
          amount: totalAmount,
          metadata: metadata,
          timestamp: new Date().toISOString(),
        })
      );

      // STRIPE PAYMENT CONFIRMATION
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: {
              name:
                cardName ||
                personalInfo.firstName + " " + personalInfo.lastName ||
                "Customer",
              email:
                personalInfo.email || currentUser?.email || "guest@example.com",
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
          // 🆕 ADD: Return URL اگر payment fail ہو
          return_url: window.location.origin + "/checkout?payment_restart=true",
        }
      );

      if (error) {
        console.error("Stripe error:", error);

        // 🆕 IMPROVED: Specific error handling
        if (error.type === "card_error") {
          alert(
            `Card error: ${error.message}. Please check your card details.`
          );
        } else if (error.type === "validation_error") {
          alert("Please fill in all required fields correctly.");
        } else {
          alert("Payment failed. Please try again.");
        }

        localStorage.removeItem("paymentProcessing");
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        console.log("✅ Payment succeeded! PaymentIntent:", paymentIntent.id);

        // 🆕 ADD: Payment success کو localStorage میں save کریں
        localStorage.setItem(
          "lastSuccessfulPayment",
          JSON.stringify({
            id: paymentIntent.id,
            amount: totalAmount,
            type: isSubscription ? "subscription" : "purchase",
            timestamp: new Date().toISOString(),
          })
        );

        // Update subscription in Firestore
        if (isSubscription) {
          await updateUserSubscription();
          localStorage.removeItem("pendingSubscription");
        }

        // Clear cart if it was a purchase
        if (!isSubscription && cartItems.length > 0) {
          localStorage.removeItem("cart");
        }

        // 🆕 CLEAR: Processing states
        localStorage.removeItem("paymentProcessing");
        localStorage.removeItem("lastPaymentIntent");

        navigate("/success", {
          state: {
            message: "Payment successful!",
            type: isSubscription ? "subscription" : "purchase",
            paymentId: paymentIntent.id,
            amount: totalAmount,
            metadata: metadata, // 🆕 ADD: Metadata بھیجنے کے لیے
          },
          replace: true, // 🆕 ADD: Browser history میں replace کریں
        });
      } else {
        // 🆕 IMPROVED: Other statuses handling
        const statusMessages = {
          processing: "Your payment is processing. Please wait...",
          requires_action:
            "Additional action required. Please complete authentication.",
          requires_payment_method: "Please try a different payment method.",
          canceled: "Payment was canceled.",
        };

        alert(
          statusMessages[paymentIntent.status] ||
            `Payment status: ${paymentIntent.status}`
        );

        // 🆕 اگر processing ہے تو user کو inform کریں
        if (paymentIntent.status === "processing") {
          localStorage.setItem("pendingPaymentCheck", paymentIntent.id);
        }

        localStorage.removeItem("paymentProcessing");
        setLoading(false);
      }
    } catch (err) {
      console.error("Payment Error:", err);

      // 🆕 IMPROVED: Network error detection
      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError")
      ) {
        alert(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        alert("Payment failed: " + (err.message || "Please try again."));
      }

      localStorage.removeItem("paymentProcessing");
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

  // Progress steps similar to ContributorLogin
  const renderProgressSteps = () => (
    <div
      className="progress-steps"
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "2rem",
        padding: "0 1rem",
      }}
    >
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: activeStep >= step ? "#52b0b4" : "#181818",
              color: activeStep >= step ? "#0f0f0f" : "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              border:
                activeStep === step ? "2px solid #52b0b4" : "2px solid #181818",
            }}
          >
            {step}
          </div>
          <span
            style={{
              fontSize: "0.8rem",
              marginTop: "0.5rem",
              color: activeStep >= step ? "#f5f5f5" : "#666",
              textAlign: "center",
            }}
          >
            {step === 1 && "Personal Info"}
            {step === 2 && "Billing Address"}
            {step === 3 && "Payment"}
          </span>
        </div>
      ))}
    </div>
  );

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
    <div className="checkout-page" style={{ padding: "2rem" }}>
      <div
        className="checkout-container"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Header */}
        <div
          className="checkout-header"
          style={{ textAlign: "center", marginBottom: "2rem" }}
        >
          <div className="header-content">
            <h1 style={{ color: "#f5f5f5", marginBottom: "0.5rem" }}>
              {getOrderTitle()}
            </h1>
            <p style={{ color: "#999" }}>
              Secure checkout with enterprise-grade security
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        {renderProgressSteps()}

        <div
          className="checkout-content"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 350px",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Left Side: Form Section */}
          <div
            className="form-section"
            style={{
              backgroundColor: "#0f0f0f",
              borderRadius: "8px",
              padding: "2rem",
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* ========== STEP 1: PERSONAL INFORMATION ========== */}
              {activeStep === 1 && (
                <div className="form-step active">
                  <div
                    className="step-header"
                    style={{ marginBottom: "1.5rem" }}
                  >
                    <h2
                      style={{
                        color: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <i
                        className="fas fa-user"
                        style={{ color: "#52b0b4" }}
                      ></i>{" "}
                      Personal Information
                    </h2>
                    <p style={{ color: "#999" }}>Tell us about yourself</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-row-1 mb-0">
                      <div
                        className="width-50"
                        style={{ paddingRight: "0.5rem" }}
                      >
                        <label
                          htmlFor="firstName"
                          className="mb-2"
                          style={{
                            display: "block",
                            color: "#f5f5f5",
                            marginBottom: "0.5rem",
                          }}
                        >
                          First Name *
                        </label>
                        <div className="input">
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={personalInfo.firstName}
                            onChange={handlePersonalInfoChange}
                            placeholder="John"
                            required
                            style={{
                              width: "100%",
                              padding: "12px",
                              backgroundColor: "#181818",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "4px",
                              color: "#f5f5f5",
                              fontSize: "14px",
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className="width-50"
                        style={{ paddingLeft: "0.5rem" }}
                      >
                        <label
                          htmlFor="lastName"
                          className="mb-2"
                          style={{
                            display: "block",
                            color: "#f5f5f5",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Last Name *
                        </label>
                        <div className="input">
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={personalInfo.lastName}
                            onChange={handlePersonalInfoChange}
                            placeholder="Doe"
                            required
                            style={{
                              width: "100%",
                              padding: "12px",
                              backgroundColor: "#181818",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "4px",
                              color: "#f5f5f5",
                              fontSize: "14px",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label
                        htmlFor="email"
                        style={{
                          display: "block",
                          color: "#f5f5f5",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Email Address *
                      </label>
                      <div className="input">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={personalInfo.email}
                          onChange={handlePersonalInfoChange}
                          placeholder="your.email@example.com"
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#181818",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "4px",
                            color: "#f5f5f5",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label
                        htmlFor="phone"
                        style={{
                          display: "block",
                          color: "#f5f5f5",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Phone Number
                      </label>
                      <div className="input">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={personalInfo.phone}
                          onChange={handlePersonalInfoChange}
                          placeholder="+1 (555) 000-0000"
                          style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#181818",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "4px",
                            color: "#f5f5f5",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className="form-actions"
                    style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}
                  >
                    <button
                      type="button"
                      className="login_btn"
                      onClick={() => navigate(-1)}
                      style={{
                        flex: 1,
                        padding: "12px 24px",
                        backgroundColor: "transparent",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "4px",
                        color: "#f5f5f5",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="login_btn"
                      onClick={nextStep}
                      style={{
                        flex: 1,
                        padding: "12px 24px",
                        backgroundColor: "#52b0b4",
                        border: "none",
                        borderRadius: "4px",
                        color: "#0f0f0f",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Continue to Billing
                    </button>
                  </div>
                </div>
              )}

              {/* ========== STEP 2: BILLING ADDRESS ========== */}
              {activeStep === 2 && (
                <div className="form-step active">
                  <div
                    className="step-header"
                    style={{ marginBottom: "1.5rem" }}
                  >
                    <h2
                      style={{
                        color: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <i
                        className="fas fa-map-marker-alt"
                        style={{ color: "#52b0b4" }}
                      ></i>{" "}
                      Billing Address
                    </h2>
                    <p style={{ color: "#999" }}>
                      Where should we send your receipt?
                    </p>
                  </div>

                  <div className="form-grid">
                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label
                        htmlFor="address"
                        style={{
                          display: "block",
                          color: "#f5f5f5",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Street Address *
                      </label>
                      <div className="input">
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={billingAddress.address}
                          onChange={handleBillingAddressChange}
                          placeholder="123 Main Street"
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#181818",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "4px",
                            color: "#f5f5f5",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-row-1 mb-0">
                      <div
                        className="width-50"
                        style={{ paddingRight: "0.5rem" }}
                      >
                        <label
                          htmlFor="city"
                          style={{
                            display: "block",
                            color: "#f5f5f5",
                            marginBottom: "0.5rem",
                          }}
                        >
                          City *
                        </label>
                        <div className="input">
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={billingAddress.city}
                            onChange={handleBillingAddressChange}
                            placeholder="New York"
                            required
                            style={{
                              width: "100%",
                              padding: "12px",
                              backgroundColor: "#181818",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "4px",
                              color: "#f5f5f5",
                              fontSize: "14px",
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className="width-50"
                        style={{ paddingLeft: "0.5rem" }}
                      >
                        <label
                          htmlFor="state"
                          style={{
                            display: "block",
                            color: "#f5f5f5",
                            marginBottom: "0.5rem",
                          }}
                        >
                          State *
                        </label>
                        <div className="input">
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={billingAddress.state}
                            onChange={handleBillingAddressChange}
                            placeholder="NY"
                            required
                            style={{
                              width: "100%",
                              padding: "12px",
                              backgroundColor: "#181818",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "4px",
                              color: "#f5f5f5",
                              fontSize: "14px",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className="form-row-1 mb-0"
                      style={{ marginTop: "1rem" }}
                    >
                      <div
                        className="width-50"
                        style={{ paddingRight: "0.5rem" }}
                      >
                        <label
                          htmlFor="zipCode"
                          style={{
                            display: "block",
                            color: "#f5f5f5",
                            marginBottom: "0.5rem",
                          }}
                        >
                          ZIP Code *
                        </label>
                        <div className="input">
                          <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={billingAddress.zipCode}
                            onChange={handleBillingAddressChange}
                            placeholder="10001"
                            required
                            style={{
                              width: "100%",
                              padding: "12px",
                              backgroundColor: "#181818",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "4px",
                              color: "#f5f5f5",
                              fontSize: "14px",
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className="width-50"
                        style={{ paddingLeft: "0.5rem" }}
                      >
                        <label
                          htmlFor="country"
                          style={{
                            display: "block",
                            color: "#f5f5f5",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Country *
                        </label>
                        <div className="input">
                          <select
                            id="country"
                            name="country"
                            value={billingAddress.country}
                            onChange={handleBillingAddressChange}
                            required
                            style={{
                              width: "100%",
                              padding: "12px",
                              backgroundColor: "#181818",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: "4px",
                              color: "#f5f5f5",
                              fontSize: "14px",
                            }}
                          >
                            {countries.map((country) => (
                              <option key={country} value={country}>
                                {country}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="form-actions"
                    style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}
                  >
                    <button
                      type="button"
                      className="login_btn"
                      onClick={prevStep}
                      style={{
                        flex: 1,
                        padding: "12px 24px",
                        backgroundColor: "transparent",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "4px",
                        color: "#f5f5f5",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="login_btn"
                      onClick={nextStep}
                      style={{
                        flex: 1,
                        padding: "12px 24px",
                        backgroundColor: "#52b0b4",
                        border: "none",
                        borderRadius: "4px",
                        color: "#0f0f0f",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* ========== STEP 3: PAYMENT INFORMATION ========== */}
              {activeStep === 3 && (
                <div className="form-step active">
                  <div
                    className="step-header"
                    style={{ marginBottom: "1.5rem" }}
                  >
                    <h2
                      style={{
                        color: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <i
                        className="fas fa-credit-card"
                        style={{ color: "#52b0b4" }}
                      ></i>{" "}
                      Payment Information
                    </h2>
                    <p style={{ color: "#999" }}>
                      Enter your card details securely
                    </p>
                  </div>

                  <div
                    className="payment-section"
                    style={{ marginBottom: "1.5rem" }}
                  >
                    <div
                      style={{
                        backgroundColor: "rgba(82, 176, 180, 0.1)",
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        marginBottom: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.5rem",
                          color: "#52b0b4",
                        }}
                      >
                        <i className="fab fa-cc-stripe"></i>
                      </div>
                      <div>
                        <h3 style={{ color: "#f5f5f5", margin: 0 }}>
                          Credit/Debit Card
                        </h3>
                        <p
                          style={{ color: "#f5f5f5", opacity: 0.7, margin: 0 }}
                        >
                          Pay securely with Stripe
                        </p>
                      </div>
                    </div>

                    <div
                      className="form-group"
                      style={{ marginBottom: "1rem" }}
                    >
                      <label
                        htmlFor="cardNumber"
                        style={{
                          display: "block",
                          color: "#f5f5f5",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Card Number *
                      </label>
                      <div
                        className="input"
                        style={{
                          position: "relative",
                          width: "100%",
                          backgroundColor: "rgb(24, 24, 24)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "4px",
                          color: "rgb(245, 245, 245)",
                          fontSize: "14px",
                        }}
                      >
                        <div className="stripe-input">
                          <CardNumberElement
                            options={{
                              style: {
                                base: {
                                  fontSize: "16px",
                                  color: "#f5f5f5",
                                  "::placeholder": { color: "#aab7c4" },
                                  backgroundColor: "transparent",
                                },
                              },
                            }}
                          />
                        </div>
                        <i
                          className="fas fa-credit-card"
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#999",
                          }}
                        ></i>
                      </div>
                    </div>

                    <div className="form-row-1 mb-0">
                      <div
                        className="width-50"
                        style={{ paddingRight: "0.5rem" }}
                      >
                        <label
                          htmlFor="expiry"
                          style={{
                            display: "block",
                            color: "#f5f5f5",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Expiry Date *
                        </label>
                        <div
                          className="input"
                          style={{
                            position: "relative",
                            width: "100%",
                            backgroundColor: "rgb(24, 24, 24)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "4px",
                            color: "rgb(245, 245, 245)",
                            fontSize: "14px",
                          }}
                        >
                          <div className="stripe-input">
                            <CardExpiryElement
                              options={{
                                style: {
                                  base: {
                                    fontSize: "16px",
                                    color: "#f5f5f5",
                                    backgroundColor: "transparent",
                                  },
                                },
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className="width-50"
                        style={{ paddingLeft: "0.5rem" }}
                      >
                        <label
                          htmlFor="cvv"
                          style={{
                            display: "block",
                            color: "#f5f5f5",
                            marginBottom: "0.5rem",
                          }}
                        >
                          CVV *
                        </label>
                        <div
                          className="input"
                          style={{
                            position: "relative",
                            width: "100%",
                            backgroundColor: "rgb(24, 24, 24)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "4px",
                            color: "rgb(245, 245, 245)",
                            fontSize: "14px",
                          }}
                        >
                          <div className="stripe-input">
                            <CardCvcElement
                              options={{
                                style: {
                                  base: {
                                    fontSize: "16px",
                                    color: "#f5f5f5",
                                    backgroundColor: "transparent",
                                  },
                                },
                              }}
                            />
                          </div>
                          <i
                            className="fas fa-lock"
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "#999",
                            }}
                          ></i>
                        </div>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: "1rem" }}>
                      <label
                        htmlFor="cardName"
                        style={{
                          display: "block",
                          color: "#f5f5f5",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Name on Card *
                      </label>
                      <div className="input">
                        <input
                          type="text"
                          id="cardName"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="John Doe"
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#181818",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "4px",
                            color: "#f5f5f5",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      className="security-notice"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginTop: "1rem",
                        padding: "0.75rem",
                        backgroundColor: "rgba(82, 176, 180, 0.1)",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <i
                        className="fas fa-shield-alt"
                        style={{ color: "#52b0b4" }}
                      ></i>
                      <span style={{ color: "#f5f5f5", fontSize: "0.9rem" }}>
                        Your payment information is encrypted and secure
                      </span>
                    </div>
                  </div>

                  <div
                    className="form-actions"
                    style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}
                  >
                    <button
                      type="button"
                      className="login_btn"
                      onClick={prevStep}
                      style={{
                        flex: 1,
                        padding: "12px 24px",
                        backgroundColor: "transparent",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "4px",
                        color: "#f5f5f5",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="login_btn"
                      disabled={loading || !cardName}
                      style={{
                        flex: 1,
                        padding: "12px 24px",
                        backgroundColor: "#52b0b4",
                        border: "none",
                        borderRadius: "4px",
                        color: "#0f0f0f",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        opacity: loading || !cardName ? 0.7 : 1,
                        position: "relative",
                        minHeight: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                      }}
                    >
                      {!loading && (
                        <span>
                          {freeTrial
                            ? "Start Free Trial"
                            : `Pay $${(calculateTotal() * 1.03).toFixed(2)}`}
                        </span>
                      )}
                      {loading && (
                        <>
                          <div
                            className="spinner"
                            style={{
                              width: "16px",
                              height: "16px",
                              border: "2px solid transparent",
                              borderTopColor: "#0f0f0f",
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

          {/* Right Side: Order Summary */}
          <div
            className="order-summary"
            style={{
              backgroundColor: "#0f0f0f",
              borderRadius: "8px",
              padding: "1.5rem",
              position: "sticky",
              top: "2rem",
            }}
          >
            <div className="summary-card">
              <div
                className="summary-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  paddingBottom: "1rem",
                }}
              >
                <h3 style={{ color: "#f5f5f5", margin: 0 }}>Order Summary</h3>
                <div
                  style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "#52b0b4",
                    color: "#0f0f0f",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                  }}
                >
                  {isSubscription ? "SUBSCRIPTION" : "PURCHASE"}
                </div>
              </div>

              <div
                className="order-items"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  marginBottom: "1rem",
                }}
              >
                {isSubscription ? (
                  <div
                    className="subscription-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem 0",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.5rem",
                        color: "#52b0b4",
                      }}
                    >
                      <i className="fas fa-crown"></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          color: "#f5f5f5",
                          margin: 0,
                          fontSize: "0.95rem",
                        }}
                      >
                        {freeTrial ? "Pro Plan Trial" : subscriptionItem?.name}
                      </h4>
                      <p
                        style={{
                          color: "#f5f5f5",
                          opacity: 0.7,
                          margin: "0.25rem 0 0 0",
                          fontSize: "0.85rem",
                        }}
                      >
                        {freeTrial
                          ? "14 days free trial"
                          : `${subscriptionItem?.billingCycle} billing`}
                      </p>
                      {freeTrial && (
                        <div
                          style={{
                            color: "#52b0b4",
                            fontSize: "0.85rem",
                            marginTop: "0.25rem",
                          }}
                        >
                          ${subscriptionItem?.price}/month after trial
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        color: "#f5f5f5",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        textAlign: "right",
                      }}
                    >
                      {freeTrial ? "FREE" : `$${subscriptionItem?.price}`}
                    </div>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <div
                      className="order-item"
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem 0",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "4px",
                          overflow: "hidden",
                          backgroundColor: "#292929",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {item.thumbs?.[0] ? (
                          <img
                            src={item.thumbs[0]}
                            alt={item.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              fontSize: "1.5rem",
                              color: "#666",
                            }}
                          >
                            <i className="fas fa-box"></i>
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            color: "#f5f5f5",
                            margin: 0,
                            fontSize: "0.9rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.name}
                        </h4>
                        <p
                          style={{
                            color: "#f5f5f5",
                            opacity: 0.7,
                            margin: "0.25rem 0 0 0",
                            fontSize: "0.8rem",
                          }}
                        >
                          License: Commercial
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {item.discount > 0 && (
                          <div
                            style={{
                              color: "#999",
                              textDecoration: "line-through",
                              fontSize: "0.8rem",
                            }}
                          >
                            ${item.price}
                          </div>
                        )}
                        <div
                          style={{
                            color: "#f5f5f5",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                          }}
                        >
                          $
                          {(
                            Number(item.price) -
                            (Number(item.price) * Number(item.discount || 0)) /
                              100
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="order-totals" style={{ marginTop: "1.5rem" }}>
                <div
                  className="total-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      color: "#f5f5f5",
                      opacity: 0.8,
                      fontSize: "0.9rem",
                    }}
                  >
                    Subtotal
                  </span>
                  <span style={{ color: "#f5f5f5", fontSize: "0.9rem" }}>
                    ${calculateTotal()}
                  </span>
                </div>
                <div
                  className="total-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      color: "#f5f5f5",
                      opacity: 0.8,
                      fontSize: "0.9rem",
                    }}
                  >
                    Tax (3%)
                  </span>
                  <span style={{ color: "#f5f5f5", fontSize: "0.9rem" }}>
                    ${(calculateTotal() * 0.03).toFixed(2)}
                  </span>
                </div>
                {freeTrial && (
                  <div
                    className="total-row discount"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                      color: "#4caf50",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>Free Trial Discount</span>
                    <span>-${calculateTotal()}</span>
                  </div>
                )}
                <div
                  className="total-row grand-total"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span
                    style={{
                      color: "#f5f5f5",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      color: "#f5f5f5",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                    }}
                  >
                    {freeTrial
                      ? "FREE"
                      : `$${(calculateTotal() * 1.03).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {freeTrial && (
                <div
                  className="trial-disclaimer"
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <i
                    className="fas fa-info-circle"
                    style={{ color: "#4caf50", flexShrink: 0 }}
                  ></i>
                  <p
                    style={{
                      color: "#f5f5f5",
                      margin: 0,
                      fontSize: "0.8rem",
                      opacity: 0.9,
                    }}
                  >
                    No charges today. Your trial starts immediately and you can
                    cancel anytime.
                  </p>
                </div>
              )}

              <div
                className="security-features"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  className="security-feature"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    flex: 1,
                  }}
                >
                  <i
                    className="fas fa-shield-check"
                    style={{ color: "#52b0b4", fontSize: "1rem" }}
                  ></i>
                  <span
                    style={{
                      color: "#f5f5f5",
                      fontSize: "0.65rem",
                      textAlign: "center",
                    }}
                  >
                    SSL Secure
                  </span>
                </div>
                <div
                  className="security-feature"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    flex: 1,
                  }}
                >
                  <i
                    className="fas fa-lock"
                    style={{ color: "#52b0b4", fontSize: "1rem" }}
                  ></i>
                  <span
                    style={{
                      color: "#f5f5f5",
                      fontSize: "0.65rem",
                      textAlign: "center",
                    }}
                  >
                    256-bit Encryption
                  </span>
                </div>
                <div
                  className="security-feature"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    flex: 1,
                  }}
                >
                  <i
                    className="fas fa-check-circle"
                    style={{ color: "#52b0b4", fontSize: "1rem" }}
                  ></i>
                  <span
                    style={{
                      color: "#f5f5f5",
                      fontSize: "0.65rem",
                      textAlign: "center",
                    }}
                  >
                    PCI Compliant
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for Stripe inputs */}
      <style jsx="true">{`
        .stripe-input {
          width: 100%;
          padding: 12px;
          background-color: transparent;
          color: #f5f5f5;
        }
        .stripe-input .InputElement {
          color: #f5f5f5 !important;
          background-color: transparent !important;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
