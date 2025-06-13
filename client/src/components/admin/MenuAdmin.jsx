// import "../../App.css";
import React from "react";
import { Link } from "react-router-dom";

function MenuAdmin() {
  return (
    <aside
      className="sidebar d-flex flex-column align-items-center py-4 bg-light shadow-sm"
      style={{ minHeight: "100vh", width: "250px" }}
    >
      {/* Logo */}
      <div className="text-center mb-4">
        <img
          alt="Company logo"
          src="/img/logo.jpg"
          loading="lazy"
          className="rounded-circle border"
          style={{ width: 80, height: 80, objectFit: "cover" }}
        />
        <h5 className="mt-2 fw-bold text-primary">ADMIN QUẢN LÝ</h5>
      </div>

      {/* Navigation */}
      <nav className="nav flex-column w-100">
        <Link className="nav-link text-dark fw-semibold py-2" to="/home">
          <i className="bi bi-arrow-left me-2"></i>Trở về trang chủ
        </Link>
        <Link className="nav-link text-dark fw-semibold py-2" to="/admin/quan-ly-khach-hang">
          <i className="bi bi-people me-2"></i>Quản lý khách hàng
        </Link>
        <Link className="nav-link text-dark fw-semibold py-2" to="/admin/quan-ly-san">
          <i className="bi bi-house-door me-2"></i>Quản lý sân
        </Link>
        <Link className="nav-link text-dark fw-semibold py-2" to="/admin/quan-ly-dat-san">
          <i className="bi bi-grid-3x3-gap me-2"></i>Quản lý đặt sân
        </Link>
      </nav>
    </aside>
  );
}

export default MenuAdmin;
