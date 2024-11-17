import React from 'react';
import './PlanetControls.css';

const PlanetControls = ({ selectedPlanet }) => {
  return (
    <div className="controls-panel">
      <h3 className="controls-title">Controls</h3>
      <div className="controls-section">
        <h4 className="controls-subtitle">Planet Selection</h4>
        <div className="controls-list">
          {Object.entries(KEYBINDS).map(([planet, key]) => (
            <div
              key={planet}
              className={`control-item ${selectedPlanet === planet ? 'selected' : ''}`}
            >
              <kbd className="key-bind">{key}</kbd>
              <span>{planet.charAt(0).toUpperCase() + planet.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="controls-section">
        <h4 className="controls-subtitle">Camera Movement</h4>
        <div className="camera-controls">
          <div className="camera-control-item">
            <kbd className="key-bind">↑</kbd>
            <span>Move Up</span>
          </div>
          <div className="camera-control-item">
            <kbd className="key-bind">↓</kbd>
            <span>Move Down</span>
          </div>
          <div className="camera-control-item">
            <kbd className="key-bind">←</kbd>
            <span>Move Left</span>
          </div>
          <div className="camera-control-item">
            <kbd className="key-bind">→</kbd>
            <span>Move Right</span>
          </div>
          <div className="camera-control-item">
            <kbd className="key-bind">+</kbd>
            <span>Zoom In</span>
          </div>
          <div className="camera-control-item">
            <kbd className="key-bind">-</kbd>
            <span>Zoom Out</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetControls;

export const KEYBINDS = {
  sun: '1',
  mercury: '2',
  venus: '3',
  earth: '4',
  mars: '5',
  jupiter: '6',
  saturn: '7',
  uranus: '8',
  neptune: '9'
};