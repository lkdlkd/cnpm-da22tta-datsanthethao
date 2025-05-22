import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSanTheoId, datSan } from "../../services/api"; // import hàm datSan
import Swal from "sweetalert2";

const DatSan = () => {
  const { id } = useParams();
  const [san, setSan] = useState(null);
  const [form, setForm] = useState({
    khungGio: "",
    ghiChu: "",
  });

  useEffect(() => {
    if (id) {
      getSanTheoId(id)
        .then((data) => setSan(data))
        .catch(() => setSan(null));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await datSan({
        sanBong: id,
        khungGio: form.khungGio,
        ghiChu: form.ghiChu,
      });

      // Lấy giá tiền theo khung giờ đã chọn
      let amount = 0;
      if (san?.giaTheoKhungGio && form.khungGio) {
        const khung = san.giaTheoKhungGio.find(g => g.khungGio === form.khungGio);
        amount = khung?.gia || 0;
      }

      Swal.fire({
        icon: "success",
        title: "Đặt sân thành công!",
        html: `
        <div>
          <p>Vui lòng quét mã QR để thanh toán:</p>
          <img
            src="https://img.vietqr.io/image/ACB-7997211-qronly2.jpg?accountName=${encodeURIComponent('LE KHANH DANG')}&accountNumber=${encodeURIComponent('7997211')}&amount=${encodeURIComponent(amount)}&addInfo=${encodeURIComponent('Đặt sân bóng')}&bankCode=${encodeURIComponent('ACB')}&orderId=${encodeURIComponent('123456789')}"
            alt="QR CODE"
            width="250"
            style="margin: 0 auto; display: block;"
          />
        </div>
      `,
        showConfirmButton: true,
        confirmButtonText: "Đã thanh toán",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Đặt sân thất bại!",
        text: error?.response?.data?.message || "Sân giờ này đã hết vui lòng chọn giờ khác.",
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="row gx-5 gy-4 align-items-stretch">
        {/* Cột 1: Ảnh và thông tin sân */}
        <div className="col-md-6 mb-4 mb-md-0">
          <div className="card shadow border-0 h-100">
            <img
              src={san?.hinhAnh || "img/san1.jpg"}
              className="img-fluid rounded-top"
              alt={san?.tenSan || "Sân bóng"}
              style={{ objectFit: "cover", height: 320, width: "100%" }}
            />
            <div className="card-body">
              <h4 className="card-title text-primary fw-bold mb-2">
                {san?.tenSan || "Sân bóng đá"}
              </h4>
              <ul className="list-unstyled text-muted small mb-2">
                <li>
                  <i className="bi bi-geo-alt-fill text-danger"></i>{" "}
                  {san?.diaChi || "Khu liên hợp thể thao LBD Sport"}
                </li>
                <li>
                  <i className="bi bi-clock-fill text-success"></i>{" "}
                  Giờ mở cửa: 6h - 22h
                </li>
                <li>
                  <i className="bi bi-currency-dollar text-warning"></i> Giá từng khung giờ:
                  <ul className="mb-0 ms-3">
                    {san?.giaTheoKhungGio && san.giaTheoKhungGio.length > 0 ? (
                      san.giaTheoKhungGio.map((g, i) => (
                        <li key={i}>
                          <span className="fw-bold text-dark">{g.khungGio}</span>:{" "}
                          <span className="fw-bold text-primary">{g.gia?.toLocaleString()}đ</span>
                          {" "}
                          <span className="text-muted small">({g.Trangthai})</span>
                        </li>
                      ))
                    ) : (
                      <li>200.000đ</li>
                    )}
                  </ul>
                </li>
              </ul>
              <div className="d-flex flex-wrap gap-3 mt-3">
                <span className="badge bg-primary bg-opacity-10 text-primary fw-normal">📶 Wifi</span>
                <span className="badge bg-success bg-opacity-10 text-success fw-normal">🧊 Trà đá</span>
                <span className="badge bg-warning bg-opacity-10 text-warning fw-normal">🍽️ Căn tin</span>
                <span className="badge bg-info bg-opacity-10 text-info fw-normal">🚲 Bãi đỗ xe</span>
                <span className="badge bg-secondary bg-opacity-10 text-secondary fw-normal">🚗 Bãi đỗ xe oto</span>
              </div>
            </div>
          </div>
        </div>
        {/* Cột 2: Form */}
        <div className="col-md-6 d-flex flex-column">
          <div className="card shadow border-0 h-100">
            <div className="card-body">
              <h4 className="fw-bold mb-3 text-primary">Gửi yêu cầu đặt sân</h4>
              <form
                id="bookingForm"
                className="d-flex flex-column gap-3"
                onSubmit={handleSubmit}
              >
                <select
                  className="form-select"
                  name="khungGio"
                  value={form.khungGio}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Chọn giờ đặt</option>
                  {san?.giaTheoKhungGio && san.giaTheoKhungGio.length > 0 ? (
                    san.giaTheoKhungGio.map((g, i) => (
                      <option key={i} value={g.khungGio}>
                        {g.khungGio} - {g.gia?.toLocaleString()}đ ({g.Trangthai})
                      </option>
                    ))
                  ) : (
                    <>
                      <option>6h - 8h</option>
                      <option>8h - 10h</option>
                      <option>16h - 18h</option>
                      <option>20h - 22h</option>
                    </>
                  )}
                </select>
                <textarea
                  className="form-control"
                  placeholder="Ghi chú"
                  rows="2"
                  name="ghiChu"
                  value={form.ghiChu}
                  onChange={handleChange}
                ></textarea>
                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold py-2 mt-2"
                >
                  Đặt sân
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatSan;