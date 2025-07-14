import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDanhSachSan } from "../../services/api";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

const url = process.env.REACT_APP_API_URL || "http://localhost:5000"; // URL gốc của backend

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
        console.error("Error fetching fields:", error);
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const handleDatSan = (field) => {
    navigate(`/dat-san/${field._id}`);
  };

  const danhMucList = Array.from(new Set(fields.map((f) => f.Danhmuc).filter(Boolean)));
  const loaiSanList = ["2 người", "5 người", "7 người", "11 người"];
  const params = new URLSearchParams(location.search);
  const selectedDanhmuc = params.get("danhmuc");

  const filteredFields = selectedDanhmuc
    ? fields.filter((f) => f.Danhmuc === selectedDanhmuc)
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
                      <Card className="shadow-sm h-100 border-0">
                        <Card.Img
                          variant="top"
                          src={
                            field.hinhAnh
                              ? `${url}${field.hinhAnh}`
                              : "https://via.placeholder.com/300x200.png?text=Hình+ảnh+chưa+có"
                          }
                          alt={field.tenSan || "Sân bóng"}
                          style={{ objectFit: "cover", height: "200px" }}
                        />
                        <Card.Body>
                          <Card.Title className="text-primary">{field.tenSan}</Card.Title>
                          <Card.Text>
                            <ul className="list-unstyled text-muted small">
                              <li>📍 {field.diaChi || "Khu liên hợp thể thao LBD Sport"}</li>
                              <li>🕕 Giờ mở cửa: 6h - 22h</li>
                            </ul>
                            {field.giaTheoKhungGio && field.giaTheoKhungGio.length > 0 ? (
                              <ul className="mb-0 ps-3">
                                {field.giaTheoKhungGio.map((g, idx) => (
                                  <li key={idx}>
                                    <span className="fw-semibold">{g.khungGio}</span>:{" "}
                                    <span className="fw-bold text-primary">
                                      {g.gia?.toLocaleString()}đ
                                    </span>{" "}
                                    <span className="text-muted small">({g.Trangthai})</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span>Chưa cập nhật giá</span>
                            )}
                          </Card.Text>
                          <Button
                            variant="primary"
                            className="w-100 fw-bold py-2 mt-2"
                            onClick={() => handleDatSan(field)}
                          >
                            Đặt sân
                          </Button>
                        </Card.Body>
                      </Card>
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