import connectDB from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    
    // Test environment variables
    const envCheck = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    };

    // Test database connection
    await connectDB();
    
    const endTime = Date.now();
    const connectionTime = endTime - startTime;

    res.status(200).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      connectionTime: `${connectionTime}ms`,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
