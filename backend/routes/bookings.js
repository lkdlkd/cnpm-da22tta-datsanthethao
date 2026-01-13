const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// User routes
router.post('/', authenticate, bookingController.createBooking);
router.get('/my-bookings', authenticate, bookingController.getUserBookings);
router.get('/:id', authenticate, bookingController.getBookingById);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

// Admin routes
router.get('/', authenticate, authorize(['admin', 'staff']), bookingController.getAllBookings);
router.put('/:id/confirm', authenticate, authorize(['admin', 'staff']), bookingController.confirmBooking);

module.exports = router;
