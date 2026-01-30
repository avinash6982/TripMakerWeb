//Test simple response
module.exports = (req, res) => {
  return res.status(200).json({ test: 'working', path: req.url });
};
