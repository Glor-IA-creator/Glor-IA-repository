import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import Chat from '../../components/Chat/Chat';
import './ChatPage.css';

const ChatPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <div className="chat-page-container">
      <div className={`sidebar-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      <div className="main-content">
        <Navbar />
        <div className="chat-container">
          {/* Renderizamos el componente Chat directamente */}
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
