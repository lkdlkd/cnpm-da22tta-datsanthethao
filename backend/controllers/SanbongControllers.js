const SanBong = require('../models/SanbongModel');

// Thêm sân
exports.themSan = async (req, res) => {
    try {
        const newSan = new SanBong(req.body);
        await newSan.save();
        res.status(201).json({ message: 'Thêm sân thành công.', newSan });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error });
    }
};

// Sửa sân
exports.suaSan = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSan = await SanBong.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: 'Cập nhật sân thành công.', updatedSan });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error });
    }
};

// Xóa sân
exports.xoaSan = async (req, res) => {
    try {
        const { id } = req.params;
        await SanBong.findByIdAndDelete(id);
        res.status(200).json({ message: 'Xóa sân thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error });
    }
};

// Lấy danh sách sân
exports.layDanhSachSan = async (req, res) => {
    try {
        const sanList = await SanBong.find();
        res.status(200).json(sanList);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ.', error });
    }
};
