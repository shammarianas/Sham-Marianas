export default function handler(req, res) {
    // Check if the request method is GET
    if (req.method === 'GET') {
      // Respond with a JSON object
      res.status(200).json({
        message: 'This is a test GET API!',
        timestamp: new Date().toISOString(),
      });
    } else {
      // Handle other HTTP methods
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }