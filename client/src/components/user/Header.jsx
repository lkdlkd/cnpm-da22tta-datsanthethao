import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { getDanhSachSan } from '../../services/api';

const Header = ({ users }) => {
  const [danhMucList, setDanhMucList] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getDanhSachSan().then(data => {
      const list = Array.from(new Set((data || []).map(f => f.Danhmuc).filter(Boolean)));
      setDanhMucList(list);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      // Tìm danh mục khớp không phân biệt hoa thường
      const matched = danhMucList.find(
        dm => dm.toLowerCase() === search.trim().toLowerCase()
      );
      if (matched) {
        navigate(`/danh-sach-san?danhmuc=${encodeURIComponent(matched)}`);
      } else {
        // Nếu không khớp danh mục, có thể chuyển sang tìm kiếm tên sân hoặc thông báo không tìm thấy
        navigate(`/danh-sach-san?search=${encodeURIComponent(search.trim())}`);
      }
    }
  };

  return (
    <header className="bg-white border-bottom">
      <div className="container-fluid py-2 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <img
            src="/img/logo.png"
            alt="Logo"
            className="logo me-3"
            style={{ height: 120, width: "auto", objectFit: "contain" }}
          />
          <nav className="d-none d-md-flex gap-3">
            <a href="/home" className="nav-link text-danger fw-bold">Trang chủ</a>
            <a href="/danh-sach-san" className="nav-link">Danh sách sân</a>
            <a href="/danh-sach-san-da-dat" className="nav-link">Danh sách sân đã đặt</a>

            <a href="#" className="nav-link">Giới thiệu</a>
            <a href="#" className="nav-link">Chính sách</a>
            <a href="/lien-he" className="nav-link">Liên hệ</a>
          </nav>
        </div>

        <div className="d-flex align-items-center gap-3">
          <form className="d-none d-md-block position-relative search-wrapper" onSubmit={handleSearch}>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Tìm sân thể thao"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-link p-0 position-absolute top-50 start-0 translate-middle-y ms-2">
              <i className="bi bi-search search-icon"></i>
            </button>
          </form>
          {users ? (
            <span className="fw-bold text-success d-flex align-items-center gap-2">
              Xin chào: {users.hoTen}
              <button
                className="btn btn-outline-secondary btn-sm ms-2"
                onClick={() => {
                  localStorage.removeItem("token");
window.location.href = "/dang-nhap";
                }}
              >
                <i className="bi bi-box-arrow-right"></i> Đăng xuất
              </button>
            </span>
          ) : (
            <>
              <a href="/dang-nhap" className="btn btn-outline-danger btn-sm btn-login">
                <i className="bi bi-box-arrow-in-right"></i> Đăng nhập
              </a>
              <a href="#" className="btn btn-danger btn-sm btn-register">
                <i className="bi bi-person-plus"></i> Đăng ký
              </a>
            </>
          )}
        </div>
      </div>

      <div className="bg-dark text-white py-2">
        <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap">
          <div className="d-flex gap-3 flex-wrap ms-4">
            {danhMucList.map((dm, idx) => (
              <a
                key={idx}
                href={`/danh-sach-san?danhmuc=${encodeURIComponent(dm)}`}
                className="text-white text-decoration-none"
              >
                {dm}
              </a>
            ))}
          </div>
          <div className="me-3">
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white small ms-3"
              aria-label="Instagram"
            >
              <i className="bi bi-instagram fs-5"></i>
            </a>
            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white small ms-3"
              aria-label="Facebook"
            >
              <i className="bi bi-facebook fs-5"></i>
            </a>
            <a
              href="tel:+84123456789"
              className="text-white text-decoration-none small ms-3 fs-6"
              aria-label="Hotline"
            >
              📞 +84 123456789
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
