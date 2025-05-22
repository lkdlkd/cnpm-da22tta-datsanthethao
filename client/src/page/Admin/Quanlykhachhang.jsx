import React, { useEffect, useState } from "react";
import { getUsers, xoaUser, updateUser } from "../../services/api";
import "../../App.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
    trangThai: "",
  });

  // Lấy danh sách user
  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xóa user
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await xoaUser(id);
        fetchUsers();
      } catch (err) {
        alert("Xóa thất bại!");
      }
    }
  };

  // Hiện modal cập nhật
  const handleShowUpdate = (user) => {
    setEditUser(user);
    setEditForm({
      hoTen: user.hoTen || "",
      email: user.email || "",
      soDienThoai: user.soDienThoai || "",
      trangThai: user.trangThai || "",
    });
    setShowModal(true);
  };

  // Xử lý cập nhật user
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editUser._id, editForm);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert("Cập nhật thất bại!");
    }
  };

  // Lọc theo từ khóa tìm kiếm
  const filteredUsers = users.filter(
    (u) =>
      u.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
      u.soDienThoai?.includes(search) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="container py-4">
      <h2 className="mb-3" style={{ fontSize: "2rem", fontWeight: 700 }}>
        QUẢN LÍ KHÁCH HÀNG
      </h2>
      <form
        className="mb-3 d-flex align-items-center"
        role="search"
        aria-label="Search customers"
        style={{ maxWidth: 400 }}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Tìm kiếm khách hàng"
            aria-label="Tìm kiếm khách hàng"
            style={{ fontSize: "1.2rem" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </form>
      <div className="table-responsive">
        <table
          className="table table-bordered mb-0"
          style={{ borderColor: "#999", fontSize: "1.25rem", minWidth: 1100 }}
        >
          <thead>
            <tr style={{ fontSize: "1.15rem" }}>
              <th scope="col">STT</th>
              <th scope="col">Họ tên</th>
              <th scope="col">Email</th>
              <th scope="col">Số điện thoại</th>
              <th scope="col">Thời gian</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Chức vụ</th>
              <th scope="col">Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center" style={{ fontSize: "1.1rem" }}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, idx) => (
                <tr key={user._id || idx}>
                  <td data-label="STT">{idx + 1}</td>
                  <td data-label="Họ tên" className="text-start">
                    {user.hoTen}
                  </td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Số điện thoại">{user.soDienThoai}</td>
                  <td data-label="Thời gian">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                      : ""}
                  </td>
                  <td data-label="Trạng thái">
                    <span
                      className={
                        "badge px-2 py-1 " +
                        (user.trangThai === "Hoạt động"
                          ? "bg-success"
                          : user.trangThai === "Đã Khóa" || user.trangThai === "Đã khóa"
                            ? "bg-danger"
                            : "bg-secondary")
                      }
                      style={{ fontWeight: 600, fontSize: "1.1rem" }}
                    >
                      {user.trangThai}
                    </span>
                  </td>
                  <td style={{ fontSize: "1.1rem" }}>{user.role}</td>
                  <td data-label="Chức năng">
                    <button
                      type="button"
                      className="btn-delete"
                      style={{ fontSize: "1.1rem" }}
                      onClick={() => handleDelete(user._id)}
                    >
                      Xóa
                    </button>
                    <button
                      type="button"
                      className="btn-active"
                      style={{ fontSize: "1.1rem" }}
                      onClick={() => handleShowUpdate(user)}
                    >
                      Cập nhật
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal cập nhật */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleUpdate}>
              <div className="modal-header">
                <h5 className="modal-title">Cập nhật khách hàng</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Họ tên</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.hoTen}
                    onChange={(e) =>
                      setEditForm({ ...editForm, hoTen: e.target.value })
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.soDienThoai}
                    onChange={(e) =>
                      setEditForm({ ...editForm, soDienThoai: e.target.value })
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Trạng thái</label>
                  <select
                    className="form-select"
                    value={editForm.trangThai}
                    onChange={(e) =>
                      setEditForm({ ...editForm, trangThai: e.target.value })
                    }
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Đã khóa">Khóa</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Đóng
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;