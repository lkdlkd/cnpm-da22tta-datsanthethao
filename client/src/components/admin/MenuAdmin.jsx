import "../../App.css";
import React from "react";
import { Link } from "react-router-dom";

function MenuAdmin() {
  return (
    <aside className="sidebar d-flex flex-column align-items-center py-4 bg-light shadow-sm" style={{ minHeight: "100vh" }}>
      <img
        alt="Company logo with pink background and white stylized figure"
        src="/img/logo.jpg"
        loading="lazy"
        className="mb-3 rounded-circle border"
        style={{ width: 80, height: 80, objectFit: "cover" }}
      />
      <nav className="nav flex-column w-100">
        <Link className="nav-link text-dark fw-semibold" to="/home">
          <i className="bi bi-arrow-left me-2"></i>TRỞ VỀ TRANG CHỦ
        </Link>
        <Link className="nav-link text-dark fw-semibold" to="/admin/quan-ly-khach-hang">
          <i className="bi bi-house-door me-2"></i>QUẢN LÝ KHÁCH HÀNG
        </Link>
        <Link className="nav-link text-dark fw-semibold" to="/admin/quan-ly-san">
          <i className="bi bi-people me-2"></i>QUẢN LÝ SÂN
        </Link>
        <Link className="nav-link text-dark fw-semibold" to="/admin/quan-ly-dat-san">
          <i className="bi bi-grid-3x3-gap me-2"></i>QUẢN LÍ ĐẶC SÂN
        </Link>
      </nav>
    </aside>
  );
}

export default MenuAdmin;
