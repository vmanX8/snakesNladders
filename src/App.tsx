import { useCallback, useState } from "react";
import GameBoard from "./components/GameBoard";
import GameInfo from "./components/GameInfo";
import GameModal from "./components/GameModal";
import DiceRoller from "./components/DiceRoller";
import { getDiceFace, DicePips } from "./utils/dice";
import { generateSnakesAndLadders, getNewPosition, Snakes, Ladders } from "./utils/SnNLadRules";

import "./App.css";

/** Config */
const ROWS = 6;
const COLS = 5;
const EXACT_FINISH = true;

export default function App() {
  const maxCell = ROWS * COLS;

  const [{ snakes, ladders }, setLayout] = useState<{ snakes: Snakes; ladders: Ladders }>(() =>
    generateSnakesAndLadders(3, maxCell)
  );

  const [p1, setP1] = useState(1);
  const [p2, setP2] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [lastRoll, setLastRoll] = useState<DicePips | null>(null);

  const [winner, setWinner] = useState<string | null>(null);

  /** Arrows controls */
  const [showArrows, setShowArrows] = useState(true);
  const [arrowOpacity, setArrowOpacity] = useState(0.35);

  const currentPlayerLabel = currentPlayer === 1 ? "Player 1" : "Player 2";

  const resetGame = useCallback(() => {
    setP1(1); setP2(1);
    setCurrentPlayer(1);
    setLastRoll(null);
    setWinner(null);
  }, []);

  const newLayout = useCallback(() => {
    setLayout(generateSnakesAndLadders(3, maxCell));
    resetGame();
  }, [maxCell, resetGame]);

  const applyRoll = useCallback((value: DicePips) => {
    setLastRoll(value);

    const moveOne = (pos: number) => {
      const tentative = pos + value;
      if (EXACT_FINISH && tentative > maxCell) return pos;
      const landed = Math.min(tentative, maxCell);
      return getNewPosition(landed, snakes, ladders);
    };

    if (currentPlayer === 1) {
      setP1(prev => {
        const next = moveOne(prev);
        if (next === maxCell) { setWinner("Player 1"); return next; }
        setCurrentPlayer(2);
        return next;
      });
    } else {
      setP2(prev => {
        const next = moveOne(prev);
        if (next === maxCell) { setWinner("Player 2"); return next; }
        setCurrentPlayer(1);
        return next;
      });
    }
  }, [currentPlayer, ladders, snakes, maxCell]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>🐍🪜 Snakes & Ladders</h1>
        <div className="app__actions">
          <button className="btn btn--ghost" onClick={newLayout} title="New random board">🧩 New Layout</button>
          <button className="btn" onClick={resetGame} title="Reset positions">🔄 Reset Game</button>
        </div>
      </header>

      <main className="app__main">
        <section aria-label="Board" className="panel panel--board">
          <GameBoard
            position1={p1}
            position2={p2}
            ladders={ladders}
            snakes={snakes}
            rows={ROWS}
            cols={COLS}
            cellSizePx={60}
            cellGapPx={4}
            showArrows={showArrows}
            arrowOpacity={arrowOpacity}
            strictValidation={false}
          />
        </section>

        <aside className="panel panel--side" aria-label="Game controls">
          <GameInfo dice={lastRoll} position1={p1} position2={p2} currentPlayer={currentPlayer} />

          <div className="roller">
            <DiceRoller onResult={applyRoll} durationMs={650} fps={28} initial={1} />
            <div className="roller__hint" aria-live="polite">
              {lastRoll ? `Last roll: ${getDiceFace(lastRoll)} — ${currentPlayerLabel}'s turn` : `${currentPlayerLabel}, roll to start!`}
            </div>
          </div>

          <div className="controls">
            <label>
              <input type="checkbox" checked={showArrows} onChange={(e) => setShowArrows(e.target.checked)} />
              Show arrows
            </label>
            <label>
              Opacity
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={arrowOpacity}
                onChange={(e) => setArrowOpacity(parseFloat(e.target.value))}
                style={{ width: 120 }}
              />
              <span style={{ width: 36, textAlign: "right" }}>{arrowOpacity.toFixed(2)}</span>
            </label>
          </div>

          <div className="legend">
            <div><span className="swatch swatch--p1" /> Player 1</div>
            <div><span className="swatch swatch--p2" /> Player 2</div>
            <div><span className="swatch swatch--ladder" /> Ladder</div>
            <div><span className="swatch swatch--snake" /> Snake</div>
          </div>
        </aside>
      </main>

      <GameModal show={!!winner} winner={winner} onReset={resetGame} />
    </div>
  );
}