const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');



// GET /api/revenue/stats - Lấy thống kê tổng quan
router.get('/stats', authenticate, authorize('admin'), revenueController.getRevenueStats);

// GET /api/revenue/daily - Lấy thống kê theo ngày
router.get('/daily', authenticate, authorize('admin'), revenueController.getDailyRevenue);

// GET /api/revenue/top-fields - Lấy top sân
router.get('/top-fields', authenticate, authorize('admin'), revenueController.getTopFields);

module.exports = router;
