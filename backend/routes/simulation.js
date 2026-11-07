const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

router.post('/run', simulationController.runSimulation);

module.exports = router;
