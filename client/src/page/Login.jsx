import React, { useState, useContext } from 'react';
import { loginUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import { AuthContext } from '../components/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateAuth } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await loginUser(email, password);

      if (!token) {
        throw new Error("Token không tồn tại");
      }

      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Token không hợp lệ");
      }

      const decoded = JSON.parse(atob(tokenParts[1]));

      const role = decoded.role;
      if (!role) {
        throw new Error("Role không tồn tại trong token");
      }
      localStorage.setItem("token", token);
      updateAuth({ token, role });

      setTimeout(() => {
        setLoading(false);
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 800);
    } catch (error) {
      setLoading(false);
      setError(error.message || "Đăng nhập thất bại!");
      console.error("Login error:", error);
    }
  };

  return (
    <>
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div
        className="login-wrap d-flex flex-wrap justify-content-center
             align-items-md-center align-items-start 
             min-vh-100 overflow-auto"
      >
        <div className="container">
          <div className="row g-0">
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
            <div className="col-12 col-md-6">
              <div className="card p-3 p-md-4 p-xl-5">
                <div className="row">
                  <div className="col-12">
                    <div className="mb-5">
                      <h2 className="text-center text-primary">Đăng nhập</h2>
                    </div>
                    {error && (
                      <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError('')}></button>
                      </div>
                    )}
                  </div>
                </div>
                <form onSubmit={handleLogin}>
                  <div className="row gy-3 gy-md-4">
                    <div className="col-12">
                      <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="password" className="form-label">Mật khẩu <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="form-check d-flex align-items-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value=""
                            name="remember_me"
                            id="remember_me"
                          />
                          <label
                            className="form-check-label text-secondary ms-2"
                            htmlFor="remember_me"
                          >
                            Nhớ tài khoản
                          </label>
                        </div>
                        <a href="#!" className="text-secondary text-decoration-none" onClick={(e) => {
                          e.preventDefault();
                          alert("Liên hệ admin để khôi phục mật khẩu");
                        }}>
                          Quên mật khẩu?
                        </a>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-grid">
                        <button className="btn bsb-btn-xl btn-primary" type="submit">Đăng nhập</button>
                      </div>
                    </div>
                    <div className="font-16 weight-600 pt-10 pb-10 text-center">HOẶC</div>
                    <div className="col-12">
                      <div className="d-grid">
                        <Link className="btn btn-outline-primary btn-block" to="/dang-ky">Chưa có tài khoản</Link>
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
