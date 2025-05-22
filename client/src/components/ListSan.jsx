import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDanhSachSan } from '../services/api'; // import hàm getDanhSachSan

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

  return (
    <section className="py-4 bg-light">
      <div className="container">
        <h3 className="mb-4 text-center">Danh sách sân</h3>
        <div className="row g-4">
          {fields.length === 0 ? (
            <div className="col-12 text-center text-muted">Không có dữ liệu sân bóng</div>
          ) : (
            fields.slice(0, 4).map((field, idx) => (
              <div className="col-12 col-sm-6 col-md-3" key={field._id || idx}>
                <div className="card h-100 shadow-sm">
                  <img
                    src={field.hinhAnh || "img/san1.jpg"}
                    className="card-img-top"
                    alt={field.tenSan || `Sân ${idx + 1}`}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{field.tenSan} ({field.loaiSan})</h5>
                    <p className="card-text text-muted small">
                      <i className="bi bi-geo-alt-fill me-1" style={{ color: "#6c757d" }}></i>
                      Địa chỉ: {field.diaChi}
                    </p>
                    <p className="card-text text-muted small">
                      <i className="bi bi-clock-fill me-1" style={{ color: "#6c757d" }}></i>
                      {field.giaTheoKhungGio && field.giaTheoKhungGio.length > 0
                        ? `Khung giờ: ${field.giaTheoKhungGio.map(g => g.khungGio).join(", ")}`
                        : "Chưa cập nhật khung giờ"}
                    </p>
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => handleDatSan(field)}
                    >
                      Đặt sân
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ListSan;