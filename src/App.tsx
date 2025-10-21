import { useCallback, useState } from "react";
import GameBoard from "./components/GameBoard";
import GameInfo from "./components/GameInfo";
import GameModal from "./components/GameModal";
import DiceRoller from "./components/DiceRoller";
import { computeFacingAfterMove, defaultFacingOnReset } from "./utils/boardMath";
import { getDiceFace, DicePips } from "./utils/dice";
import { generateSnakesAndLadders, getNewPosition, Snakes, Ladders } from "./utils/SnNLadRules";
import "./App.css";

/** Rows/columns define the board size. */
const ROWS = 7;
const COLS = 6;
/** Exact finish rule; near-finish window available if you added it earlier. */
const EXACT_FINISH = true;

export default function App() {
  const maxCell = ROWS * COLS;

  // layout (snakes/ladders)
  const [{ snakes, ladders }, setLayout] = useState<{
    snakes: Snakes;
    ladders: Ladders;
  }>(() => generateSnakesAndLadders(3, maxCell));

  // positions
  const [p1, setP1] = useState(1);
  const [p2, setP2] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [lastRoll, setLastRoll] = useState<DicePips | null>(null);

  // facings (emoji mirror)
  const [p1Facing, setP1Facing] = useState<"left" | "right">("right");
  const [p2Facing, setP2Facing] = useState<"left" | "right">("right");

  /** Arrows controls */
  const [showArrows, setShowArrows] = useState(true);
  const [arrowOpacity, setArrowOpacity] = useState(0.35);

  // modal
  const [winner, setWinner] = useState<string | null>(null);

  /** Reset positions, clear UI, and face players to the right. */
  const resetGame = useCallback(() => {
    setP1(1); setP2(1);
    setCurrentPlayer(1);
    setLastRoll(null);
    setWinner(null);
    setP1Facing(defaultFacingOnReset()); // → "right"
    setP2Facing(defaultFacingOnReset());
  }, []);

  /** Generate a fresh random layout and then reset (players face right). */
  const newLayout = useCallback(() => {
    setLayout(generateSnakesAndLadders(3, maxCell));
    setP1(1); setP2(1);
    setCurrentPlayer(1);
    setLastRoll(null);
    setWinner(null);
    setP1Facing(defaultFacingOnReset());
    setP2Facing(defaultFacingOnReset());
  }, [maxCell]);

  const applyRoll = (value: DicePips) => {
    setLastRoll(value);

    const moveOne = (pos: number) => {
      // your existing near-finish / exact-finish logic here...
      const tentative = pos + value;
      if (EXACT_FINISH && tentative > maxCell) {
        // no move
        return { landed: pos, final: pos };
      }
      const landed = Math.min(tentative, maxCell);
      const final = getNewPosition(landed, snakes, ladders);
      return { landed, final };
    };

    if (currentPlayer === 1) {
      setP1(prev => {
        const { landed, final } = moveOne(prev);
        setP1Facing(
          computeFacingAfterMove(prev, landed, final, ROWS, COLS, /* must match board */ true, snakes, ladders)
        );
        if (final === maxCell) { setWinner("Player 1"); return final; }
        setCurrentPlayer(2);
        return final;
      });
    } else {
      setP2(prev => {
        const { landed, final } = moveOne(prev);
        setP2Facing(
          computeFacingAfterMove(prev, landed, final, ROWS, COLS, /* must match board */ true, snakes, ladders)
        );
        if (final === maxCell) { setWinner("Player 2"); return final; }
        setCurrentPlayer(1);
        return final;
      });
    }
  };



  const currentPlayerLabel = currentPlayer === 1 ? "Player 1" : "Player 2";

  return (
    <div className="app">
      <header className="app__header">
        <h1>🐍🪜 Snakes & Ladders</h1>
        <div className="app__actions">
          <button className="btn" onClick={resetGame}>
            🔄 Restart
          </button>
          <button className="btn btn--grn" onClick={newLayout}>
            🧩 New Game
          </button>
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
            p1Facing={p1Facing}
            p2Facing={p2Facing}
            startFromBottom={true}
          />
        </section>

        <aside className="panel panel--side" aria-label="Game controls">
          <div className="roller">
            <DiceRoller onResult={applyRoll} durationMs={650} fps={28} initial={1} />
            <div className="roller__hint" aria-live="polite">
              {lastRoll
                ? `Last roll: ${getDiceFace(lastRoll)} — ${currentPlayerLabel}'s turn`
                : `${currentPlayerLabel}, roll to start!`}
            </div>
          </div>

          <GameInfo
            dice={lastRoll}
            position1={p1}
            position2={p2}
            currentPlayer={currentPlayer}
          />

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

      {/* Winner modal with two actions */}
      <GameModal
        show={!!winner}
        winner={winner}
        /** Start New Game = new random snakes/ladders + reset */
        onNewGame={newLayout}
        /** Restart/Retry = same layout, reset positions */
        onRestart={resetGame}
      />
    </div>
  );
}
