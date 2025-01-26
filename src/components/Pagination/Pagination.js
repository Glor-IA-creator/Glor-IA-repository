// src/components/Pagination/Pagination.js
import React from 'react';
import './Pagination.css';

const Pagination = () => {
  return (
    <div className="pagination-container">
      <button className="pagination-button">Anterior</button>
      <span>Página 1 de 10</span>
      <button className="pagination-button">Siguiente</button>
    </div>
  );
};

export default Pagination;
