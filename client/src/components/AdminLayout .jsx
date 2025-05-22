import React from "react";
import { Outlet } from "react-router-dom";
import HeaderAdmin from "./admin/HeaderAdmin";
import MenuAdmin from "./admin/MenuAdmin";

const AdminLayout = () => {
    return (
        <>
            <HeaderAdmin />
            <div className="d-flex">
                <MenuAdmin />

                <Outlet />
            </div>
            <footer>Admin Footer</footer>
        </>
    );
};

export default AdminLayout;