import React, { useState, useEffect } from "react";
import { capNhatThongTinCaNhan, doiMatKhau, getUsers } from "../../services/api";
import Swal from "sweetalert2";

const Thongtincanhan = () => {
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
  });

  const [passwordData, setPasswordData] = useState({
    matKhauCu: "",
    matKhauMoi: "",
    xacNhanMatKhau: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUsers();
        setFormData({
          hoTen: userInfo.users.hoTen || "",
          email: userInfo.users.email || "",
          soDienThoai: userInfo.users.soDienThoai || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể tải thông tin cá nhân.",
        });
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await capNhatThongTinCaNhan(formData);
      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công!",
        text: "Thông tin cá nhân của bạn đã được cập nhật.",
      });
      console.log("Thông tin đã cập nhật:", response);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại!",
        text: error.message || "Có lỗi xảy ra khi cập nhật thông tin.",
      });
      console.error("Lỗi khi cập nhật thông tin:", error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.matKhauMoi !== passwordData.xacNhanMatKhau) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
      });
      return;
    }

    try {
      const response = await doiMatKhau(passwordData);
      Swal.fire({
        icon: "success",
        title: "Đổi mật khẩu thành công!",
        text: "Mật khẩu của bạn đã được cập nhật.",
      });
      console.log("Mật khẩu đã đổi:", response);
      setPasswordData({ matKhauCu: "", matKhauMoi: "", xacNhanMatKhau: "" });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Đổi mật khẩu thất bại!",
        text: error.message || "Có lỗi xảy ra khi đổi mật khẩu.",
      });
      console.error("Lỗi khi đổi mật khẩu:", error);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="text-center text-primary mb-4">Quản lý tài khoản</h2>
      <div className="row">
        {/* Form cập nhật thông tin cá nhân */}
        <div className="col-12 col-md-6">
          <h4 className="text-primary mb-3">Cập nhật thông tin cá nhân</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="hoTen" className="form-label">
                Họ tên
              </label>
              <input
                type="text"
                className="form-control"
                id="hoTen"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="soDienThoai" className="form-label">
                Số điện thoại
              </label>
              <input
                type="text"
                className="form-control"
                id="soDienThoai"
                name="soDienThoai"
                value={formData.soDienThoai}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Cập nhật
            </button>
          </form>
        </div>

        {/* Form đổi mật khẩu */}
        <div className="col-12 col-md-6">
          <h4 className="text-primary mb-3">Đổi mật khẩu</h4>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label htmlFor="matKhauCu" className="form-label">
                Mật khẩu cũ
              </label>
              <input
                type="password"
                className="form-control"
                id="matKhauCu"
                name="matKhauCu"
                value={passwordData.matKhauCu}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="matKhauMoi" className="form-label">
                Mật khẩu mới
              </label>
              <input
                type="password"
                className="form-control"
                id="matKhauMoi"
                name="matKhauMoi"
                value={passwordData.matKhauMoi}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="xacNhanMatKhau" className="form-label">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                className="form-control"
                id="xacNhanMatKhau"
                name="xacNhanMatKhau"
                value={passwordData.xacNhanMatKhau}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-danger w-100">
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Thongtincanhan;