const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");

// Đăng ký người dùng
exports.register = async (req, res) => {
    try {
        const { hoTen, matKhau, soDienThoai } = req.body;
        const email = req.body.email.toLowerCase();
        // Kiểm tra định dạng email
        const emailRegex = /.+\@.+\..+/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        // Kiểm tra độ dài mật khẩu
        if (matKhau.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được sử dụng" });
        }

        // Kiểm tra xem đã có admin chưa
        const isAdminExists = await User.findOne({ role: "admin" });

        // Tạo người dùng mới
        const newUser = new User({
            hoTen,
            email,
            matKhau,
            soDienThoai,
            role: isAdminExists ? "user" : "admin", // Nếu chưa có admin, người dùng đầu tiên sẽ là admin
        });

        // Lưu người dùng vào cơ sở dữ liệu
        await newUser.save();

        res.status(201).json({ message: "Đăng ký thành công", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};

// Đăng nhập người dùng
exports.login = async (req, res) => {
    try {
        const { matKhau } = req.body;
        const email = req.body.email.toLowerCase();
        // Kiểm tra xem người dùng có tồn tại không
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // Kiểm tra mật khẩu
        const isMatch = await user.kiemTraMatKhau(matKhau);
        if (!isMatch) {
            return res.status(401).json({ message: "Mật khẩu không đúng" });
        }

        // Tạo token JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, // Thêm role vào payload của token
            process.env.JWT_SECRET || "secretkey", // Sử dụng biến môi trường cho khóa bí mật
            { expiresIn: "1d" } // Token hết hạn sau 1 ngày
        );
        res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user._id,
                hoTen: user.hoTen,
                email: user.email,
                soDienThoai: user.soDienThoai,
                trangThai: user.trangThai,
                role: user.role // Trả về role của người dùng
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};
