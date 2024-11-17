import React from 'react';

const PlanetControls = ({ selectedPlanet }) => {
  return (
    <div className="fixed top-4 left-4 text-white font-mono z-10 bg-black/50 p-4 rounded-lg backdrop-blur-sm">
      <h3 className="text-lg mb-2 font-bold">Planet Focus Controls</h3>
      <div className="space-y-1">
        {Object.entries(KEYBINDS).map(([planet, key]) => (
          <div
            key={planet}
            className={`flex items-center space-x-2 ${selectedPlanet === planet ? 'text-yellow-400' : ''}`}
          >
            <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">{key}</kbd>
            <span>{planet.charAt(0).toUpperCase() + planet.slice(1)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-400">
        <div>Mouse controls:</div>
        <div>Left click + drag to rotate</div>
        <div>Right click + drag to pan</div>
        <div>Scroll to zoom</div>
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