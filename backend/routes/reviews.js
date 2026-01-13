const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.get('/field/:fieldId', reviewController.getReviewsByField);

// User routes
router.post('/', authenticate, reviewController.createReview);
router.get('/my-reviews', authenticate, reviewController.getUserReviews);
router.delete('/:id', authenticate, reviewController.deleteReview);

// Admin routes
router.get('/', authenticate, authorize(['admin']), reviewController.getAllReviews);
router.put('/:id/reply', authenticate, authorize(['admin']), reviewController.replyToReview);

module.exports = router;
