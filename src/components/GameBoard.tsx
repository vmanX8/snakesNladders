import React, { useMemo } from "react";
import styles from "./GameBoard.module.css";

/** Map of jump starts to destinations (ladders: up, snakes: down). */
export type JumpsMap = Record<number, number>;

/**
 * Props for the Snakes & Ladders board.
 */
export type GameBoardProps = {
  /** Player 1 current 1-based position. */
  position1: number;
  /** Player 2 current 1-based position. */
  position2: number;

  /** Ladder mapping: start -> end (end > start). */
  ladders: JumpsMap;
  /** Snake mapping: head -> tail (tail < head). */
  snakes: JumpsMap;

  /** Row count (default 7). */
  rows?: number;
  /** Column count (default 6). */
  cols?: number;

  /** Cell size in CSS px (default 56). */
  cellSizePx?: number;
  /** Gap between cells in CSS px (default 2). */
  cellGapPx?: number;

  /** If true, throw on invalid jump maps. */
  strictValidation?: boolean;

  /** Show the SVG arrows overlay (default true). */
  showArrows?: boolean;
  /** Arrow opacity 0..1 (default 0.35). */
  arrowOpacity?: number;

  /** Visual facing of Player 1’s emoji (“left” or “right”). */
  p1Facing?: "left" | "right";
  /** Visual facing of Player 2’s emoji (“left” or “right”). */
  p2Facing?: "left" | "right";

  /**
   * If true, numbering **starts at the bottom-left** and increases upward,
   * alternating direction each row (serpentine). Visual only;
   *
   * Default: **true**.
   */
  startFromBottom?: boolean;
};

type CellInfo = {
  pos: number;
  isLadder: boolean;
  isSnake: boolean;
  hasP1: boolean;
  hasP2: boolean;
  isStart: boolean;
  isFinish: boolean;
};

/**
 * Compute serpentine 1-based position for a (row, col).
 *
 * @param row Visual row (0 at top)
 * @param col Visual column (0 at left)
 * @param cols Total columns
 * @param rows Total rows
 * @param startFromBottom Start numbering at the bottom row instead of top
 * @returns 1-based cell number
 */
function cellPosition(
  row: number,
  col: number,
  cols: number,
  rows: number,
  startFromBottom: boolean
): number {
  // Flip the *effective* row when we want 1..N to increase from the bottom.
  const effectiveRow = startFromBottom ? rows - 1 - row : row;
  const base = effectiveRow * cols;
  const leftToRight = effectiveRow % 2 === 0;

  return leftToRight ? base + col + 1 : base + (cols - col);
}

/**
 * Validate ladders/snakes and range; returns list of human-readable issues.
 * If `strictValidation=true`, the component will throw on any issue.
 */
function validateJumps(ladders: JumpsMap, snakes: JumpsMap, totalCells: number): string[] {
  const issues: string[] = [];
  const checkRange = (k: number, v: number, kind: "ladder" | "snake") => {
    if (k < 1 || k > totalCells) issues.push(`${kind}: start ${k} out of range 1..${totalCells}`);
    if (v < 1 || v > totalCells) issues.push(`${kind}: end ${v} out of range 1..${totalCells}`);
  };
  for (const [kStr, v] of Object.entries(ladders)) {
    const k = Number(kStr); checkRange(k, v, "ladder");
    if (!(v > k)) issues.push(`ladder: end (${v}) must be > start (${k})`);
  }
  for (const [kStr, v] of Object.entries(snakes)) {
    const k = Number(kStr); checkRange(k, v, "snake");
    if (!(v < k)) issues.push(`snake: tail (${v}) must be < head (${k})`);
  }
  const starts = new Set<number>([...Object.keys(ladders), ...Object.keys(snakes)].map(Number));
  if (starts.size < Object.keys(ladders).length + Object.keys(snakes).length) {
    issues.push("A cell is both a ladder start and snake head.");
  }
  return issues;
}

/**
 * Precompute geometry helpers for the board (centers for arrows).
 * Uses the same serpentine mapping & startFromBottom so visuals align with numbers.
 */
function useBoardGeometry(
  rows: number,
  cols: number,
  cellSize: number,
  gap: number,
  startFromBottom: boolean
) {
  const totalWidth = cols * cellSize + (cols - 1) * gap;
  const totalHeight = rows * cellSize + (rows - 1) * gap;

  // Compute center coordinates for each numbered cell using the same serpentine mapping.
  const centerOf = (pos: number) => {
    // Recover visual (row, col) by scanning; cheap for small boards.
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (cellPosition(r, c, cols, rows, startFromBottom) === pos) {
          const x = c * (cellSize + gap) + cellSize / 2;
          const y = r * (cellSize + gap) + cellSize / 2;
          return { x, y };
        }
      }
    }
    return { x: 0, y: 0 };
  };

  return { centerOf, totalWidth, totalHeight };
}

/** CSS class for the cell based on state. */
function getCellClass(info: CellInfo): string {
  // Start/finish: fixed color
  if (info.isStart) return `${styles.cell} ${styles.cellStart}`;
  if (info.isFinish) return `${styles.cell} ${styles.cellFinish}`;
  if (info.hasP1 && info.hasP2) return `${styles.cell} ${styles.cellBoth}`;
  if (info.hasP1) return `${styles.cell} ${styles.cellP1}`;
  if (info.hasP2) return `${styles.cell} ${styles.cellP2}`;
  if (info.isLadder) return `${styles.cell} ${styles.cellLadder}`;
  if (info.isSnake) return `${styles.cell} ${styles.cellSnake}`;
  return styles.cell;
}

/**
 * Render the emoji/content for a cell, honoring facing for players.
 */
function getCellContent(
  info: CellInfo,
  facing: { p1: "left" | "right"; p2: "left" | "right" }
): React.ReactNode {
  if (info.hasP1 && info.hasP2) {
    return (
      <>
        <span className={`${styles.emoji} ${styles.face} ${facing.p1 === "right" ? styles.faceRight : styles.faceLeft}`}>🏃‍♂️</span>
        <span style={{ display: "inline-block", width: 6 }} />
        <span className={`${styles.emoji} ${styles.face} ${facing.p2 === "right" ? styles.faceRight : styles.faceLeft}`}>🏃‍♀️</span>
      </>
    );
  }
  if (info.hasP1) {
    return <span className={`${styles.emoji} ${styles.face} ${facing.p1 === "right" ? styles.faceRight : styles.faceLeft}`}>🏃‍♂️</span>;
  }
  if (info.hasP2) {
    return <span className={`${styles.emoji} ${styles.face} ${facing.p2 === "right" ? styles.faceRight : styles.faceLeft}`}>🏃‍♀️</span>;
  }
  if (info.isLadder) return <span className={styles.emoji}>🪜</span>;
  if (info.isSnake) return <span className={styles.emoji}>🐍</span>;
  return null;
}

/**
 * Snakes & Ladders board (serpentine layout).
 * - Visual bottom-origin numbering (startFromBottom)
 * - Sequence-based alternating tile background (2 normal, 3 dark, ...)
 * - Start/Finish special tiles (fixed colors, no numbers)
 */
const GameBoard: React.FC<GameBoardProps> = ({
  position1,
  position2,
  ladders,
  snakes,
  rows = 7,
  cols = 6,
  cellSizePx = 56,
  cellGapPx = 2,
  strictValidation = false,
  showArrows = true,
  arrowOpacity = 0.35,
  p1Facing = "right",
  p2Facing = "right",
  startFromBottom = true,
}) => {
  const totalCells = rows * cols;

  // Validate once per change.
  useMemo(() => {
    const issues = validateJumps(ladders, snakes, totalCells);
    if (issues.length) {
      const message = `GameBoard validation issues:\n- ${issues.join("\n- ")}`;
      if (strictValidation) throw new Error(message);
      // eslint-disable-next-line no-console
      console.warn(message);
    }
  }, [ladders, snakes, totalCells, strictValidation]);

  // Clamp player positions for safety.
  const p1 = Math.max(1, Math.min(position1, totalCells));
  const p2 = Math.max(1, Math.min(position2, totalCells));

  // Geometry that respects startFromBottom.
  const { totalWidth, totalHeight, centerOf } = useBoardGeometry(
    rows, cols, cellSizePx, cellGapPx, startFromBottom
  );

  // Build arrow segments (ladder up, snake down).
  const ladderSegments = useMemo(() => {
    return Object.entries(ladders).map(([s, e]) => {
      const start = Number(s), end = Number(e);
      return { start, end, a: centerOf(start), b: centerOf(end) };
    });
  }, [ladders, centerOf]);

  const snakeSegments = useMemo(() => {
    return Object.entries(snakes).map(([s, e]) => {
      const start = Number(s), end = Number(e);
      return { start, end, a: centerOf(start), b: centerOf(end) };
    });
  }, [snakes, centerOf]);

  return (
    <div
      className={styles.wrapper}
      style={
        {
          ["--cell-size" as any]: `${cellSizePx}px`,
          ["--cell-gap" as any]: `${cellGapPx}px`,
          ["--arrow-opacity" as any]: `${arrowOpacity}`,
        } as React.CSSProperties
      }
      aria-label={`Snakes and Ladders board ${rows} by ${cols}`}
    >
      <table className={styles.table} role="grid" aria-rowcount={rows} aria-colcount={cols}>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={`r-${r}`} className={styles.row} role="row">
              {Array.from({ length: cols }, (_, c) => {
                const pos = cellPosition(r, c, cols, rows, startFromBottom);
                const info: CellInfo = {
                  pos,
                  isLadder: ladders[pos] !== undefined,
                  isSnake: snakes[pos] !== undefined,
                  hasP1: pos === p1,
                  hasP2: pos === p2,
                  isStart: pos === 1,
                  isFinish: pos === totalCells,
                };

                const hideNumber = info.isStart || info.isFinish;
                const isAlt = (r + c) % 2 === 0;
                const label = hideNumber ? "" : String(pos - 1);

                return (
                  <td
                    key={`c-${pos}`}
                    role="gridcell"
                    className={`${getCellClass(info)} ${isAlt ? styles.cellAlt : ""}`}
                    aria-label={`Cell ${pos}${info.isLadder ? " with ladder" : ""}${info.isSnake ? " with snake" : ""}${info.hasP1 ? " with player 1" : ""}${info.hasP2 ? " with player 2" : ""}`}
                  >
                    {/* Corner number (hidden for start/finish) */}
                    <span className={`${styles.number} ${hideNumber ? styles.numberHidden : ""}`}>
                      {label}
                    </span>

                    {/* Center content: players or icons */}
                    <div className={styles.inner}>
                      {getCellContent(info, { p1: p1Facing, p2: p2Facing })}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Toggleable transparent arrows overlay (aligned via the same geometry) */}
      {showArrows && (
        <svg
          className={styles.overlay}
          width={totalWidth}
          height={totalHeight}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          aria-hidden="true"
        >
          <defs>
            <marker id="arrowhead-ladder" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto">
              <polygon points="0 0, 6 4, 0 8" className={styles.arrowLadder} />
            </marker>
            <marker id="arrowhead-snake" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto">
              <polygon points="0 0, 6 4, 0 8" className={styles.arrowSnake} />
            </marker>
          </defs>

          {ladderSegments.map(({ start, end, a, b }) => (
            <line
              key={`ladder-${start}-${end}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              className={styles.arrowLadder}
              strokeLinecap="round"
              markerEnd="url(#arrowhead-ladder)"
            />
          ))}

          {snakeSegments.map(({ start, end, a, b }) => (
            <line
              key={`snake-${start}-${end}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              className={styles.arrowSnake}
              strokeLinecap="round"
              markerEnd="url(#arrowhead-snake)"
            />
          ))}
        </svg>
      )}
    </div>
  );
};

export default GameBoard;