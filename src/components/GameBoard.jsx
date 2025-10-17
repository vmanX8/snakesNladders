import React from 'react';

const GameBoard = ({ position1, position2, snakes, ladders }) => {
  return (
    <>
      {Array.from({ length: 6 }, (_, rowIndex) => {
        const isEvenRow = rowIndex % 2 === 0;
        const rowStart = rowIndex * 5 + 1;
        const cells = Array.from({ length: 5 }, (_, i) => {
          const pos = isEvenRow ? rowStart + i : rowStart + (4 - i);

          let cellClass = "bg-light";
          if (ladders[pos]) cellClass = "bg-success text-white";
          else if (snakes[pos]) cellClass = "bg-danger text-white";
          else if (pos === position1 && pos === position2) cellClass = "bg-warning";
          else if (pos === position1) cellClass = "bg-primary text-white";
          else if (pos === position2) cellClass = "bg-info text-white";

          let content = pos;
          if (pos === position1 && pos === position2) content = '🏃‍♂️🏃‍♀️';
          else if (pos === position1) content = '🏃‍♂️';
          else if (pos === position2) content = '🏃‍♀️';
          else if (ladders[pos]) content = `🪜 ${pos}`;
          else if (snakes[pos]) content = `🐍 ${pos}`;

          return <td key={pos} className={cellClass}>{content}</td>;
        });

        return <tr key={rowIndex}>{cells}</tr>;
      })}
    </>
  );
};

export default GameBoard;