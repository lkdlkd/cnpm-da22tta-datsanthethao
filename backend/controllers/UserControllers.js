const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs"); // Đổi sang bcryptjs

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
            { expiresIn: "7d" } // Token hết hạn sau 7 ngày
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
// Xóa người dùng
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID người dùng từ URL
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }

        res.status(200).json({ message: "Xóa người dùng thành công.", user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ.", error: error.message });
    }
};

// Sửa thông tin người dùng
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID người dùng từ URL
        const { hoTen, soDienThoai, trangThai, role } = req.body; // Lấy thông tin cần cập nhật từ body

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { hoTen, soDienThoai, trangThai, role },
            { new: true, runValidators: true } // Trả về document sau khi cập nhật và kiểm tra validation
        ).select("-matKhau");

        if (!updatedUser) {
            return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }

        res.status(200).json({ message: "Cập nhật thông tin người dùng thành công.", updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ.", error: error.message });
    }
};
// exports.getUsers = async (req, res) => {
//     try {
//         const users = await User.find().select("-matKhau"); // Lấy tất cả người dùng, loại bỏ trường mật khẩu
//         res.status(200).json({ message: "Lấy danh sách người dùng thành công.", users });
//     } catch (error) {
//         res.status(500).json({ message: "Lỗi máy chủ.", error: error.message });
//     }
// };

exports.getUsers = async (req, res) => {
    try {
        const { role, id } = req.user; // Lấy role và id từ middleware xác thực

        let users;
        if (role === "admin") {
            // Nếu là admin, lấy tất cả người dùng
            users = await User.find().select("-matKhau"); // Loại bỏ trường mật khẩu
        } else {
            // Nếu không phải admin, chỉ lấy thông tin của chính họ
            users = await User.findById(id).select("-matKhau");
            if (!users) {
                return res.status(404).json({ message: "Không tìm thấy người dùng." });
            }
        }

        res.status(200).json({ message: "Lấy danh sách người dùng thành công.", users });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ.", error: error.message });
    }
};


// Cập nhật thông tin cá nhân
exports.capNhatThongTinCaNhan = async (req, res) => {
    try {
        const { hoTen, email, soDienThoai } = req.body;

        // Kiểm tra xem người dùng có tồn tại không
        const user = await User.findById(req.user.id); // `req.user._id` được lấy từ middleware xác thực
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Cập nhật thông tin
        user.hoTen = hoTen || user.hoTen;
        user.email = email || user.email;
        user.soDienThoai = soDienThoai || user.soDienThoai;

        await user.save(); // Lưu thông tin đã cập nhật

        res.status(200).json({ message: 'Cập nhật thông tin thành công', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật thông tin' });
    }
};
exports.doiMatKhau = async (req, res) => {
    try {
        const { matKhauCu, matKhauMoi } = req.body;

        // Kiểm tra xem người dùng có tồn tại không
        const user = await User.findById(req.user.id); // `req.user.id` được lấy từ middleware xác thực
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(matKhauCu, user.matKhau);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
        }

        // Kiểm tra độ dài mật khẩu mới
        if (matKhauMoi.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
        }

        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(matKhauMoi, 10);
        user.matKhau = hashedPassword;

        // Lưu mật khẩu mới
        await user.save();

        res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Có lỗi xảy ra khi đổi mật khẩu", error: error.message });
    }
};