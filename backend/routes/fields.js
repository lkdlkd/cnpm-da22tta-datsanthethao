const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', fieldController.getAllFields);
router.get('/popular', fieldController.getPopularFields);
router.get('/:id', fieldController.getFieldById);

// Seed route (dev only - nên xóa ở production)
router.post('/seed', fieldController.seedFields);

// Admin routes
router.post('/', authenticate, authorize(['admin']), fieldController.createField);
router.put('/:id', authenticate, authorize(['admin']), fieldController.updateField);
router.delete('/:id', authenticate, authorize(['admin']), fieldController.deleteField);

// Image upload routes
router.post('/:id/images', authenticate, authorize(['admin']), upload.array('images', 10), fieldController.uploadFieldImages);
router.delete('/:id/images', authenticate, authorize(['admin']), fieldController.deleteFieldImage);
router.put('/:id/images/reorder', authenticate, authorize(['admin']), fieldController.updateFieldImagesOrder);

module.exports = router;
