import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api'; // Import hàm đăng ký từ api.js

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ hoTen: "", email: "", matKhau: "", soDienThoai: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gọi API đăng ký
      await registerUser(form);
      setMessage("Đăng ký thành công!");
      setTimeout(() => {
        navigate('/dang-nhap'); // Chuyển hướng đến trang đăng nhập
      }, 1000);
    } catch (error) {
      setMessage(error.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="login-wrap d-flex flex-wrap justify-content-center align-items-md-center align-items-start min-vh-100 overflow-auto">
        <div className="container">
          
          <div className="row g-0">
             {/* Bên hình */}
             <div className="col-12 col-md-6">
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="col-12 py-3">
                  <img
                    className="img-fluid rounded mb-4"
                    style={{ maxWidth: "90%" }}
                    loading="lazy"
                    src="/img/banner-login.png"
                    alt="banner"
                  />
                </div>
              </div>
            </div>
            {/* Bên form */}
            <div className="col-12 col-md-6">
              <div className="card p-3 p-md-4 p-xl-5">
                <div className="row">
                  <div className="col-12">
                    <div className="mb-5">
                      <h2 className="text-center text-primary">Đăng ký</h2>
                    </div>
                    {message && (
                      <div className={`alert ${message.includes("thành công") ? "alert-success" : "alert-danger"} alert-dismissible fade show`} role="alert">
                        {message}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setMessage('')}></button>
                      </div>
                    )}
                  </div>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="row gy-3 gy-md-4">
                    <div className="col-12">
                      <label htmlFor="hoTen" className="form-label">Họ tên <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        type="text"
                        name="hoTen"
                        value={form.hoTen}
                        onChange={handleChange}
                        placeholder="Nhập họ tên"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Nhập email"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="matKhau" className="form-label">Mật khẩu <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        type="password"
                        name="matKhau"
                        value={form.matKhau}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="soDienThoai" className="form-label">Số điện thoại <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        type="text"
                        name="soDienThoai"
                        value={form.soDienThoai}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <div className="d-grid">
                        <button className="btn bsb-btn-xl btn-primary" type="submit">Đăng ký</button>
                      </div>
                    </div>
                    <div className="font-16 weight-600 pt-10 pb-10 text-center">HOẶC</div>
                    <div className="col-12">
                      <div className="d-grid">
                        <Link className="btn btn-outline-primary btn-block" to="/dang-nhap">Đã có tài khoản</Link>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
           
          </div>
        </div>
      </div>
    </>
  );
};

