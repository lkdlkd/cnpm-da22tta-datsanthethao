const TimeSlot = require('../models/TimeSlot');
const Field = require('../models/Field');

// Lấy danh sách khung giờ của một sân theo ngày
exports.getTimeSlotsByFieldAndDate = async (req, res) => {
    try {
        const { fieldId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ngày' });
        }

        const timeSlots = await TimeSlot.find({
            field: fieldId,
            date: new Date(date)
        }).sort({ startTime: 1 });

        res.json({ success: true, data: timeSlots });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Tạo khung giờ mới (Admin)
exports.createTimeSlot = async (req, res) => {
    try {
        const timeSlot = new TimeSlot(req.body);
        await timeSlot.save();
        res.status(201).json({ success: true, message: 'Tạo khung giờ thành công', data: timeSlot });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Tạo khung giờ tự động cho sân (Admin)
exports.generateTimeSlots = async (req, res) => {
    try {
        const { fieldId, date, startHour, endHour, slotDuration } = req.body;

        const field = await Field.findById(fieldId);
        if (!field) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sân' });
        }

        const timeSlots = [];
        const targetDate = new Date(date);
        const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;

        for (let hour = startHour; hour < endHour; hour += slotDuration) {
            const startTime = `${String(Math.floor(hour)).padStart(2, '0')}:${String((hour % 1) * 60).padStart(2, '0')}`;
            const endTime = `${String(Math.floor(hour + slotDuration)).padStart(2, '0')}:${String(((hour + slotDuration) % 1) * 60).padStart(2, '0')}`;

            timeSlots.push({
                field: fieldId,
                date: targetDate,
                startTime,
                endTime,
                price: field.pricePerHour,
                status: 'available',
                isWeekend
            });
        }

        await TimeSlot.insertMany(timeSlots);
        res.status(201).json({ success: true, message: 'Tạo khung giờ thành công', data: { count: timeSlots.length } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Cập nhật trạng thái khung giờ (Admin)
exports.updateTimeSlot = async (req, res) => {
    try {
        const timeSlot = await TimeSlot.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!timeSlot) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khung giờ' });
        }
        
        res.json({ success: true, message: 'Cập nhật thành công', data: timeSlot });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Xóa khung giờ (Admin)
exports.deleteTimeSlot = async (req, res) => {
    try {
        const timeSlot = await TimeSlot.findByIdAndDelete(req.params.id);
        if (!timeSlot) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khung giờ' });
        }
        res.json({ success: true, message: 'Xóa khung giờ thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};
