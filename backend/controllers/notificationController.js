const Notification = require('../models/Notification');

// Lấy danh sách thông báo của user
exports.getUserNotifications = async (req, res) => {
    try {
        const { isRead } = req.query;
        let query = { user: req.userId };

        if (isRead !== undefined) query.isRead = isRead === 'true';

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            user: req.userId,
            isRead: false
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo' });
        }

        res.json({ message: 'Đã đánh dấu đọc', notification });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Đánh dấu tất cả đã đọc
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.json({ message: 'Đã đánh dấu tất cả đã đọc' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Xóa thông báo
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo' });
        }

        res.json({ message: 'Xóa thông báo thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Tạo thông báo (Admin)
exports.createNotification = async (req, res) => {
    try {
        const { user, title, message, type } = req.body;
        
        const notification = new Notification({
            user,
            title,
            message,
            type
        });

        await notification.save();
        res.status(201).json({ message: 'Tạo thông báo thành công', notification });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
