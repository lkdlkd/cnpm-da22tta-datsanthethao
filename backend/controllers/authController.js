const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng ký người dùng mới
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'Email đã được sử dụng' 
            });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        await user.save();

        // Tạo token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Email hoặc mật khẩu không đúng' 
            });
        }

        // Kiểm tra mật khẩu
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Email hoặc mật khẩu không đúng' 
            });
        }

        // Kiểm tra tài khoản có active không
        if (!user.isActive) {
            return res.status(403).json({ 
                success: false,
                message: 'Tài khoản đã bị khóa' 
            });
        }

        // Tạo token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    avatar: user.avatar
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// // Lấy thông tin user hiện tại
// exports.getCurrentUser = async (req, res) => {
//     try {
//         const user = await User.findById(req.userId).select('-password');
//         if (!user) {
//             return res.status(404).json({ 
//                 success: false,
//                 message: 'Không tìm thấy người dùng' 
//             });
//         }
//         res.json({
//             success: true,
//             data: user
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success: false,
//             message: 'Lỗi server', 
//             error: error.message 
//         });
//     }
// };

// Cập nhật thông tin user
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, phone, avatar } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            { fullName, phone, avatar },
            { new: true }
        ).select('-password');

        res.json({ 
            success: true,
            message: 'Cập nhật thành công', 
            data: user 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.userId);
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Mật khẩu hiện tại không đúng' 
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ 
            success: true,
            message: 'Đổi mật khẩu thành công' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Admin: Lấy danh sách tất cả users
exports.getAllUsers = async (req, res) => {
    try {
        const { role, isActive, search } = req.query;
        
        let query = {};
        
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.json({ 
            success: true,
            message: 'Lấy danh sách người dùng thành công',
            data: users 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Admin: Cập nhật thông tin user
exports.updateUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, phone, role, isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { fullName, phone, role, isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy người dùng' 
            });
        }

        res.json({ 
            success: true,
            message: 'Cập nhật thành công', 
            data: user 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Admin: Xóa user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy người dùng' 
            });
        }
        res.json({ 
            success: true,
            message: 'Xóa người dùng thành công' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};
