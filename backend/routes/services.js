const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/stats', authenticate, authorize(['admin']), serviceController.getServicesStats);
router.get('/category/:category', serviceController.getServicesByCategory);

// Admin routes
router.post('/', authenticate, authorize(['admin']), serviceController.createService);
router.put('/:id', authenticate, authorize(['admin']), serviceController.updateService);
router.put('/:id/stock', authenticate, authorize(['admin']), serviceController.updateStock);
router.delete('/:id', authenticate, authorize(['admin']), serviceController.deleteService);

module.exports = router;
