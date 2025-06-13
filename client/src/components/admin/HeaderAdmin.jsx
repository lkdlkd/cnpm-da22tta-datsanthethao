// import "../../App.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function MenuUser() {
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  return (
    <header class="header">
      <div class="d-flex align-items-center gap-2">
        {/* <i class="fas fa-user-circle"></i> admin */}
      </div>
    </header>
  );
}

export default MenuUser;
