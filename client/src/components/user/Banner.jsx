import React from "react";


const Banner = () => {
  return (
    <section className="banner-wrapper my-4">
      <div
        id="mainBanner"
        className="carousel slide"
        data-bs-ride="carousel"
        data-bs-interval="3000" // Tự động chuyển banner mỗi 3 giây
      >
        <div className="carousel-inner rounded shadow">
          <div className="carousel-item active">
            <img src="img/banner1.jpg" className="d-block w-100 banner-img" alt="Banner 1" />
            <div className="carousel-caption text-start">
              <h2 className="text-light fw-bold">LBD SPORT</h2>
              <p className="text-light">Dễ dàng đặt sân – Thỏa sức đam mê</p>
              <a href="/danh-sach-san" className="btn btn-primary">Giảm rẻ hơn 20% khi đặt tại sân</a>
            </div>
          </div>
          <div className="carousel-item">
            <img src="img/banner.jpg" className="d-block w-100 banner-img" alt="Banner 2" />
            <div className="carousel-caption text-start">
              <h2 className="text-light fw-bold">Chất lượng – Uy tín</h2>
              <p className="text-light">Sân sạch – Đặt nhanh – Giá tốt</p>
              <a href="/danh-sach-san" className="btn btn-primary">Xem thêm</a>
            </div>
          </div>
        </div>
        {/* Nút chuyển banner trái/phải, Bootstrap sẽ tự căn giữa dọc */}
        <button className="carousel-control-prev" type="button" data-bs-target="#mainBanner" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#mainBanner" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>
    </section>
  );
};

export default Banner;