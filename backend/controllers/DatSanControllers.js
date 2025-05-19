const DatSan = require('../models/DatsanModel');
const SanBong = require('../models/SanbongModel');
require('../models/UserModel'); // Đảm bảo model User đã được đăng ký với mongoose

// Đặt sân
exports.datSan = async (req, res) => {
    try {
        const { sanBong, khungGio, ghiChu } = req.body;
        const nguoiDat = req.user.id; // từ middleware kiểm tra token
        const ngayDat = new Date(); // Ngày hiện tại

        // Kiểm tra trạng thái sân bóng trong khung giờ
        const sanBongData = await SanBong.findById(sanBong);
        if (!sanBongData) {
            return res.status(404).json({ message: 'Không tìm thấy sân bóng.' });
        }

        // Tìm khung giờ trong mảng `giaTheoKhungGio`
        const khungGioData = sanBongData.giaTheoKhungGio.find(gio => gio.khungGio === khungGio);
        if (!khungGioData) {
            return res.status(400).json({ message: 'Khung giờ không hợp lệ.' });
        }

        if (khungGioData.Trangthai === 'Hết sân') {
            return res.status(400).json({ message: 'Sân đã được đặt trong khung giờ này, vui lòng chọn khung giờ khác.' });
        }

        // Tạo mới đặt sân với ngày hiện tại
        const newDatSan = new DatSan({
            sanBong,
            nguoiDat,
            ngayDat,
            khungGio,
            ghiChu
        });

        await newDatSan.save();

        // Cập nhật trạng thái khung giờ thành "Hết sân"
        khungGioData.Trangthai = 'Hết sân';
        await sanBongData.save();

        res.status(201).json({
            message: 'Đặt sân thành công.',
            newDatSan,
            updatedSanBong: sanBongData
        });
    } catch (error) {
        console.error("Lỗi đặt sân:", error);
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message || error });
    }
};

// Lấy danh sách đặt sân theo userId
exports.getDatSanByUserId = async (req, res) => {
    try {
        const { id: userId, role } = req.user;

        let danhSachDatSan;
        if (role === 'admin') {
            // Admin: lấy tất cả, populate cả sân bóng và người đặt
            danhSachDatSan = await DatSan.find()
                .populate('sanBong', 'tenSan loaiSan diaChi')
                .populate('nguoiDat', 'hoTen email soDienThoai')
                .sort({ ngayDat: -1 });
        } else {
            // User: chỉ lấy của mình, populate cả sân bóng và người đặt
            danhSachDatSan = await DatSan.find({ nguoiDat: userId })
                .populate('sanBong', 'tenSan loaiSan diaChi')
                .populate('nguoiDat', 'hoTen email soDienThoai')
                .sort({ ngayDat: -1 });
        }

        res.status(200).json({ message: 'Lấy danh sách đặt sân thành công.', danhSachDatSan });
    } catch (error) {
        console.error("Lỗi getDatSanByUserId:", error);
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message || error });
    }
};

exports.adminXacNhanDatSan = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID của đặt sân từ URL
        const { daXacNhan, trangThaiThanhToan } = req.body; // Lấy thông tin từ body

        // Kiểm tra trạng thái thanh toán hợp lệ
        if (trangThaiThanhToan && !['Đã thanh toán', 'Chưa thanh toán', 'Đã hủy'].includes(trangThaiThanhToan)) {
            return res.status(400).json({ message: 'Trạng thái thanh toán không hợp lệ.' });
        }
        // Tìm và cập nhật đặt sân
        const datSan = await DatSan.findByIdAndUpdate(
            id,
            { daXacNhan, trangThaiThanhToan },
            { new: true } // Trả về document sau khi cập nhật
        );

        if (!datSan) {
            return res.status(404).json({ message: 'Không tìm thấy đặt sân.' });
        }

        res.status(200).json({ message: 'Xác nhận đặt sân thành công.', datSan });
    } catch (error) {
        console.error("Lỗi adminXacNhanDatSan:", error);
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message || error });
    }
};