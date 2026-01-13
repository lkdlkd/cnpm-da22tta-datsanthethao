# 🔄 Logic Tích Hợp Dịch Vụ - Hoàn Chỉnh

## 📋 Tổng Quan Luồng Hoạt Động

### 1️⃣ Luồng 1: Chọn dịch vụ trước → Đặt sân
```
User vào /dich-vu
  ↓
Chọn dịch vụ (thiết bị, đồ uống, trọng tài...)
  ↓
Điều chỉnh số lượng (nút +/-)
  ↓
Nhấn "Lưu & Đi đặt sân"
  ↓
selectedServices → sessionStorage
  ↓
Navigate → /danh-sach-san
  ↓
Chọn sân + khung giờ → Navigate → /booking
  ↓
BookingForm.useEffect() load selectedServices từ sessionStorage
  ↓
Hiển thị services + tính tổng tiền
  ↓
Submit → gửi services lên backend
  ↓
Backend: Trừ stock + lưu booking
  ↓
Clear sessionStorage
```

### 2️⃣ Luồng 2: Đặt sân trước → Thêm dịch vụ
```
User chọn sân + khung giờ → /booking
  ↓
Nhấn "➕ Thêm dịch vụ"
  ↓
Lưu {field, timeSlot, date} vào bookingDraft (sessionStorage)
  ↓
Navigate → /dich-vu
  ↓
DichVu.useEffect() load bookingDraft
  ↓
Hiển thị alert: "Chọn dịch vụ để quay lại trang đặt sân"
  ↓
User chọn dịch vụ
  ↓
Nhấn "Quay lại đặt sân"
  ↓
Navigate → /booking với state = bookingDraft
  ↓
Clear bookingDraft từ sessionStorage
  ↓
BookingForm hiển thị services + submit
```

## 🗂️ SessionStorage Keys

| Key | Giá Trị | Khi Nào Lưu | Khi Nào Xóa |
|-----|---------|-------------|-------------|
| `selectedServices` | `[{serviceId, name, price, quantity, unit}]` | User chọn services trong /dich-vu | Sau khi submit booking thành công |
| `bookingDraft` | `{field, timeSlot, date}` | User nhấn "Thêm dịch vụ" trong /booking | Sau khi quay lại /booking từ /dich-vu |

## 📦 Data Structure

### Frontend - selectedServices Format
```javascript
[
  {
    serviceId: "64abc...",      // _id của service
    name: "Bóng đá size 5",
    price: 50000,
    quantity: 2,
    unit: "quả"
  }
]
```

### Backend - Booking.services Format
```javascript
[
  {
    service: ObjectId("64abc..."),  // ref Service model
    quantity: 2,
    price: 50000
  }
]
```

### API Request Format (createBooking)
```javascript
{
  field: "64xyz...",
  timeSlot: "64def...",
  bookingDate: "2026-01-15",
  startTime: "08:00",
  endTime: "10:00",
  totalPrice: 350000,              // giá sân + giá services
  customerName: "Nguyễn Văn A",
  customerPhone: "0901234567",
  notes: "...",
  services: [                       // Optional
    {
      service: "64abc...",          // serviceId
      quantity: 2,
      price: 50000
    }
  ]
}
```

## 🔧 Component Functions

### BookingForm.jsx
```javascript
// Load services on mount
useEffect(() => {
  const saved = sessionStorage.getItem('selectedServices');
  if (saved) setSelectedServices(JSON.parse(saved));
}, []);

// Remove a service
const removeService = (serviceId) => {
  const updated = selectedServices.filter(s => s.serviceId !== serviceId);
  setSelectedServices(updated);
  sessionStorage.setItem('selectedServices', JSON.stringify(updated));
};

// Calculate totals
const getServicesTotal = () => selectedServices.reduce(...);
const getTotalPrice = () => timeSlot.price + getServicesTotal();

// Submit booking
const handleSubmit = async () => {
  const bookingData = { ..., totalPrice: getTotalPrice() };
  if (selectedServices.length > 0) {
    bookingData.services = selectedServices.map(s => ({
      service: s.serviceId,
      quantity: s.quantity,
      price: s.price
    }));
  }
  await bookingService.createBooking(bookingData);
  sessionStorage.removeItem('selectedServices'); // Clear
};
```

### DichVu.jsx
```javascript
// Load on mount
useEffect(() => {
  // Load bookingDraft
  const draft = sessionStorage.getItem('bookingDraft');
  if (draft) setBookingDraft(JSON.parse(draft));
  
  // Load previously selected services
  const saved = sessionStorage.getItem('selectedServices');
  if (saved) setSelectedServices(JSON.parse(saved));
}, []);

// Add to booking
const handleAddToBooking = () => {
  sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices));
  
  if (bookingDraft) {
    // Came from booking form - go back
    navigate('/booking', { state: bookingDraft });
    sessionStorage.removeItem('bookingDraft');
  } else {
    // New flow - go to field list
    navigate('/danh-sach-san');
  }
};
```

## 🔄 Backend Logic

### bookingController.createBooking()
```javascript
1. Validate timeSlot availability
2. If services exist:
   - Loop through each service
   - Check stock availability
   - Subtract stock from Service model
3. Create booking with services array
4. Update timeSlot status to 'booked'
5. Create notification
6. Return booking data
```

### Service Stock Management
```javascript
// When booking created
service.stock -= quantity;
await service.save();

// When booking cancelled (future feature)
service.stock += quantity;
await service.save();
```

## 🎯 Populate Strategy

### getUserBookings
```javascript
.populate('field', 'name fieldType location images')
.populate('timeSlot', 'startTime endTime')
.populate('services.service', 'name price unit category')
```

### getBookingById
```javascript
.populate('user', 'fullName email phone')
.populate('field')
.populate('timeSlot')
.populate('services.service', 'name price unit category description')
```

## ✅ Validation Checklist

### Frontend
- [x] Load services từ sessionStorage on mount
- [x] Hiển thị danh sách services với nút xóa
- [x] Tính tổng tiền = giá sân + giá services
- [x] Format đúng khi gửi API (service → serviceId)
- [x] Clear sessionStorage sau khi submit
- [x] Handle bookingDraft cho flow "Thêm dịch vụ"

### Backend
- [x] Validate services tồn tại
- [x] Check stock availability
- [x] Subtract stock khi tạo booking
- [x] Save services vào booking document
- [x] Populate services khi get bookings
- [x] Include services trong response

### Database
- [x] Booking.services là array of subdocuments
- [x] service field là ObjectId ref 'Service'
- [x] quantity và price là required
- [x] Index trên Service._id cho populate nhanh

## 🐛 Common Issues & Solutions

### Issue 1: Services không hiển thị trong BookingForm
**Cause**: useEffect không chạy hoặc sessionStorage empty
**Fix**: Kiểm tra console.log trong useEffect, verify sessionStorage key

### Issue 2: Tổng tiền sai
**Cause**: Thiếu getServicesTotal() trong getTotalPrice()
**Fix**: Đảm bảo getTotalPrice = timeSlot.price + getServicesTotal()

### Issue 3: Backend lỗi "service not found"
**Cause**: Frontend gửi service: s.name thay vì s.serviceId
**Fix**: Map đúng: service: s.serviceId

### Issue 4: Stock không bị trừ
**Cause**: Thiếu await service.save() trong backend
**Fix**: Thêm await sau service.stock -= quantity

### Issue 5: Services không populate
**Cause**: Thiếu .populate('services.service')
**Fix**: Thêm populate cho nested path

## 🚀 Testing Scenarios

1. **Test chọn service → đặt sân**
   - Vào /dich-vu
   - Chọn 2-3 services
   - Nhấn "Lưu & Đi đặt sân"
   - Chọn sân + giờ
   - Verify services hiển thị
   - Submit và check database

2. **Test đặt sân → thêm service**
   - Chọn sân + giờ
   - Nhấn "Thêm dịch vụ"
   - Chọn services
   - Nhấn "Quay lại đặt sân"
   - Verify quay lại đúng booking
   - Submit và check database

3. **Test xóa service**
   - Có services trong form
   - Click nút ✕ trên từng service
   - Verify service bị xóa
   - Verify tổng tiền cập nhật

4. **Test stock management**
   - Check stock trước khi đặt
   - Submit booking với services
   - Verify stock giảm đúng số lượng

5. **Test hiển thị trong danh sách booking**
   - Tạo booking với services
   - Vào /danh-sach-san-da-dat
   - Click "Xem chi tiết"
   - Verify bảng services hiển thị đúng

## 🎨 UI/UX Flow

### DichVu.jsx
```
[Tab: Tất cả | Thiết bị | Đồ uống | Trọng tài | Khác]
  ↓
[Grid of Service Cards]
  - Tên + Giá + Tồn kho
  - Input số lượng với +/-
  ↓
[Sticky Bottom Card]
  - Danh sách đã chọn
  - Tổng tiền
  - Button: "Lưu & Đi đặt sân" hoặc "Quay lại đặt sân"
```

### BookingForm.jsx
```
[Thông tin sân]
  - Tên sân, loại, địa chỉ
  - Ngày, giờ
  - Giá sân: XXXđ
  ↓
[Dịch vụ bổ sung] (nếu có)
  - Service 1 x2 [Xóa]
  - Service 2 x1 [Xóa]
  ↓
[Tổng thanh toán: XXXđ]
  ↓
[Button: ➕ Thêm dịch vụ] (nếu chưa có)
```

### Danhsachsandadat.jsx Modal
```
[Thông tin đặt sân]
  ↓
[Dịch vụ bổ sung] (nếu có)
[Table]
| Tên dịch vụ | SL | Đơn giá | Thành tiền |
|-------------|----|---------| ----------|
| Bóng đá     | 2  | 50,000đ | 100,000đ  |
  ↓
[Tổng thanh toán: XXXđ]
```

## 📊 Database Schema Summary

### Service Model
```javascript
{
  name: String,
  category: Enum['equipment', 'beverage', 'referee', 'other'],
  description: String,
  price: Number,
  unit: String,
  stock: Number,           // Giảm khi booking tạo
  isAvailable: Boolean
}
```

### Booking Model
```javascript
{
  user: ObjectId,
  field: ObjectId,
  timeSlot: ObjectId,
  bookingDate: Date,
  totalPrice: Number,      // Bao gồm cả services
  services: [{
    service: ObjectId,     // ref Service
    quantity: Number,
    price: Number          // Giá tại thời điểm đặt
  }],
  status: Enum,
  paymentStatus: Enum
}
```

## 🔐 Security Considerations

1. **Stock Validation**: Backend phải validate stock trước khi trừ
2. **Price Integrity**: Lưu price trong booking để tránh thay đổi sau
3. **Transaction**: Nên dùng MongoDB transaction cho create booking + update stock
4. **Authorization**: Chỉ user tạo booking mới được xem services

## 🎯 Future Enhancements

1. **Rollback stock** khi booking bị hủy
2. **Service combos** (package deals)
3. **Discount codes** cho services
4. **Service history** per user
5. **Popular services** tracking
6. **Auto-suggest services** dựa trên field type

---

✅ **Logic đã đồng bộ hoàn toàn!**
