# Auto Payment Check System

Hệ thống tự động kiểm tra và xác nhận thanh toán qua chuyển khoản ngân hàng.

## Cấu hình

### 1. Cài đặt thông tin API ngân hàng

Thêm vào file `.env`:

```env
BANK_API_URL=https://api.sieuthicode.net/historyapimbv3
BANK_PASSWORD=your_bank_password
BANK_ACCOUNT_NUMBER=your_account_number
BANK_TOKEN=your_api_token
```

### 2. Cách hoạt động

#### Cronjob tự động chạy mỗi 5 phút:
1. Lấy danh sách booking chưa thanh toán (paymentStatus: 'unpaid')
2. Lọc ra các booking chọn phương thức "Chuyển khoản" (banking)
3. Gọi API ngân hàng lấy lịch sử giao dịch
4. So khớp giao dịch với booking dựa trên:
   - **Số tiền**: khớp với totalPrice (cho phép sai lệch < 100đ)
   - **Nội dung**: chứa tên sân + ngày đặt (vd: "San5 12012026")
5. Nếu khớp → Tự động xác nhận thanh toán

#### Khi tìm thấy giao dịch khớp:
- Cập nhật Payment: status = 'success', transactionId, paymentDate
- Cập nhật Booking: paymentStatus = 'paid', status = 'confirmed'
- Gửi thông báo cho khách hàng

## Điều chỉnh tần suất chạy

Trong file `backend/jobs/paymentCheckJob.js`, dòng 12:

```javascript
// Chạy mỗi 5 phút
cron.schedule('*/5 * * * *', async () => { ... });

// Các tùy chọn khác:
// Mỗi phút: '* * * * *'
// Mỗi 10 phút: '*/10 * * * *'
// Mỗi 30 phút: '*/30 * * * *'
// Mỗi giờ: '0 * * * *'
// Mỗi ngày lúc 9h: '0 9 * * *'
```

## Kiểm tra logs

Cronjob sẽ in ra console:

```
=== Starting payment check job ===
Time: 12/01/2026 10:00:00
Found 3 pending bookings
2 bookings are waiting for bank transfer
Fetched 26 bank transactions
✅ Matched: Booking BK000001 with transaction FT24032059009306B39
Updated booking BK000001 to paid status
✅ Auto-confirmed 1 payments
=== Payment check job completed ===
```

## Test thủ công

Có thể gọi function trực tiếp:

```javascript
const { checkPendingPayments } = require('./jobs/paymentCheckJob');
await checkPendingPayments();
```

## Lưu ý quan trọng

### 1. Format nội dung chuyển khoản
Khách hàng PHẢI chuyển khoản đúng nội dung:
- Format: `[Tên sân] [Ngày]`
- Ví dụ: `San5 12012026`
- Hệ thống sẽ chuẩn hóa (bỏ dấu, khoảng trắng) trước khi so khớp

### 2. Số tiền
- Cho phép sai lệch < 100đ
- Ví dụ: Booking 150,000đ → Giao dịch 150,000đ hoặc 149,900đ đều OK

### 3. Bảo mật
- Không commit file `.env` lên Git
- Giữ bí mật BANK_TOKEN và BANK_PASSWORD
- API key chỉ nên có quyền READ lịch sử giao dịch

### 4. Rate Limiting
- API ngân hàng có thể giới hạn số request/phút
- Nếu có nhiều booking, cân nhắc tăng interval lên 10-15 phút

## Troubleshooting

### Không tìm thấy giao dịch
- Kiểm tra khách đã chuyển khoản đúng nội dung chưa
- Kiểm tra API token còn hợp lệ không
- Xem logs để debug: `Looking for transaction with content: ...`

### Cronjob không chạy
- Kiểm tra server đã restart sau khi cập nhật code
- Xem console có log: "✅ Payment check job scheduled"
- Kiểm tra package `node-cron` đã cài đặt

### Giao dịch bị trùng
- Hệ thống chỉ check booking `paymentStatus: 'unpaid'`
- Sau khi confirm, booking chuyển sang `paid` nên không bị check lại
