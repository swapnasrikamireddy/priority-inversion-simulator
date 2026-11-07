const { executeSimulation } = require('../services/schedulingEngine');
const { validateInput } = require('../services/validationService');

async function runSimulation(req, res, next) {
  try {
    const { processes } = req.body;

    // Validate input
    const validationError = validateInput(processes);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Execute the mathematically correct scheduling engine
    const simResult = executeSimulation(processes);

    return res.json({
      success: true,
      data: {
        withoutPI: simResult.withoutPI,
        withPI: simResult.withPI,
        metrics: simResult.metrics
      },
      rawOutput: simResult.rawOutput
    });
  } catch (err) {
    console.error('Simulation error:', err);
    return next(err);
  }
}

module.exports = { runSimulation };
