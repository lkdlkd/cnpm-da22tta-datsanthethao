const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// User routes
router.get('/booking/:bookingId', authenticate, paymentController.getPaymentByBooking);

// Payment gateway callback
router.post('/callback', paymentController.handlePaymentCallback);

// Admin routes
router.put('/:id/confirm-cash', authenticate, authorize(['admin', 'staff']), paymentController.confirmCashPayment);

module.exports = router;
