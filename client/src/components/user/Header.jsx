import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDanhSachSan } from "../../services/api";
import Card from "react-bootstrap/Card";

const Header = ({ users }) => {
  const [danhMucList, setDanhMucList] = useState([]);
  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Trạng thái dropdown
  const navigate = useNavigate();

  useEffect(() => {
    getDanhSachSan().then((data) => {
      const list = Array.from(new Set((data || []).map((f) => f.Danhmuc).filter(Boolean)));
      setDanhMucList(list);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      const matched = danhMucList.find(
        (dm) => dm.toLowerCase() === search.trim().toLowerCase()
      );
      if (matched) {
        navigate(`/danh-sach-san?danhmuc=${encodeURIComponent(matched)}`);
      } else {
        navigate(`/danh-sach-san?search=${encodeURIComponent(search.trim())}`);
      }
    }
  };

  return (
    <header className="bg-white border-bottom shadow-sm">
      {/* Logo và Navigation */}
      <div className="container-fluid py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <a href="/home">
            <img
              src="/img/logo.png"
              alt="Logo"
              className="logo me-3"
              style={{ height: 100, width: "auto", objectFit: "contain" }}
            />
          </a>
          <nav className="d-none d-md-flex gap-4">
            <a href="/home" className="nav-link text-danger fw-bold">Trang chủ</a>
            <a href="/danh-sach-san" className="nav-link">Danh sách sân bãi</a>
            <a href="/danh-sach-san-da-dat" className="nav-link">Danh sách sân đã đặt</a>

            <a href="/gioi-thieu" className="nav-link">Giới thiệu</a>
            <a href="/chinh-sach" className="nav-link">Chính sách</a>
            <a href="/lien-he" className="nav-link">Liên hệ</a>
          </nav>
        </div>

        {/* Search và User Actions */}
        <div className="d-none d-md-flex align-items-center gap-3">
          <form className="position-relative search-wrapper" onSubmit={handleSearch}>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Tìm sân thể thao"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "300px" }}
            />
            <button
              type="submit"
              className="btn btn-link p-0 position-absolute top-50 start-0 translate-middle-y ms-2"
            >
              <i className="bi bi-search search-icon"></i>
            </button>
          </form>
          {users ? (
            <div className="position-relative">
              <span
                className="fw-bold text-success cursor-pointer d-flex align-items-center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown
              >
                <img
                  src={`https://ui-avatars.com/api/?background=random&name=${users?.hoTen || "User"}`}
                  alt="user-avatar"
                  className="user-avatar rounded-circle me-2"
                  width={40}
                  height={40}
                />
                <span className="d-none d-md-inline">{users.hoTen}</span>
              </span>
              {isDropdownOpen && (
                <div
                  className={`position-absolute bg-white shadow border rounded ${
                    window.innerWidth < 768 ? "w-100 mt-2" : ""
                  }`}
                  style={{
                    inset: window.innerWidth < 768 ? "auto auto auto auto" : "0px 0px auto auto",
                    margin: 0,
                    transform: window.innerWidth < 768 ? "none" : "translate(0px, 61px)",
                    zIndex: 1050,
                  }}
                >
                  <Card className="shadow border-0" style={{ width: window.innerWidth < 768 ? "100%" : "300px" }}>
                    <Card.Header className="d-flex align-items-center justify-content-between bg-primary text-white">
                      <h5 className="m-0">Thông tin</h5>
                    </Card.Header>
                    <Card.Body>
                      <div
                        className="profile-notification-scroll position-relative"
                        style={{ maxHeight: "calc(100vh - 225px)", overflowY: "auto" }}
                      >
                        <div className="d-flex mb-3">
                          <div className="flex-shrink-0">
                            <img
                              src={`https://ui-avatars.com/api/?background=random&name=${users?.hoTen || "User"}`}
                              alt="user-avatar"
                              className="user-avatar rounded-circle"
                              width={50}
                              height={50}
                            />
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">{users?.hoTen || "Người dùng"}</h6>
                            <span className="badge bg-primary">{users?.capbac || ""}</span>
                          </div>
                        </div>
                        <hr className="border-secondary border-opacity-50" />
                        <a href="/thong-tin-ca-nhan" className="dropdown-item text-decoration-none">
                          <i className="ti ti-user me-2 text-muted"></i> Thông tin tài khoản
                        </a>
                        <a href="/danh-sach-san-da-dat" className="dropdown-item text-decoration-none">
                          <i className="ti ti-credit-card me-2 text-muted"></i>Danh sách sân đã đặt
                        </a>
                        <hr className="border-secondary border-opacity-50" />
                        <button
                          className="dropdown-item text-danger text-decoration-none"
                          onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/dang-nhap";
                          }}
                        >
                          <i className="ti ti-power me-2 text-muted"></i> Đăng xuất
                        </button>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex gap-2">
              <a href="/dang-nhap" className="btn btn-outline-dark btn-sm">
                <i className="bi bi-person"></i> Đăng nhập
              </a>
              <a href="/dang-ky" className="btn btn-dark btn-sm">
                <i className="bi bi-pencil"></i> Đăng ký
              </a>
            </div>
          )}
        </div>

        {/* Hamburger Menu */}
        <button
          className="navbar-toggler d-md-none border-0"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className="bi bi-list fs-3"></i>
        </button>
        
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-light py-2 border-top d-md-none">
          <nav className="d-flex flex-column gap-2 px-3">
            <a href="/home" className="nav-link text-danger fw-bold">Trang chủ</a>
            <a href="/danh-sach-san" className="nav-link">Danh sách sân bãi</a>
            <a href="/danh-sach-san-da-dat" className="nav-link">Danh sách sân đã đặt</a>

            <a href="/gioi-thieu" className="nav-link">Giới thiệu</a>
            <a href="/chinh-sach" className="nav-link">Chính sách</a>
            <a href="/lien-he" className="nav-link">Liên hệ</a>
          </nav>
          <form className="mt-3 px-3" onSubmit={handleSearch}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm sân thể thao"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary w-100 mt-2">
              Tìm kiếm
            </button>
          </form>
          
        </div>
      )}

      {/* Danh mục và Liên hệ */}
      <div className="bg-light py-2 border-top">
        <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap">
          <div className="d-flex gap-3 flex-wrap">
            {danhMucList.map((dm, idx) => (
              <a
                key={idx}
                href={`/danh-sach-san?danhmuc=${encodeURIComponent(dm)}`}
                className="text-dark text-decoration-none"
              >
                {dm}
              </a>
            ))}
          </div>
          <div className="d-flex align-items-center gap-3">
            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark"
              aria-label="Facebook"
            >
              <i className="bi bi-facebook fs-5"></i>
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark"
              aria-label="Instagram"
            >
              <i className="bi bi-instagram fs-5"></i>
            </a>
            <a
              href="tel:+84123456789"
              className="text-dark text-decoration-none"
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
