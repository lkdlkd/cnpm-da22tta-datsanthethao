const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose); // Import mongoose-sequence

const SanBongSchema = new mongoose.Schema({
    _id: { type: Number }, // Đặt _id là kiểu Number để sử dụng AutoIncrement
    tenSan: { type: String, required: true },
    Danhmuc: { type: String, required: true },
    loaiSan: { type: String, enum: ['2 người','5 người', '7 người', '11 người'], required: true },
    diaChi: { type: String, required: true },
    hinhAnh: { type: String }, // Link ảnh sân
    giaTheoKhungGio: [{
        khungGio: { type: String }, // Ví dụ: "06:00-07:30"
        gia: { type: Number },
        Trangthai: { type: String, enum: ['Còn sân', 'Hết sân'], default: 'Còn sân' }
    }],
    tinhTrang: { type: String, enum: ['Đang hoạt động', 'Bảo trì'], default: 'Đang hoạt động' }
}, { timestamps: true });

// Thêm plugin AutoIncrement để tự động tăng _id
SanBongSchema.plugin(AutoIncrement, { id: 'sanbong_id_counter', inc_field: '_id' });
module.exports = mongoose.model('SanBong', SanBongSchema);