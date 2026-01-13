const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// User routes
router.get('/', authenticate, notificationController.getUserNotifications);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);

// Admin routes
router.post('/', authenticate, authorize(['admin']), notificationController.createNotification);

module.exports = router;
