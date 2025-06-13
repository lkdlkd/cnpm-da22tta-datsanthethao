import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Banner from "./user/Banner";
import Header from "./user/Header";
import Footer from "./user/Footer";
import { getUsers } from "../services/api";

const Layout = () => {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        getUsers()
          .then(data => {
            setUsers(data.users); // Lưu user vào state
          })
          .catch(err => {
            console.error("Lỗi lấy user:", err);
          });
    }, []);
    return (
        <>
           <Header users={users} />
            <div className="containner">
                <div className="">
                    {/* Truyền users vào các router con nếu cần */}
                    <Outlet context={{ users }} />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Layout;
