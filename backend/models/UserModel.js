const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    hoTen: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /.+\@.+\..+/ // Kiểm tra định dạng email
    },
    matKhau: { type: String, required: true }, // Mật khẩu sẽ được hash
    soDienThoai: { type: String },
    trangThai: { 
        type: String, 
        enum: ['Hoạt động', 'Đã khóa'], 
        default: 'Hoạt động' 
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], // Các vai trò có thể có
        default: 'user' // Mặc định là người dùng thường
    }
}, { timestamps: true });

// Middleware để hash mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
    if (!this.isModified('matKhau')) return next(); // Chỉ hash nếu mật khẩu được thay đổi
    try {
        const salt = await bcrypt.genSalt(10);
        this.matKhau = await bcrypt.hash(this.matKhau, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Phương thức để kiểm tra mật khẩu
userSchema.methods.kiemTraMatKhau = async function (matKhauNhap) {
    return bcrypt.compare(matKhauNhap, this.matKhau);
};

module.exports = mongoose.model('User', userSchema);