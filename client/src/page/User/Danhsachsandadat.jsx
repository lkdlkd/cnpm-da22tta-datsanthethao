import React, { useEffect, useState } from "react";
import { getDanhSachDaDat } from "../../services/api";
import Table from "react-bootstrap/Table";

const Danhsachsandadat = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await getDanhSachDaDat();
        setList(Array.isArray(data.danhSachDatSan) ? data.danhSachDatSan : []);
      } catch (err) {
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-primary fw-bold text-center">DANH SÁCH SÂN ĐÃ ĐẶT</h2>
      {list.length === 0 ? (
        <div className="text-center text-muted">Bạn chưa đặt sân nào.</div>
      ) : (
        <div >
          <Table bordered hover responsive >
            <thead >
              <tr>
                <th>#</th>
                <th>Tên sân</th>
                <th>Địa chỉ</th>
                <th>Khung giờ</th>
                <th>Ngày đặt</th>
                <th>Ghi chú</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, idx) => (
                <tr key={item._id || idx}>
                  <td className="fw-bold">{idx + 1}</td>
                  <td>{item.sanBong?.tenSan || "Không rõ"}</td>
                  <td>{item.sanBong?.diaChi || "Không rõ"}</td>
                  <td>{item.khungGio}</td>
                  <td>{item.ngayDat ? new Date(item.ngayDat).toLocaleDateString() : "Không rõ"}</td>
                  <td>{item.ghiChu || "Không có ghi chú"}</td>
                  <td>
                    <span
                      className={`badge me-1 ${
                        item.daXacNhan ? "bg-success" : "bg-warning"
                      }`}
                    >
                      {item.daXacNhan ? "Đã xác nhận" : "Chờ xác nhận"}
                    </span>
                    <span
                      className={`badge ${
                        item.trangThaiThanhToan === "Đã thanh toán"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {item.trangThaiThanhToan || "Chưa thanh toán"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Danhsachsandadat;