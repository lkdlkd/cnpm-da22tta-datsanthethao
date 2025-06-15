import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const GioiThieu = () => {
    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    return (
        <div className="pt-5">
            {/* Hero Section */}
            <section
                className="text-white text-center py-5"
                style={{
                    background: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1599059815524-cf03b59b720b') center/cover no-repeat",
                    borderBottom: "5px solid #198754",
                }}
            >
                <div className="container py-5">
                    <h1 className="display-4 fw-bold mb-3">LBD Sport</h1>
                    <p className="lead fs-5">
                        Nơi hội tụ đam mê – Thắp sáng tinh thần thể thao
                    </p>
                </div>
            </section>

            {/* Nội dung */}
            <div className="container py-5">
                <div className="row g-4">
                    <div className="col-md-6 col-lg-6" data-aos="fade-up">
                        <div className="p-4 bg-white rounded-4 shadow-lg border-start border-4 border-success h-100 hover-shadow transition">
                            <h4 className="text-success fw-bold mb-3">
                                <i className="bi bi-people-fill me-2"></i>Về Chúng Tôi
                            </h4>
                            <p className="text-muted">
                                LBD Sport là chuỗi cửa hàng thể thao hàng đầu tại Trà Vinh, chuyên cung cấp sản phẩm chính hãng, chất lượng cao, và luôn tiên phong trong việc mang đến trải nghiệm mua sắm vượt trội.
                            </p>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-6" data-aos="fade-up" data-aos-delay="200">
                        <div className="p-4 bg-white rounded-4 shadow-lg border-start border-4 border-primary h-100 hover-shadow transition">
                            <h4 className="text-primary fw-bold mb-3">
                                <i className="bi bi-bullseye me-2"></i>Sứ Mệnh
                            </h4>
                            <p className="text-muted">
                                Truyền cảm hứng vận động bằng cách mang đến sản phẩm thể thao chất lượng, giá cả hợp lý và sự tận tâm trong từng dịch vụ.
                            </p>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-6" data-aos="fade-up" data-aos-delay="400">
                        <div className="p-4 bg-white rounded-4 shadow-lg border-start border-4 border-warning h-100 hover-shadow transition">
                            <h4 className="text-warning fw-bold mb-3">
                                <i className="bi bi-gem me-2"></i>Giá Trị Cốt Lõi
                            </h4>
                            <ul className="list-unstyled text-muted">
                                <li><i className="bi bi-check-circle-fill text-success me-2"></i>Chất lượng là nền tảng</li>
                                <li><i className="bi bi-check-circle-fill text-success me-2"></i>Khách hàng là trung tâm</li>
                                <li><i className="bi bi-check-circle-fill text-success me-2"></i>Đổi mới & phát triển liên tục</li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-6" data-aos="fade-up" data-aos-delay="600">
                        <div className="p-4 bg-white rounded-4 shadow-lg border-start border-4 border-danger h-100 hover-shadow transition">
                            <h4 className="text-danger fw-bold mb-3">
                                <i className="bi bi-shield-check me-2"></i>Cam Kết
                            </h4>
                            <blockquote className="blockquote text-muted fst-italic mb-0">
                                “Luôn nỗ lực không ngừng để mang lại giá trị thực, sản phẩm chính hãng và dịch vụ hậu mãi tận tâm.”
                            </blockquote>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-5" data-aos="fade-up" data-aos-delay="800">
                    <p className="text-muted fs-5 fst-italic">
                        LBD Sport - Nơi sự chuyên nghiệp và đam mê gặp nhau
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GioiThieu;
