import React from "react";

const Footer = () => {
  return (
    <footer className="bg-light mt-5 border-top">
      <div className="container px-4 py-4">
        <div className="row gy-4">
          {/* Chính sách */}
          <div className="col-12 col-md-3">
            <h5 className="pt-2">Chính sách</h5>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-decoration-none text-dark">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="text-decoration-none text-dark">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-decoration-none text-dark">
                  Cam kết chất lượng
                </a>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div className="col-12 col-md-3">
            <h5 className="pt-2">Hỗ trợ</h5>
            <ul className="list-unstyled">
              <li>
                Hotline:{" "}
                <a href="tel:+84123456789" className="text-danger text-decoration-none">
                  +84 123456789
                </a>
              </li>
              <li>
                Email:{" "}
                <a
                  href="mailto:info@lbd-sport.vn"
                  className="text-danger text-decoration-none"
                >
                  info@lbd-sport.vn
                </a>
              </li>
              <li>
                <a href="/lien-he" className="text-decoration-none text-dark">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Dịch vụ */}
          <div className="col-12 col-md-3">
            <h5 className="pt-2">Dịch vụ</h5>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-decoration-none text-dark">
                  Tư vấn thể thao
                </a>
              </li>
              <li>
                <a href="#" className="text-decoration-none text-dark">
                  Quảng cáo trên sân thể thao
                </a>
              </li>
              <li>
                <a href="#" className="text-decoration-none text-dark">
                  Dịch vụ đặt sân & tìm đối
                </a>
              </li>
            </ul>
          </div>

          {/* Mạng xã hội */}
          <div className="col-12 col-md-3">
            <h5 className="pt-2">Mạng xã hội</h5>
            <div className="d-flex gap-3">
              <a href="#" className="text-decoration-none text-dark">
                <i className="bi bi-facebook fs-4"></i>
              </a>
              <a href="#" className="text-decoration-none text-dark">
                <i className="bi bi-map fs-4"></i>
              </a>
              <a href="#" className="text-decoration-none text-dark">
                <i className="bi bi-instagram fs-4"></i>
              </a>
              <a href="#" className="text-decoration-none text-dark">
                <i className="bi bi-youtube fs-4"></i>
              </a>
            </div>
          </div>

          {/* Bản quyền */}
          <div className="col-12">
            <hr />
            <p className="text-center w-100 mb-0 mt-3 small">
              Copyright © 2025 SportWorld. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;