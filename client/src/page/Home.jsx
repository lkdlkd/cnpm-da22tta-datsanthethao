import React from "react";
import ListSan from "../components/ListSan";
import Tintuc from "./User/Tintuc";
import Banner from "../components/user/Banner";

const Home = () => {
    return (
        <div>
            {/* Banner */}
            <Banner />

            <div>
                <ListSan />
            </div>


            {/* Video giới thiệu */}
            <section className="intro-video-section position-relative overflow-hidden">
                <div className="container-fluid px-0">
                    <div className="position-relative">
                        <video
                            id="introVideo"
                            className="w-100"
                            style={{ maxHeight: 400, objectFit: "cover" }}
                            autoPlay
                            muted
                            loop
                            playsInline
                        >
                            <source src="img/intro1.mp4" type="video/mp4" />
                            Trình duyệt của bạn không hỗ trợ video.
                        </video>
                        <div className="position-absolute top-50 start-50 translate-middle text-center text-light">
                            <h2 className="fw-bold">Giới thiệu LBD Sport</h2>
                            <p className="lead">Đặt sân nhanh chóng, tiện lợi và giá tốt nhất</p>
                        </div>
                    </div>
                </div>
            </section>
            {/* Tin tức */}
            <section className=" bg-light">
                <div className="container">
                    <Tintuc />
                </div>
            </section>
        </div>
    );
};

export default Home;