import React from "react";

const Lienhe = () => {
    return (
        <div className="container py-5">
            <h2 className="fw-bold text-primary mb-4">Liên hệ với chúng tôi</h2>
            <div className="row g-4">
                <div className="col-md-6">
                    <form>
                        <div className="mb-3">
                            <label className="form-label">Họ và tên</label>
                            <input type="text" className="form-control" placeholder="Nhập họ tên của bạn" required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control" placeholder="Nhập email" required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Nội dung</label>
                            <textarea className="form-control" rows="4" placeholder="Nhập nội dung liên hệ" required></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary">Gửi liên hệ</button>
                    </form>
                </div>
                <div className="col-md-6">
                    <div className="bg-light rounded p-4 h-100">
                        <h5 className="mb-3 text-success">Thông tin liên hệ</h5>
                        <p><i className="bi bi-geo-alt text-danger"></i> 126 Nguyễn Thiện Thành, Phường 5, Trà Vinh</p>
                        <p><i className="bi bi-telephone text-primary"></i> 0123 456 789</p>
                        <p><i className="bi bi-envelope text-warning"></i> info@lbd-sport.vn</p>
                        <div className="mt-3">
                            <a href="#" className="me-3 text-dark"><i className="bi bi-facebook fs-4"></i></a>
                            <a href="#" className="me-3 text-dark"><i className="bi bi-instagram fs-4"></i></a>
                            <a href="#" className="text-dark"><i className="bi bi-youtube fs-4"></i></a>
                        </div>
                        <div className="mt-4">
                            <iframe
                                title="Google Map"
                                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7113.086767706056!2d106.3416481!3d9.9249318!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0175ea296facb%3A0x55ded92e29068221!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBUcsOgIFZpbmg!5e1!3m2!1svi!2s!4v1747880683681!5m2!1svi!2s"
                                width="100%"
                                height="180"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lienhe;