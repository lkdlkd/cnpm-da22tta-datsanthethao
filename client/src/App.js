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
import Quanlydatsan from "./page/Admin/Quanlydatsan";
import DatSan from "./page/User/DatSan";
import Danhsachsan from "./page/User/Danhsachsan";
import Danhsachsandadat from "./page/User/Danhsachsandadat";
import Lienhe from "./page/User/Lienhe";
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
            <Route path="/dat-san/:id" element={<DatSan />} />
            <Route path="/danh-sach-san-da-dat" element={<Danhsachsandadat />} />
            <Route path="/danh-sach-san" element={<Danhsachsan />} />
            <Route path="/lien-he" element={<Lienhe />} />
            <Route path="/thong-tin-ca-nhan" element={<Thongtincanhan />} />
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
            <Route path="/admin/quan-ly-san" element={<Quanlysan />} />
            <Route path="/admin/quan-ly-dat-san" element={<Quanlydatsan />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
