import React from "react";
import ListSan from "../components/ListSan";
import Tintuc from "./User/Tintuc";
import Banner from "../components/user/Banner";
const Home = () => {

    return (
        <div>
            <Banner />
            <ListSan />
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
                    </div>
                </div>
            </section>
            <Tintuc />

        </div>
    );
};

export default Home;