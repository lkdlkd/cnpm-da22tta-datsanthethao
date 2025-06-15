import React from "react";

const ChinhSach = () => {
    return (
        <div className="container py-5">
            <h2 className="fw-bold text-primary mb-4 text-center">Chính Sách & Quy Định Khu Liên Hợp Thể Thao</h2>
            <div className="row g-4">
                <div className="col-md-12">
                    <div className="bg-light rounded-4 shadow-sm p-4">
                        {/* 1. Quy định sử dụng sân */}
                        <h5 className="mb-3 text-success">
                            <i className="bi bi-calendar-check me-2"></i>Quy định sử dụng sân bãi
                        </h5>
                        <p>
                            Khách hàng vui lòng đặt sân trước tối thiểu 1 giờ. Vui lòng đến đúng giờ đã đặt, giữ vệ sinh chung, không làm hư hại cơ sở vật chất và mặc trang phục thể thao phù hợp.
                        </p>

                        {/* 2. Chính sách thanh toán */}
                        <h5 className="mb-3 text-warning">
                            <i className="bi bi-credit-card-2-front me-2"></i>Chính sách thanh toán & hủy sân
                        </h5>
                        <p>
                            Thanh toán được thực hiện qua tiền mặt, chuyển khoản hoặc ví điện tử. Hủy trước 2 giờ sẽ được hoàn 100%. Sau thời gian đó, chi phí sẽ không được hoàn lại.
                        </p>

                        {/* 3. Quy định an toàn */}
                        <h5 className="mb-3 text-primary">
                            <i className="bi bi-heart-pulse me-2"></i>An toàn & Sức khỏe
                        </h5>
                        <p>
                            Người chơi phải tự đảm bảo điều kiện sức khỏe phù hợp khi tham gia hoạt động thể thao. Khu liên hợp không chịu trách nhiệm cho chấn thương do vi phạm quy định hoặc không khởi động kỹ.
                        </p>

                        {/* 4. Ứng xử & nội quy */}
                        <h5 className="mb-3 text-danger">
                            <i className="bi bi-exclamation-triangle me-2"></i>Ứng xử & Nội quy khuôn viên
                        </h5>
                        <p>
                            Không gây ồn ào, không xả rác, không hút thuốc trong khuôn viên sân. Hành vi thiếu văn minh, phá hoại tài sản sẽ bị xử lý và từ chối phục vụ trong tương lai.
                        </p>

                        {/* 5. Hỗ trợ & liên hệ */}
                        <h5 className="mb-3 text-info">
                            <i className="bi bi-headset me-2"></i>Hỗ trợ khách hàng
                        </h5>
                        <p>
                            Nếu bạn cần hỗ trợ hoặc có thắc mắc về chính sách, vui lòng liên hệ bộ phận quản lý qua email: <a href="mailto:info@lbd-sport.vn">info@lbd-sport.vn</a> hoặc gọi <strong>0123 456 789</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChinhSach;
