import React, { useEffect, useState } from "react";
import { getDanhSachDaDat, adminXacNhanDatSan } from "../../services/api";
import Swal from "sweetalert2";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

const Quanlydatsan = () => {
  const [datSans, setDatSans] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Lấy danh sách đặt sân
  const fetchDatSans = async () => {
    try {
      const data = await getDanhSachDaDat();
      // Nếu API trả về mảng trực tiếp
      if (Array.isArray(data)) {
        setDatSans(data);
      }
      // Nếu API trả về object có thuộc tính danhSachDatSan là mảng
      else if (Array.isArray(data.danhSachDatSan)) {
        setDatSans(data.danhSachDatSan);
      } else {
        setDatSans([]);
      }
    } catch (err) {
      setDatSans([]);
    }
  };

  useEffect(() => {
    fetchDatSans();
  }, []);

  // Xác nhận hoặc hủy đặt sân
  const handleAction = async (id, datSan, action) => {
    const isXacNhan = action === "xacnhan";
    const result = await Swal.fire({
      title: isXacNhan ? "Xác nhận đặt sân này?" : "Hủy xác nhận đặt sân này?",
      icon: isXacNhan ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: isXacNhan ? "Xác nhận" : "Hủy xác nhận",
      cancelButtonText: "Đóng",
      confirmButtonColor: isXacNhan ? "#3085d6" : "#d33",
      cancelButtonColor: "#6c757d",
    });
    if (result.isConfirmed) {
      try {
        await adminXacNhanDatSan(id, {
          ...datSan,
          daXacNhan: isXacNhan,
          trangThai: isXacNhan ? "Đã xác nhận" : "Đã hủy",
        });
        fetchDatSans();
        Swal.fire(
          isXacNhan ? "Thành công!" : "Đã hủy!",
          isXacNhan ? "Đã xác nhận đặt sân." : "Đã hủy xác nhận đặt sân.",
          "success"
        );
      } catch (err) {
        Swal.fire("Lỗi!", "Thao tác thất bại!", "error");
      }
    }
  };

  // Cập nhật trạng thái thanh toán
  const handleUpdateThanhToan = async (item, trangThaiThanhToan) => {
    const result = await Swal.fire({
      title:
        trangThaiThanhToan === "Đã thanh toán"
          ? "Xác nhận đã thanh toán?"
          : "Chuyển về chưa thanh toán?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });
    if (result.isConfirmed) {
      try {
        await adminXacNhanDatSan(item._id, {
          ...item,
          trangThaiThanhToan,
        });
        fetchDatSans();
        Swal.fire(
          "Thành công!",
          "Cập nhật trạng thái thanh toán thành công.",
          "success"
        );
      } catch (err) {
        Swal.fire("Lỗi!", "Cập nhật trạng thái thanh toán thất bại!", "error");
      }
    }
  };

  // Lọc theo từ khóa tìm kiếm
  const filtered = datSans.filter(
    (d) =>
      d.sanBong?.tenSan?.toLowerCase().includes(search.toLowerCase()) ||
      d.sanBong?.diaChi?.toLowerCase().includes(search.toLowerCase()) ||
      d.nguoiDat?.hoTen?.toLowerCase().includes(search.toLowerCase()) || // <-- sửa đúng tên trường
      d.nguoiDat?.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.nguoiDat?.soDienThoai?.includes(search) ||
      String(d.nguoiDat?._id || d.nguoiDat).includes(search)
  );

  // Phân trang
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
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
        <i className="bi bi-calendar-check me-2"></i>Quản lý đặt sân
      </h2>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm theo tên sân, khách, SĐT"
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
            <thead className="table-light">
              <tr style={{ fontSize: "1.15rem" }}>
                <th>STT</th>
                <th>Tên sân</th>
                <th>Loại sân</th>
                <th>Mã khách</th>
                <th>Địa chỉ sân</th>
                <th>Khung giờ</th>
                <th>Ngày đặt</th>
                <th>Ghi chú</th>
                <th>Trạng thái</th>
                <th>thanh toán</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center text-muted py-4"
                    style={{ fontSize: "1.15rem" }}
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="fw-semibold">{item.sanBong?.tenSan}</td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {item.sanBong?.loaiSan}
                      </span>
                    </td>
                    <td>
                      {item.nguoiDat?.hoTen}
                      <br />
                      <span className="text-muted small">
                        {item.nguoiDat?.email}
                      </span>
                      <br />
                      <span className="text-muted small">
                        {item.nguoiDat?.soDienThoai}
                      </span>
                    </td>
                    <td>{item.sanBong?.diaChi}</td>
                    <td>
                      <span className="badge bg-secondary">{item.khungGio}</span>
                    </td>
                    <td>
                      {item.ngayDat
                        ? new Date(item.ngayDat).toLocaleDateString("vi-VN")
                        : ""}
                    </td>
                    <td>
                      {item.ghiChu || "Không có ghi chú"}
                      <br />
                      {item.trangThai === "Đã hủy" && (
                        <span className="text-danger">
                          Đặt sân đã bị hủy
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={
                          "badge " +
                          (item.trangThai === "Đã xác nhận" || item.daXacNhan
                            ? "bg-success"
                            : item.trangThai === "Đã hủy"
                              ? "bg-danger"
                              : "bg-warning text-dark")
                        }
                      >
                        {item.trangThai === "Đã xác nhận" || item.daXacNhan
                          ? "Đã xác nhận"
                          : item.trangThai === "Đã hủy"
                            ? "Đã hủy"
                            : "Chờ xác nhận"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          "badge " +
                          (item.trangThaiThanhToan === "Đã thanh toán"
                            ? "bg-success"
                            : item.trangThaiThanhToan === "Chưa thanh toán"
                              ? "bg-danger"
                              : "bg-warning text-dark")
                        }
                        style={{ cursor: "pointer" }}
                        title="Bấm để cập nhật trạng thái thanh toán"
                        onClick={() =>
                          handleUpdateThanhToan(
                            item,
                            item.trangThaiThanhToan === "Đã thanh toán"
                              ? "Chưa thanh toán"
                              : "Đã thanh toán"
                          )
                        }
                      >
                        {item.trangThaiThanhToan || "Chưa thanh toán"}
                      </span>
                      {/* {item.trangThaiThanhToan !== "Đã thanh toán" && (
                        <Button
                          className="mt-1"
                          variant={
                            item.trangThaiThanhToan === "Đã thanh toán"
                              ? "success"
                              : "danger"
                          }
                          size="sm"
                          onClick={() => handleUpdateThanhToan(item, "Đã thanh toán")}
                        >
                          Đã thanh toán
                        </Button>
                      )} */}
                    </td>
                    <td>
                      {!item.daXacNhan && item.trangThai !== "Đã hủy" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAction(item._id, item, "xacnhan")}
                        >
                          Xác nhận
                        </Button>
                      )}
                      {item.daXacNhan && item.trangThai !== "Đã hủy" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleAction(item._id, item, "huy")}
                        >
                          Hủy xác nhận
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      {/* Phân trang */}
      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                &laquo;
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item${currentPage === i + 1 ? " active" : ""
                  }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item${currentPage === totalPages ? " disabled" : ""
                }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                &raquo;
              </button>
            </li>
          </ul>
        </nav>
      )}
    </main>
  );
};

export default Quanlydatsan;