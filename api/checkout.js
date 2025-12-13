import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { items, userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items selected" });
    }

    const lineItems = items.map((item) => {
      const productData = { 
        name: item.title,
        description: item.description || undefined,
      };
      
      if (item.thumbnail) {
        productData.images = [item.thumbnail];
      }
    
      const price = item.discount 
        ? item.price - (item.price * item.discount / 100)
        : item.price;
    
      return {
        price_data: {
          currency: "usd",
          product_data: productData,
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      };
    });

    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/#/templates?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#/templates`,
      metadata: { 
        userId: userId || 'guest',
        items: JSON.stringify(items.map(item => item.id)),
        itemsData: JSON.stringify(items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          discount: item.discount,
          type: item.type
        })))
      },
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ 
      error: error.message || "Internal Server Error" 
    });
  }
}