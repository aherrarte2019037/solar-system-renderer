import React from 'react';
import './PlanetControls.css';

const PlanetControls = ({ selectedPlanet }) => {
  return (
    <div className="controls-panel">
      <h3 className="controls-title">Planet Focus Controls</h3>
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