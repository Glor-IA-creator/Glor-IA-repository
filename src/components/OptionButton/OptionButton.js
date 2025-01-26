// src/components/OptionButton.js
import React from 'react';
import './OptionButton.css'; // Ajusta la ruta de importación

const OptionButton = ({ text }) => {
  return (
    <button className="option-button" aria-label={text}>
      {text}
    </button>
  );
};

export default OptionButton;
