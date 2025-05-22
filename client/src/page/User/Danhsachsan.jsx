import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDanhSachSan } from "../../services/api";

const Danhsachsan = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await getDanhSachSan();
        setFields(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching fields:', error);
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleDatSan = (field) => {
    navigate(`/dat-san/${field._id}`);
  };

  // Lấy danh sách các Danhmuc duy nhất
  const danhMucList = Array.from(new Set(fields.map(f => f.Danhmuc).filter(Boolean)));

  // Các loại sân cần hiển thị
  const loaiSanList = ["2 người", "5 người", "7 người", "11 người"];

  const params = new URLSearchParams(location.search);
  const selectedDanhmuc = params.get("danhmuc");

  // Khi render:
  const filteredFields = selectedDanhmuc
    ? fields.filter(f => f.Danhmuc === selectedDanhmuc)
    : fields;

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary">DANH SÁCH CÁC SÂN</h2>
        <p className="text-muted">Chọn sân phù hợp và đặt lịch ngay!</p>
      </div>

      {(selectedDanhmuc ? [selectedDanhmuc] : danhMucList).map((danhmuc, idx) => (
        <section className="mb-5" key={idx}>
          <h4 className="text-success mb-4">{danhmuc}</h4>
          {loaiSanList.map((loaiSan) => {
            const filtered = filteredFields.filter(
              (field) => field.Danhmuc === danhmuc && field.loaiSan === loaiSan
            );
            if (filtered.length === 0) return null;
            return (
              <div key={loaiSan} className="mb-4">
                <h5 className="fw-bold text-primary mb-3">{loaiSan.toUpperCase()}</h5>
                <div className="row g-4">
                  {filtered.map((field, i) => (
                    <div className="col-md-4" key={field._id || i}>
                      <div className="card custom-card h-100">
                        <img
                          src={field.hinhAnh || "img/san1.jpg"}
                          className="card-img-top rounded-top"
                          alt={field.tenSan || "Sân bóng"}
                        />
                        <div className="card-body">
                          <h5 className="card-title text-primary">{field.tenSan}</h5>
                          <ul className="list-unstyled text-muted small">
                            <li>📍 {field.diaChi || "Khu liên hợp thể thao LBD Sport"}</li>
                            <li>🕕 Giờ mở cửa: 6h - 22h</li>
</ul>
                          <p className="price mb-2">
                            {field.giaTheoKhungGio && field.giaTheoKhungGio.length > 0 ? (
                              <ul className="mb-0 ps-3">
                                {field.giaTheoKhungGio.map((g, idx) => (
                                  <li key={idx}>
                                    <span className="fw-semibold">{g.khungGio}</span>:{" "}
                                    <span className="fw-bold text-primary">{g.gia?.toLocaleString()}đ</span>
                                    {" "}
                                    <span className="text-muted small">({g.Trangthai})</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span>Chưa cập nhật giá</span>
                            )}
                          </p>
                          <button
                            className="btn btn-primary w-100 fw-bold py-2 mt-2"
                            onClick={() => handleDatSan(field)}
                          >
                            Đặt sân
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
};

export default Danhsachsan;