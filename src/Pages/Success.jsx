//frontend verification
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserProvider";
import { db } from '../../firebase'
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { loadStripe } from "@stripe/stripe-js";


const Success = () => {
    const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const { currentUser } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [purchasedItems, setPurchasedItems] = useState([]);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId || !currentUser?.uid) {
        navigate('/cart');
        return;
      }

      try {
        const res = await fetch(`/api/verify-payment?session_id=${encodeURIComponent(sessionId)}&uid=${encodeURIComponent(currentUser.uid)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed');

        // Clear cart on success
        localStorage.removeItem('cart');
        setStatus('success');
      } catch (error) {
        console.error('Payment verification failed:', error);
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [searchParams, currentUser, navigate]);

  if (status === "processing") {
    return (
      <div className="page_content">
        <div className="cart_main">
          <h1>Processing Your Payment...</h1>
          <p>Please wait while we verify your purchase.</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="page_content">
        <div className="cart_main error">
          <h1>Payment Verification Failed</h1>
          <p>There was an issue verifying your payment.</p>
          <button onClick={() => navigate('/cart')} className="back_button">
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page_content">
      <div className="cart_main success">
        <h1>Payment Successful!</h1>
        <div className="purchased-items">
          <h3>{`You've purchased`}:</h3>
          <ul>
            {purchasedItems.map(item => (
              <li key={item.id}>
                <strong>{item.title}</strong> (${item.price})
                {item.type === 'images' && (
                  <button 
                    onClick={() => navigate(`/download/${item.id}`)}
                    className="download-btn"
                  >
                    Download
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="action-buttons">
          <button onClick={() => navigate('/library')} className="view-library">
            View Your Library
          </button>
          <button onClick={() => navigate('/products')} className="continue-shopping">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;


//backend verification
// import { useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { useUser } from "../Context/UserProvider";

// const Success = () => {
//   const { currentUser } = useUser();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleSuccess = async () => {
//       const sessionId = searchParams.get("session_id");
//       if (!sessionId) {
//         navigate('/cart');
//         return;
//       }

//       try {
//         // Verify payment and save purchases
//         const response = await fetch(`/api/verify-payment?session_id=${sessionId}&uid=${currentUser?.uid}`);
//         const data = await response.json();

//         if (response.ok) {
//           // Clear cart from local storage
//           localStorage.removeItem("cart");
          
//           // Redirect to library or orders page
//           navigate('/library');
//         } else {
//           throw new Error(data.error || "Payment verification failed");
//         }
//       } catch (error) {
//         console.error("Error:", error);
//         navigate('/cart');
//       }
//     };

//     handleSuccess();
//   }, [searchParams, currentUser, navigate]);

//   // Simple loading state while processing
//   return (
//     <div className="page_content">
//       <div className="cart_main">
//         <div className="title">
//           <h1>Processing Your Order...</h1>
//         </div>
//         <p>Please wait while we confirm your purchase.</p>
//       </div>
//     </div>
//   );
// };

// export default Success;
