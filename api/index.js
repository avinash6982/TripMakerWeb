// Simple handler without loading backend
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API index handler working',
    url: req.url,
    method: req.method
  });
};
