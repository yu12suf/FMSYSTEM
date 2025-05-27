// src/Components/Layout/Layout.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Layout.css";

const Layout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="layout-container">
      <header className="header">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1 className="project-title">ከተማ ልማትና ኮንስትራክሽን ቢሮ ፋይል ማንጅመንት ሲስተም</h1>
        <img src="/logo.png" alt="Logo" className="logo" />
      </header>

      <nav className="menu-bar">
        <ul>
          <li>
            <Link to="/">ፋይል ቆጠራ</Link>
          </li>
          <li>
            <Link to="/files">ማውጫ</Link>
          </li>
          <li>
            <Link to="/report">ሪፖርት</Link>
          </li>
          <li>
            <Link to="/graph">ግራፍ</Link>
          </li>
          <li>
            <Link to="/history">History</Link>
          </li>
          <li
            className="logout"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            Logout
          </li>
        </ul>
      </nav>

      <main className="content">{children}</main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} ከተማ ልማትና ኮንስትራክሽን ቢሮ</p>
      </footer>
    </div>
  );
};

export default Layout;
