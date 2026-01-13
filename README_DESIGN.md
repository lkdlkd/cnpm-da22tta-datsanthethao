# Hệ Thống Đặt Lịch Sân Bóng Đá

## 📋 Mô tả dự án
Hệ thống quản lý và đặt lịch sân bóng đá trực tuyến với đầy đủ chức năng cho người dùng và quản trị viên.

## 🗄️ Cơ sở dữ liệu (8 bảng)

### 1. **User** - Quản lý người dùng
- Thông tin: tên, email, password, phone, role (customer/admin/staff)
- Xác thực: JWT token, reset password
- Avatar và trạng thái active

### 2. **Field** - Quản lý sân bóng
- Loại sân: 5vs5, 7vs7, 11vs11
- Thông tin: tên, địa chỉ, giá, hình ảnh, mô tả
- Tiện ích: đèn, phòng thay đồ, bãi đỗ xe
- Rating và tổng đánh giá

### 3. **TimeSlot** - Khung giờ theo ngày
- Liên kết với sân cụ thể
- Thời gian: ngày, giờ bắt đầu, giờ kết thúc
- Trạng thái: available, booked, blocked
- Giá theo khung giờ (giờ vàng, cuối tuần)

### 4. **Booking** - Đặt lịch
- Mã đặt tự động (BK000001)
- Thông tin người đặt: tên, phone
- Trạng thái: pending, confirmed, cancelled, completed
- Trạng thái thanh toán riêng
- Ghi chú và lý do hủy

### 5. **Payment** - Thanh toán
- Phương thức: cash, VNPay, MoMo, banking, ZaloPay
- Trạng thái: pending, success, failed, refunded
- Mã giao dịch từ cổng thanh toán
- Ngày thanh toán và hoàn tiền

### 6. **Review** - Đánh giá
- Rating 1-5 sao
- Comment và hình ảnh
- Xác thực từ booking thực tế
- Phản hồi từ admin
- Số lượt thích

### 7. **Service** - Dịch vụ bổ sung
- Loại: equipment, beverage, referee, other
- Giá và đơn vị tính
- Quản lý tồn kho
- Trạng thái available

### 8. **Notification** - Thông báo
- Loại: booking, payment, promotion, system, reminder
- Trạng thái đã đọc/chưa đọc
- Liên kết đến đối tượng liên quan

## 🚀 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Đăng ký
- `POST /login` - Đăng nhập
- `GET /me` - Lấy thông tin user hiện tại
- `PUT /profile` - Cập nhật thông tin
- `PUT /change-password` - Đổi mật khẩu

### Fields (`/api/fields`)
- `GET /` - Danh sách sân (filter: fieldType, location, price)
- `GET /popular` - Sân phổ biến
- `GET /:id` - Chi tiết sân
- `POST /` - Tạo sân mới (Admin)
- `PUT /:id` - Cập nhật sân (Admin)
- `DELETE /:id` - Xóa sân (Admin)

### TimeSlots (`/api/timeslots`)
- `GET /field/:fieldId?date=YYYY-MM-DD` - Khung giờ theo ngày
- `POST /` - Tạo khung giờ (Admin)
- `POST /generate` - Tạo tự động nhiều khung giờ (Admin)
- `PUT /:id` - Cập nhật khung giờ (Admin)
- `DELETE /:id` - Xóa khung giờ (Admin)

### Bookings (`/api/bookings`)
- `POST /` - Tạo booking mới
- `GET /my-bookings` - Booking của user
- `GET /:id` - Chi tiết booking
- `PUT /:id/cancel` - Hủy booking
- `GET /` - Tất cả bookings (Admin)
- `PUT /:id/confirm` - Xác nhận booking (Admin)

### Payments (`/api/payments`)
- `POST /` - Tạo thanh toán
- `GET /my-payments` - Lịch sử thanh toán
- `GET /booking/:bookingId` - Thanh toán theo booking
- `POST /callback` - Callback từ cổng thanh toán
- `PUT /:id/confirm-cash` - Xác nhận tiền mặt (Admin)

### Reviews (`/api/reviews`)
- `GET /field/:fieldId` - Đánh giá của sân
- `POST /` - Tạo đánh giá mới
- `GET /my-reviews` - Đánh giá của user
- `DELETE /:id` - Xóa đánh giá
- `PUT /:id/reply` - Phản hồi đánh giá (Admin)

### Services (`/api/services`)
- `GET /` - Danh sách dịch vụ
- `GET /:id` - Chi tiết dịch vụ
- `POST /` - Tạo dịch vụ (Admin)
- `PUT /:id` - Cập nhật dịch vụ (Admin)
- `DELETE /:id` - Xóa dịch vụ (Admin)

### Notifications (`/api/notifications`)
- `GET /` - Thông báo của user
- `PUT /:id/read` - Đánh dấu đã đọc
- `PUT /read-all` - Đánh dấu tất cả đã đọc
- `DELETE /:id` - Xóa thông báo
- `POST /` - Tạo thông báo (Admin)

## 🎨 Giao diện Frontend

### Trang người dùng
1. **HomePage** - Trang chủ
   - Hero section với search box
   - Sân phổ biến
   - Tính năng nổi bật

2. **FieldDetail** - Chi tiết sân
   - Gallery hình ảnh
   - Thông tin sân và tiện ích
   - Chọn ngày và khung giờ
   - Danh sách đánh giá

3. **BookingForm** - Form đặt sân
   - Tóm tắt thông tin đặt
   - Thông tin người đặt
   - Chọn phương thức thanh toán

4. **UserDashboard** - Trang cá nhân
   - Tab đơn đặt của tôi
   - Tab thông báo (với badge unread)
   - Tab thông tin cá nhân
   - Hủy đơn đặt

## 📦 Cài đặt

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Cấu hình MongoDB URI trong .env
npm run dev
```

### Frontend
```bash
cd client
npm install
npm start
```

## 🔧 Công nghệ sử dụng

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt (mã hóa password)
- Multer (upload files)
- Swagger UI (API documentation)

### Frontend
- React 18
- React Router v6
- Axios
- CSS Modules

## 🔐 Bảo mật
- JWT token authentication
- Password hashing với bcrypt
- Role-based access control (RBAC)
- Input validation
- CORS configuration

## 📱 Tính năng chính

### Cho người dùng
✅ Tìm kiếm và lọc sân theo loại, khu vực, giá  
✅ Xem chi tiết sân và đánh giá  
✅ Đặt sân theo khung giờ  
✅ Thanh toán đa dạng (cash, VNPay, MoMo)  
✅ Quản lý đơn đặt cá nhân  
✅ Hủy đơn đặt  
✅ Đánh giá sân sau khi sử dụng  
✅ Nhận thông báo real-time  

### Cho admin
✅ Quản lý sân bóng  
✅ Quản lý khung giờ (tạo tự động)  
✅ Quản lý đơn đặt (xác nhận/hủy)  
✅ Xác nhận thanh toán tiền mặt  
✅ Phản hồi đánh giá  
✅ Quản lý dịch vụ bổ sung  
✅ Gửi thông báo cho users  

## 📊 Sơ đồ quan hệ

```
User (1) -----> (n) Booking
Field (1) -----> (n) TimeSlot
Field (1) -----> (n) Booking
Booking (1) -----> (1) Payment
Booking (1) -----> (1) Review
User (1) -----> (n) Notification
User (1) -----> (n) Review
```

## 🎯 Roadmap
- [ ] Tích hợp thanh toán thật VNPay/MoMo
- [ ] Push notification
- [ ] Báo cáo thống kê cho admin
- [ ] Mobile app (React Native)
- [ ] Tính năng đặt sân định kỳ
- [ ] Hệ thống voucher/khuyến mãi

## 👥 Phân quyền
- **Customer**: Đặt sân, xem lịch sử, đánh giá
- **Staff**: Xác nhận đơn, xác nhận thanh toán
- **Admin**: Toàn quyền quản trị hệ thống

---

Developed with ❤️ for Football Lovers
