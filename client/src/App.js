import React from "react";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./components/AuthContext";
import { Login } from "./page/Login";
import { Register } from "./page/Register";
import Home from "./page/Home";
import Layout from "./components/Layout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes khong co Layout */}
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />

          {/* Routes có Layout */}
          <Route
            path="/"
            element={
              <AuthContext.Consumer>
                {({ auth }) =>
                  auth.token ? <Layout /> : <Navigate to="/dang-nhap" />
                }
              </AuthContext.Consumer>
            }
          >
            <Route path="/" element={<Home />} />
            <Route index element={<Navigate to="/" replace />} />
            <Route path="#" element={<Home />} />

            {/* tiếp*/}

          </Route>
          {/* 404 Not Found */}
          <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
