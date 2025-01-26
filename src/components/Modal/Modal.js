// src/components/Modal/Modal.js
import React, { useState } from 'react';
import './Modal.css';

const Modal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button onClick={openModal}>Abrir Modal</button>
      {isOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Fichas Clínicas</h2>
            <ul>
              <li>Ficha 10/08/2024</li>
              <hr />
              {/* Más elementos */}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
