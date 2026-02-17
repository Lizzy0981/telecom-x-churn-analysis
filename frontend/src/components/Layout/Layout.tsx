// frontend/src/components/Layout/Layout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Navbar } from './Navbar';
import './Layout.css';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="layout-main">
        {/* Header */}
        <Header onMenuToggle={toggleSidebar} />

        {/* Optional Horizontal Navbar */}
        {/* <Navbar /> */}

        {/* Page Content */}
        <main className="layout-content" role="main">
          <div className="content-container">
            <Outlet />
          </div>
        </main>

        {/* Footer (if needed) */}
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Layout;
