require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import connectDB
const authRoutes = require('./routes/authRoutes'); // Import authRoutes

const app = express();

// Kết nối cơ sở dữ liệu
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Sử dụng router cho auth
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Server is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


