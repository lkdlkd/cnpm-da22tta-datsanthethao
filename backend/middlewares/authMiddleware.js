const jwt = require("jsonwebtoken");

// Middleware xác thực người dùng (user hoặc admin)
exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header Authorization

    if (!token) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey"); // Giải mã token
        req.user = decoded; // Lưu thông tin user vào request
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token không hợp lệ" });
    }
};

// Middleware phân quyền admin
exports.authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
    next();
};