const cron = require('node-cron');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const bankingService = require('../services/bankingService');

/**
 * Cronjob tự động kiểm tra thanh toán
 * Chạy mỗi 5 phút
 */
const startPaymentCheckJob = () => {
    // Chạy mỗi 5 phút: */5 * * * *
    // Chạy mỗi giờ: 0 * * * *
    // Chạy mỗi 30 phút: */30 * * * *
    
    cron.schedule('*/1 * * * *', async () => {
        console.log('=== Starting payment check job ===');
        console.log('Time:', new Date().toLocaleString('vi-VN'));
        
        try {
            await checkPendingPayments();
        } catch (error) {
            console.error('Error in payment check job:', error);
        }
        
        console.log('=== Payment check job completed ===\n');
    });
    
    console.log('✅ Payment check job scheduled (runs every 5 minutes)');
};

/**
 * Kiểm tra các booking chưa thanh toán
 */
async function checkPendingPayments() {
    try {
        // 1. Lấy danh sách booking chưa thanh toán bằng chuyển khoản
        const pendingBookings = await Booking.find({
            paymentStatus: 'unpaid',
            status: { $ne: 'cancelled' }
        })
        .populate('field', 'name')
        .populate('user', 'fullName email');

        if (pendingBookings.length === 0) {
            console.log('No pending bookings found');
            return;
        }

        console.log(`Found ${pendingBookings.length} pending bookings`);

        // 2. Lấy payment info để check phương thức
        const bookingsWithBanking = [];
        for (const booking of pendingBookings) {
            const payment = await Payment.findOne({ booking: booking._id });
            if (payment && payment.paymentMethod === 'banking') {
                bookingsWithBanking.push({ booking, payment });
            }
        }

        console.log(`${bookingsWithBanking.length} bookings are waiting for bank transfer`);

        if (bookingsWithBanking.length === 0) {
            return;
        }

        // 3. Lấy lịch sử giao dịch ngân hàng
        const transactions = await bankingService.getTransactionHistory();
        console.log(`Fetched ${transactions.length} bank transactions`);

        if (transactions.length === 0) {
            console.log('No transactions found from bank API');
            return;
        }

        // 4. Đối chiếu từng booking với giao dịch
        let confirmedCount = 0;
        for (const { booking, payment } of bookingsWithBanking) {
            const matchedTransaction = bankingService.findMatchingTransaction(
                booking,
                transactions
            );

            if (matchedTransaction) {
                console.log(`✅ Matched: Booking ${booking.bookingCode} with transaction ${matchedTransaction.transactionID}`);
                
                // Cập nhật payment
                payment.status = 'success';
                payment.transactionId = matchedTransaction.transactionID;
                payment.paymentDate = new Date(matchedTransaction.transactionDate);
                await payment.save();

                // Cập nhật booking
                booking.paymentStatus = 'paid';
                if (booking.status === 'pending') {
                    booking.status = 'confirmed';
                }
                await booking.save();

                // Tạo thông báo cho user
                await Notification.create({
                    user: booking.user._id,
                    title: 'Xác nhận thanh toán thành công',
                    message: `Thanh toán cho đơn ${booking.bookingCode} đã được xác nhận tự động. Mã GD: ${matchedTransaction.transactionID}`,
                    type: 'payment',
                    relatedId: payment._id,
                    relatedModel: 'Payment'
                });

                confirmedCount++;
                
                console.log(`Updated booking ${booking.bookingCode} to paid status`);
            }
        }

        console.log(`✅ Auto-confirmed ${confirmedCount} payments`);

    } catch (error) {
        console.error('Error checking pending payments:', error);
        throw error;
    }
}

module.exports = { startPaymentCheckJob, checkPendingPayments };
