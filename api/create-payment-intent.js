// api/create-payment-intent.js
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const { amount, currency, userId, cartItems } = req.body;

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      metadata: {
        userId: userId || 'guest',
        cartItems: JSON.stringify(cartItems || [])
      },
      // Optional: add more configuration like payment method types
      payment_method_types: ['card'],
    });

    // Return the client secret
    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (err) {
    console.error('Payment Intent Error:', err);
    res.status(500).json({ 
      error: err.message,
      details: 'Failed to create payment intent' 
    });
  }
}
