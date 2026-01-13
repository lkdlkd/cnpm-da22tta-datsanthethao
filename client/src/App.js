import React from "react";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./components/AuthContext";
import { Login } from "./page/Login";
import { Register } from "./page/Register";
import Home from "./page/Home";
import Quanlykhachhang from "./page/Admin/Quanlykhachhang";
import LayoutUser from "./components/LayoutUser";
import LayoutAdmin from "./components/AdminLayout ";
import Quanlysan from "./page/Admin/Quanlysan";
import Quanlykhungio from "./page/Admin/Quanlykhungio";
import Quanlydatsan from "./page/Admin/Quanlydatsan";
import Quanlydichvu from "./page/Admin/Quanlydichvu";
import Quanlydanhgia from "./page/Admin/Quanlydanhgia";
import DatSan from "./page/User/DatSan";
import Danhsachsan from "./page/User/Danhsachsan";
import Danhsachsandadat from "./page/User/Danhsachsandadat";
import DichVu from "./page/User/DichVu";
import Lienhe from "./page/User/Lienhe";
import ChinhSach from "./page/User/ChinhSach";
import GioiThieu from "./page/User/GioiThieu";
import FieldDetail from "./components/FieldDetail";
import BookingForm from "./components/BookingForm";
import Thongtincanhan from "./page/User/Thongtincanhan";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes không có Layout */}
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />

          {/* Routes cho User Layout */}
          <Route
            path="/"
            element={
              <AuthContext.Consumer>
                {({ auth }) =>
                  auth.token ? <LayoutUser /> : <Navigate to="/dang-nhap" />
                }
              </AuthContext.Consumer>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/field/:id" element={<FieldDetail />} />
            <Route path="/booking" element={<BookingForm />} />
            <Route path="/thong-tin-ca-nhan" element={<Thongtincanhan />} />
            <Route path="/dat-san/:id" element={<DatSan />} />
            <Route path="/danh-sach-san-da-dat" element={<Danhsachsandadat />} />
            <Route path="/danh-sach-san" element={<Danhsachsan />} />
            <Route path="/dich-vu" element={<DichVu />} />
            <Route path="/lien-he" element={<Lienhe />} />
            <Route path="/chinh-sach" element={<ChinhSach />} />
            <Route path="/gioi-thieu" element={<GioiThieu />} />
          </Route>

          {/* Routes cho Admin Layout */}
          <Route
            path="/admin"
            element={
              <AuthContext.Consumer>
                {({ auth }) =>
                  auth.token && auth.role === "admin" ? (
                    <LayoutAdmin />
                  ) : (
                    <Navigate to="/dang-nhap" />
                  )
                }
              </AuthContext.Consumer>
            }
          >
            <Route path="/admin/quan-ly-khach-hang" element={<Quanlykhachhang />} />
            <Route index element={<Navigate to="/admin/quan-ly-khach-hang" replace />} />
            <Route path="/admin/quan-ly-khung-gio" element={<Quanlykhungio />} />
            <Route path="/admin/quan-ly-san" element={<Quanlysan />} />
            <Route path="/admin/quan-ly-dat-san" element={<Quanlydatsan />} />
            <Route path="/admin/quan-ly-dich-vu" element={<Quanlydichvu />} />
            <Route path="/admin/quan-ly-danh-gia" element={<Quanlydanhgia />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
