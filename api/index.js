// API root endpoint  
module.exports = (req, res) => {
  res.status(200).json({
    message: 'TripMaker API',
    version: '2.0.0',
    docs: '/api-docs',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout'
      },
      trips: {
        plan: 'POST /api/trips/plan'
      },
      user: {
        profile: 'GET /api/user/profile',
        updateProfile: 'PUT /api/user/profile'
      }
    }
  });
};
