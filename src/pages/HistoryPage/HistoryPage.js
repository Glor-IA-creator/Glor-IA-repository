// src/pages/HistoryPage/HistoryPage.js
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import HistoryTable from '../../components/HistoryTable/HistoryTable';
import './HistoryPage.css';

const HistoryPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  return (
    <div className={`history-page-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Navbar />
        <HistoryTable />
      </div>
    </div>
  );
};

export default HistoryPage;
