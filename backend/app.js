require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import connectDB
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const YAML = require('yaml');

const app = express();

// Kết nối cơ sở dữ liệu
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware để phục vụ file tĩnh (nếu cần)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Đọc file swagger.yaml
const swaggerFile = fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(swaggerFile);

// Thêm route swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Import routes
const authRoutes = require('./routes/auth');
const fieldRoutes = require('./routes/fields');
const timeSlotRoutes = require('./routes/timeSlots');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const serviceRoutes = require('./routes/services');
const notificationRoutes = require('./routes/notifications');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/timeslots', timeSlotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Server is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Khởi động cronjob tự động kiểm tra thanh toán
    const { startPaymentCheckJob } = require('./jobs/paymentCheckJob');
    startPaymentCheckJob();
});


