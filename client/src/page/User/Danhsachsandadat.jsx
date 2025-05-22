import React, { useEffect, useState } from "react";
import { getDanhSachDaDat } from "../../services/api";

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
  console.log(list);
  if (loading) return <div>Loading...</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-primary fw-bold">DANH SÁCH SÂN ĐÃ ĐẶT</h2>
      {list.length === 0 ? (
        <div className="text-center text-muted">Bạn chưa đặt sân nào.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead>
              <tr>
                <th>STT</th>
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
                  <td>{idx + 1}</td>
                  <td>{item.sanBong?.tenSan || ""}</td>
                  <td>{item.sanBong?.diaChi || ""}</td>
                  <td>{item.khungGio}</td>
                  <td>{item.ngayDat ? new Date(item.ngayDat).toLocaleDateString() : ""}</td>
                  <td>{item.ghiChu}</td>
                  <td>
                    <span
                      className={
                        "badge me-1 " +
                        (item.daXacNhan
                          ? "bg-success"
                          : "bg-warning")
                      }
                    >
                      {item.daXacNhan ? "Đã xác nhận" : "Chờ xác nhận"}
                    </span>
                    <span
                      className={
                        "badge " +
                        (item.trangThaiThanhToan === "Đã thanh toán"
                          ? "bg-success"
                          : "bg-secondary")
                      }
                    >
                      {item.trangThaiThanhToan}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Danhsachsandadat;