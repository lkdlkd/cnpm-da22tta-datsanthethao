import React from "react";
const Footer = () => {
  return (
    // Footer
    <footer className="bg-light mt-5 border-top">
      <div className="container px-4 py-4">
        <div className="row">
          <div className="col">
            <h5 className="pt-2">Chính sách</h5>
            <p>
              <a href="#" className="text-decoration-none text-dark">
                Chính sách bảo mật
              </a>
            </p>
            <p>
              <a href="#" className="text-decoration-none text-dark">
                Điều khoản sử dụng
              </a>
            </p>
            <p>
              <a href="#" className="text-decoration-none text-dark">
                Cam kết chất lượng
              </a>
            </p>
          </div>
          <div className="col">
            <h5 className="pt-2">Hỗ trợ</h5>
            <p>
              Hotline:{" "}
              <a href="tel:+84123456789" className="text-danger text-decoration-none">
                +84 123456789
              </a>
            </p>
            <p>
              Email:{" "}
              <a
                href="mailto:lbdsport@gmail.com"
                className="text-danger text-decoration-none"
              >
                info@lbd-sport.vn             F
                 </a>
            </p>
            <p>
              <a href="/lien-he" className="text-decoration-none text-dark">
                Liên hệ
              </a>
            </p>
          </div>
          <div className="col">
            <h5 className="pt-2">Dịch vụ</h5>
            <p>
              <a href="#" className="text-decoration-none text-dark">
                Tư vấn thể thao
              </a>
            </p>
            <p>
              <a href="#" className="text-decoration-none text-dark">
                Quảng cáo trên sân thể thao
              </a>
            </p>
            <p>
              <a href="#" className="text-decoration-none text-dark">
                Dịch vụ đặt sân & tìm đối
              </a>
            </p>
          </div>
          <div className="col col-lg-3">
            <h5 className="pt-2">Mạng xã hội</h5>
            <div>
              <a href="#" className="text-decoration-none text-dark">
                <i className="bi bi-facebook me-3"></i>
              </a>
              <a href="#" className="text-decoration-none text-dark">
                <i className="bi bi-map me-3"></i>
              </a>
              <a href="#" className="text-decoration-none text-dark">
                <i className="bi bi-instagram me-3"></i>
              </a>
              <a href="#" className="text-decoration-none text-dark">
                <i className="bi bi-youtube me-3"></i>
              </a>
            </div>
          </div>
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