// src/components/OptionBox.js
import React from 'react';
import './OptionBox.css';

const OptionBox = ({ title, description }) => {
  return (
    <div className="box">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default OptionBox;
