// Simple test to verify /api/index works
module.exports = (req, res) => {
  res.status(200).json({ 
    message: '/api/index is working!',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};
