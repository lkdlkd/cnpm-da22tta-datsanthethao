const express = require('express');
const { register, login } = require('../controllers/UserControllers');

const router = express.Router();

// Endpoint đăng ký
router.post('/register', register);

// Endpoint đăng nhập
router.post('/login', login);

module.exports = router;