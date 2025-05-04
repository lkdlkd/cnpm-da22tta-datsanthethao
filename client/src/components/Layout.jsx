import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Banner from "./Banner";

const Layout = () => {
    return (
        <>
           <div>Header</div>
           <Banner/>
            <div className="pc-container">
                <div className="pc-content">
                    <Outlet />
                </div>
            </div>
            <div>Footer</div>
        </>
    );
};

export default Layout;
