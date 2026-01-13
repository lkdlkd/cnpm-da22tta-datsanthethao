const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);

// Admin routes
router.get('/users', authenticate, authorize(['admin']), authController.getAllUsers);
router.put('/users/:id', authenticate, authorize(['admin']), authController.updateUserByAdmin);
router.delete('/users/:id', authenticate, authorize(['admin']), authController.deleteUser);

module.exports = router;
