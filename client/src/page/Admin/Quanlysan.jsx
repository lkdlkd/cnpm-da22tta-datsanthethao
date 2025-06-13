import React, { useEffect, useState } from "react";
import { getDanhSachSan, themSan, suaSan, xoaSan, uploadImage } from "../../services/api";
import Swal from "sweetalert2";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

const url = "http://localhost:5000"; // URL gốc của backend
const defaultForm = {
  tenSan: "",
  loaiSan: "5 người",
  diaChi: "",
  hinhAnh: "",
  giaTheoKhungGio: [],
  tinhTrang: "Đang hoạt động",
  Danhmuc: "",
};

const Quanlysan = () => {
  const [fields, setFields] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editField, setEditField] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageUrl, setImageUrl] = useState(""); // Lưu URL ảnh đã upload

  const pageSize = 10;

  // Lấy danh sách sân bóng
  const fetchFields = async () => {
    try {
      const data = await getDanhSachSan();
      setFields(Array.isArray(data) ? data : []);
    } catch (err) {
      setFields([]);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // Xóa sân bóng
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn xóa sân này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });
    if (result.isConfirmed) {
      try {
        await xoaSan(id);
        fetchFields();
        Swal.fire("Đã xóa!", "Sân đã được xóa thành công.", "success");
      } catch (err) {
        Swal.fire("Lỗi!", "Xóa thất bại!", "error");
      }
    }
  };

  // Hiện modal cập nhật/thêm mới
  const handleShowUpdate = (field) => {
    setEditField(field);
    setEditForm(field ? { ...field } : defaultForm);
    setShowModal(true);
  };

  // Xử lý thêm/sửa sân bóng
  const handleUpdate = async (e) => {
    e.preventDefault();
    const isEdit = editField && editField._id;
    const confirmResult = await Swal.fire({
      title: isEdit ? "Xác nhận sửa sân?" : "Xác nhận thêm sân?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isEdit ? "Sửa" : "Thêm",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });
    if (confirmResult.isConfirmed) {
      try {
        if (isEdit) {
          await suaSan(editField._id, editForm);
        } else {
          await themSan(editForm);
        }
        setShowModal(false);
        fetchFields();
        Swal.fire(
          isEdit ? "Đã sửa!" : "Đã thêm!",
          isEdit ? "Sân đã được cập nhật." : "Sân đã được thêm mới.",
          "success"
        );
      } catch (err) {
        Swal.fire("Lỗi!", "Lưu thất bại!", "error");
      }
    }
  };

  // Tải ảnh lên
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await uploadImage(file);
      setEditForm({ ...editForm, hinhAnh: data.url });
      setImageUrl(`${url}${data.url}`);
      Swal.fire("Thành công!", "Ảnh đã được tải lên.", "success");
    } catch (err) {
      Swal.fire("Lỗi!", err.message || "Không thể tải ảnh lên.", "error");
    }
  };

  // Lọc theo từ khóa tìm kiếm
  const filteredFields = fields.filter(
    (f) =>
      f.tenSan?.toLowerCase().includes(search.toLowerCase()) ||
      f.diaChi?.toLowerCase().includes(search.toLowerCase())
  );

  // Phân trang
  const totalPages = Math.ceil(filteredFields.length / pageSize);
  const paginatedFields = filteredFields.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Khi search thay đổi thì về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <main className="container py-4">
      <h2 className="mb-4 text-primary">
        <i className="bi bi-house-door-fill me-2"></i>Quản lý sân bóng
      </h2>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm sân bóng"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: "400px" }}
            />
            <Button variant="primary" onClick={() => handleShowUpdate(null)}>
              Thêm sân
            </Button>
          </div>
        </Card.Body>
      </Card>
      <Card className="shadow-sm">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>STT</th>
                <th>ID Sân</th>
                <th>Tên sân</th>
                <th>Loại sân</th>
                <th>Danh mục</th>
                <th>Địa chỉ</th>
                <th>Hình ảnh</th>
                <th>Tình trạng</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFields.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                paginatedFields.map((field, idx) => (
                  <tr key={field._id || idx}>
                    <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td>{field._id}</td>
                    <td>{field.tenSan}</td>
                    <td>{field.loaiSan}</td>
                    <td>{field.Danhmuc}</td>
                    <td>{field.diaChi}</td>
                    <td>
                      {field.hinhAnh && (
                        <img
                          src={`${url}${field.hinhAnh}`}
                          alt={field.tenSan}
                          className="rounded"
                          style={{ width: 80, height: 50, objectFit: "cover" }}
                        />
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${field.tinhTrang === "Đang hoạt động"
                            ? "bg-success"
                            : "bg-warning"
                          }`}
                      >
                        {field.tinhTrang}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleShowUpdate(field)}
                      >
                        Sửa
                      </Button>{" "}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(field._id)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
              <Button
                variant="link"
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                &laquo;
              </Button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item${currentPage === i + 1 ? " active" : ""
                  }`}
              >
                <Button
                  variant="link"
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              </li>
            ))}
            <li
              className={`page-item${currentPage === totalPages ? " disabled" : ""
                }`}
            >
              <Button
                variant="link"
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                &raquo;
              </Button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal thêm/sửa sân */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleUpdate}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {editField ? "Sửa sân bóng" : "Thêm sân bóng"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Tên sân</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.tenSan}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tenSan: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Loại sân</label>
                  <select
                    className="form-select"
                    value={editForm.loaiSan}
                    onChange={(e) =>
                      setEditForm({ ...editForm, loaiSan: e.target.value })
                    }
                  >
                    <option value="2 người">2 người</option>
                    <option value="5 người">5 người</option>
                    <option value="7 người">7 người</option>
                    <option value="11 người">11 người</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Địa chỉ</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.diaChi}
                    onChange={(e) =>
                      setEditForm({ ...editForm, diaChi: e.target.value })
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Hình ảnh</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e)}
                  />
                  {editForm.hinhAnh && (
                    <img
                      //src={`${url}${san?.hinhAnh}`}

                      src={`${url}${editForm.hinhAnh}`} // Sử dụng editForm.hinhAnh thay vì san?.hinhAnh
                      alt="Preview"
                      className="mt-2 rounded border"
                      style={{ width: 90, height: 60, objectFit: "cover" }}
                    />
                  )}
                </div>
                <div className="mb-2">
                  <label className="form-label">Tình trạng</label>
                  <select
                    className="form-select"
                    value={editForm.tinhTrang}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tinhTrang: e.target.value })
                    }
                  >
                    <option value="Đang hoạt động">Đang hoạt động</option>
                    <option value="Bảo trì">Bảo trì</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Danh mục</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.Danhmuc || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, Danhmuc: e.target.value })
                    }
                    placeholder="Nhập danh mục (vd: Sân cỏ nhân tạo, Sân mini...)"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Khung giờ & Giá</label>
                  {editForm.giaTheoKhungGio && editForm.giaTheoKhungGio.length > 0 && (
                    <ul className="list-group mb-2">
                      {editForm.giaTheoKhungGio.map((g, i) => (
                        <li key={i} className="list-group-item d-flex align-items-center gap-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Khung giờ (vd: 06:00-07:30)"
                            style={{ maxWidth: 140 }}
                            value={g.khungGio}
                            onChange={e => {
                              const arr = [...editForm.giaTheoKhungGio];
                              arr[i].khungGio = e.target.value;
                              setEditForm({ ...editForm, giaTheoKhungGio: arr });
                            }}
                          />
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Giá"
                            style={{ maxWidth: 100 }}
                            value={g.gia}
                            onChange={e => {
                              const arr = [...editForm.giaTheoKhungGio];
                              arr[i].gia = e.target.value;
                              setEditForm({ ...editForm, giaTheoKhungGio: arr });
                            }}
                          />
                          <select
                            className="form-select"
                            style={{ maxWidth: 110 }}
                            value={g.Trangthai}
                            onChange={e => {
                              const arr = [...editForm.giaTheoKhungGio];
                              arr[i].Trangthai = e.target.value;
                              setEditForm({ ...editForm, giaTheoKhungGio: arr });
                            }}
                          >
                            <option value="Còn sân">Còn sân</option>
                            <option value="Hết sân">Hết sân</option>
                          </select>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              const arr = [...editForm.giaTheoKhungGio];
                              arr.splice(i, 1);
                              setEditForm({ ...editForm, giaTheoKhungGio: arr });
                            }}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      setEditForm({
                        ...editForm,
                        giaTheoKhungGio: [
                          ...editForm.giaTheoKhungGio,
                          { khungGio: "", gia: "", Trangthai: "Còn sân" },
                        ],
                      })
                    }
                  >
                    <i className="bi bi-plus-circle"></i> Thêm khung giờ
                  </button>
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

export default Quanlysan;