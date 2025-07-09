const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Đổi sang bcryptjs
const AutoIncrement = require('mongoose-sequence')(mongoose); // Import mongoose-sequence

const userSchema = new mongoose.Schema({
    _id: { type: Number }, // Đặt _id là kiểu Number để sử dụng AutoIncrement
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
// Thêm plugin AutoIncrement để tự động tăng _id
userSchema.plugin(AutoIncrement, { id: 'user_id_counter', inc_field: '_id' });
module.exports = mongoose.model('User', userSchema);