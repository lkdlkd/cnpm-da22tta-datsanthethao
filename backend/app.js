require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import connectDB
const authRoutes = require('./routes/authRoutes'); // Import authRoutes
const path = require("path");
const uploadRouter = require("./routes/upload"); // Import router từ upload.js

const app = express();

// Kết nối cơ sở dữ liệu
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware để phục vụ file tĩnh (nếu cần)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Sử dụng router cho auth
app.use('/api', authRoutes);
app.use("/api", uploadRouter);

app.get('/', (req, res) => {
    res.send('Server is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


