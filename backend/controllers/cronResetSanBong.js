const cron = require('node-cron');
const mongoose = require('mongoose');

// Hàm reset trạng thái tất cả khung giờ về 'Còn sân'
async function resetSanBongTrangThai() {
    try {
        const SanBong = mongoose.model('SanBong');
        await SanBong.updateMany(
            {},
            { $set: { 'giaTheoKhungGio.$[].Trangthai': 'Còn sân' } }
        );
        console.log('Đã reset trạng thái tất cả khung giờ về Còn sân!');
    } catch (err) {
        console.error('Cronjob reset sân lỗi:', err);
    }
}

// Cronjob chạy mỗi ngày lúc 0h
function startSanBongCronJob() {
    cron.schedule('0 0 * * *', resetSanBongTrangThai);
    console.log('Cronjob reset trạng thái sân đã được bật!');
}


// Cronjob chạy mỗi 1 phút test
// function startSanBongCronJob() {
//     cron.schedule('*/1 * * * *', resetSanBongTrangThai);
//     console.log('Cronjob reset trạng thái sân đã được bật (mỗi 5 phút)!');
// }

module.exports = { startSanBongCronJob, resetSanBongTrangThai };
