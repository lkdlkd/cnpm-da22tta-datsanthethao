const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose); // Import mongoose-sequence

const DatSanSchema = new mongoose.Schema({
    _id: { type: Number }, // Đặt _id là kiểu Number để sử dụng AutoIncrement
    sanBong: { type: Number, ref: 'SanBong', required: true },
    nguoiDat: { type:Number, ref: 'NguoiDung', required: true },
    ngayDat: { type: Date, required: true }, // Ngày đặt
    khungGio: { type: String, required: true }, // Ví dụ: "06:00-07:30"
    trangThaiThanhToan: { type: String, enum: ['Đã thanh toán', 'Chưa thanh toán', 'Đã hủy'], default: 'Chưa thanh toán' },
    daXacNhan: { type: Boolean, default: false }
}, { timestamps: true });
// Thêm plugin AutoIncrement để tự động tăng _id
DatSanSchema.plugin(AutoIncrement, { id: 'datsan_id_counter', inc_field: '_id' });
module.exports = mongoose.model('DatSan', DatSanSchema);
