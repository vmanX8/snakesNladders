import React from "react";

export default function GameInfo({ dice, position1, position2, currentPlayer }) {
  return (
    <div className="p-4 rounded shadow bg-white mb-4" style={{ width: '300px', margin: 'auto' }}>
      <h4 className="mb-3">🎯 Game Info</h4>
      <h5 className="text-success">🎲 Dice Roll: <strong>{dice}</strong></h5>
      <h6 className="text-primary">🏃‍♂️ Player 1 Position: <strong>{position1}</strong></h6>
      <h6 className="text-info">🏃‍♀️ Player 2 Position: <strong>{position2}</strong></h6>
      <h6>🎮 Current Turn: <strong>Player {currentPlayer}</strong></h6>
    </div>
  );
}