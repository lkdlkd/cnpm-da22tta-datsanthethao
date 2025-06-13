import React, { useEffect, useState } from "react";
import { getUsers, xoaUser, updateUser } from "../../services/api";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

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
      <h2 className="mb-4 text-primary">
        <i className="bi bi-people-fill me-2"></i>Quản lý khách hàng
      </h2>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm khách hàng"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: "400px" }}
            />
          </div>
        </Card.Body>
      </Card>
      <Card className="shadow-sm">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Chức vụ</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user._id || idx}>
                    <td>{idx + 1}</td>
                    <td>{user.hoTen}</td>
                    <td>{user.email}</td>
                    <td>{user.soDienThoai}</td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                        : ""}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.trangThai === "Hoạt động"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {user.trangThai}
                      </span>
                    </td>
                    <td>{user.role}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(user._id)}
                      >
                        Xóa
                      </Button>{" "}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleShowUpdate(user)}
                      >
                        Cập nhật
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

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
                <Button
                  variant="close"
                  onClick={() => setShowModal(false)}
                ></Button>
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
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Đóng
                </Button>
                <Button type="submit" variant="primary">
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;