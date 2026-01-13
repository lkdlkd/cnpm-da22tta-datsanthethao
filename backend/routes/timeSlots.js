const express = require('express');
const router = express.Router();
const timeSlotController = require('../controllers/timeSlotController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.get('/field/:fieldId', timeSlotController.getTimeSlotsByFieldAndDate);

// Admin routes
router.post('/', authenticate, authorize(['admin']), timeSlotController.createTimeSlot);
router.post('/generate', authenticate, authorize(['admin']), timeSlotController.generateTimeSlots);
router.put('/:id', authenticate, authorize(['admin']), timeSlotController.updateTimeSlot);
router.delete('/:id', authenticate, authorize(['admin']), timeSlotController.deleteTimeSlot);

module.exports = router;
