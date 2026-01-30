const { buildTripPlan } = require('../lib/tripPlanner');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { destination, days, pace, seed } = req.body || {};

    if (!destination || !String(destination).trim()) {
      return res.status(400).json({ error: 'Destination is required.' });
    }

    if (days !== undefined) {
      const parsedDays = Number(days);
      if (!Number.isFinite(parsedDays) || parsedDays < 1 || parsedDays > 10) {
        return res.status(400).json({ error: 'Days must be between 1 and 10.' });
      }
    }

    if (seed !== undefined && !Number.isFinite(Number(seed))) {
      return res.status(400).json({ error: 'Seed must be a number.' });
    }

    const plan = buildTripPlan({ destination, days, pace, seed });
    return res.status(200).json(plan);
  } catch (error) {
    console.error('Trip plan error:', error);
    return res.status(500).json({
      error: 'Trip plan generation failed',
      message: error.message,
    });
  }
};
