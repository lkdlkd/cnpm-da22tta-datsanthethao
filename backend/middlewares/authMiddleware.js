const jwt = require("jsonwebtoken");

// Middleware xác thực người dùng
exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            status: 401, 
            message: "Bạn chưa đăng nhập"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(403).json({
            status: 403,
            message: "Token không hợp lệ"
        });
    }
};

// Middleware phân quyền theo roles
exports.authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({ 
                message: "Bạn không có quyền truy cập" 
            });
        }
        next();
    };
};

// Middleware phân quyền admin (backward compatibility)
exports.authorizeAdmin = (req, res, next) => {
    if (req.userRole !== "admin") {
        return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
    next();
};