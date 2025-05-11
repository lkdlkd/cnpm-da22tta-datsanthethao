const DatSan = require('../models/DatsanModel');
const SanBong = require('../models/SanbongModel'); 
// Đặt sân
exports.datSan = async (req, res) => {
    try {
        const { sanBong, ngayDat, khungGio } = req.body;
        const nguoiDat = req.user.id; // từ middleware kiểm tra token

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

        // Tạo mới đặt sân
        const newDatSan = new DatSan({
            sanBong,
            nguoiDat,
            ngayDat,
            khungGio
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
        res.status(500).json({ message: 'Lỗi máy chủ.', error });
    }
};
// Lấy danh sách đặt sân theo userId
exports.getDatSanByUserId = async (req, res) => {
    try {
        const { id: userId, role } = req.user; // Lấy userId và role từ middleware kiểm tra token

        let danhSachDatSan;
        if (role === 'admin') {
            // Nếu là admin, lấy tất cả danh sách đặt sân
            danhSachDatSan = await DatSan.find()
                .populate('sanBong', 'tenSan loaiSan diaChi') // Lấy thông tin sân bóng
                .sort({ ngayDat: -1 }); // Sắp xếp theo ngày đặt giảm dần
        } else {
            // Nếu không phải admin, chỉ lấy danh sách đặt sân của người dùng hiện tại
            danhSachDatSan = await DatSan.find({ nguoiDat: userId })
                .populate('sanBong', 'tenSan loaiSan diaChi') // Lấy thông tin sân bóng
                .sort({ ngayDat: -1 }); // Sắp xếp theo ngày đặt giảm dần
        }

        res.status(200).json({ message: 'Lấy danh sách đặt sân thành công.', danhSachDatSan });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error });
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
        res.status(500).json({ message: 'Lỗi máy chủ.', error });
    }
};