import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDanhSachSan } from "../services/api"; // import hàm getDanhSachSan
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

const ListSan = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  return (
    <section className="py-4 bg-light">
      <div className="container">
        <h3 className="mb-4 text-center text-primary fw-bold">Danh sách sân</h3>
        <div className="row g-4">
          {fields.length === 0 ? (
            <div className="col-12 text-center text-muted">Không có dữ liệu sân bóng</div>
          ) : (
            fields.slice(0, 4).map((field, idx) => (
              <div className="col-12 col-sm-6 col-md-3" key={field._id || idx}>
                <Card className="h-100 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={field.hinhAnh || "img/san1.jpg"}
                    alt={field.tenSan || `Sân ${idx + 1}`}
                    style={{ objectFit: "cover", height: "200px" }}
                  />
                  <Card.Body>
                    <Card.Title className="text-primary fw-bold">
                      {field.tenSan} ({field.loaiSan})
                    </Card.Title>
                    <Card.Text className="text-muted small">
                      <i className="bi bi-geo-alt-fill me-1" style={{ color: "#6c757d" }}></i>
                      Địa chỉ: {field.diaChi || "Chưa cập nhật"}
                    </Card.Text>
                    <Card.Text className="text-muted small">
                      <i className="bi bi-clock-fill me-1" style={{ color: "#6c757d" }}></i>
                      {field.giaTheoKhungGio && field.giaTheoKhungGio.length > 0
                        ? `Khung giờ: ${field.giaTheoKhungGio.map((g) => g.khungGio).join(", ")}`
                        : "Chưa cập nhật khung giờ"}
                    </Card.Text>
                    <Button
                      variant="primary"
                      className="w-100 fw-bold"
                      onClick={() => handleDatSan(field)}
                    >
                      Đặt sân
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ListSan;