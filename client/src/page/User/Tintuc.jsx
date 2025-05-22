import React from "react";

const Tintuc = () => (
  // Tin tức
  <section className="py-5 bg-light">
    <div className="container">
      <h3 className="mb-4 text-center">Tin tức</h3>
      <div className="row g-4">
        {/* Tin 1 */}
        <div className="col-md-4">
          <div className="card h-100 shadow-sm d-flex flex-column">
            <img src="img/tin1.jpg" className="card-img-top img-fixed" alt="Tin tức 1" />
            <div className="card-body d-flex flex-column">
              <h5 className="card-title fs-6">Giải bóng đá quốc tế U-13 Việt Nam &amp; Nhật Bản</h5>
              <p className="card-text text-muted small mt-auto">Thời gian: 30-3-2025</p>
            </div>
          </div>
        </div>
        {/* Tin 2 */}
        <div className="col-md-4">
          <div className="card h-100 shadow-sm d-flex flex-column">
            <img src="img/tin2.jpg" className="card-img-top img-fixed" alt="Tin tức 2" />
            <div className="card-body d-flex flex-column">
              <h5 className="card-title fs-6">Giải bóng đá chào mừng 84 năm thành lập Đoàn</h5>
              <p className="card-text text-muted small mt-auto">Tháng 3 năm 2025</p>
            </div>
          </div>
        </div>
        {/* Tin 3 */}
        <div className="col-md-4">
          <div className="card h-100 shadow-sm d-flex flex-column">
            <img src="img/tin3.jpg" className="card-img-top img-fixed" alt="Tin tức 3" />
            <div className="card-body d-flex flex-column">
              <h5 className="card-title fs-6">Giải sinh viên toàn quốc ngày 24-3-2024</h5>
              <p className="card-text text-muted small mt-auto">Tin tức thể thao sinh viên</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Tintuc;