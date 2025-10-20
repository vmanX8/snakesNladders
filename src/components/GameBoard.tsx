import React, { useMemo } from "react";
import styles from "./GameBoard.module.css";

export type JumpsMap = Record<number, number>;

export type GameBoardProps = {
  position1: number;
  position2: number;
  ladders: JumpsMap;
  snakes: JumpsMap;
  rows?: number;
  cols?: number;
  cellSizePx?: number;
  cellGapPx?: number;
  strictValidation?: boolean;

  /** Show or hide the SVG arrows overlay (default: true). */
  showArrows?: boolean;
  /** Arrow opacity (0..1). Default 0.35 */
  arrowOpacity?: number;
};

type CellInfo = {
  pos: number;
  isLadder: boolean;
  isSnake: boolean;
  hasP1: boolean;
  hasP2: boolean;
};

function cellPosition(row: number, col: number, cols: number): number {
  const isEvenRow = row % 2 === 0;
  const base = row * cols;
  return isEvenRow ? base + col + 1 : base + (cols - col);
}

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

function useBoardGeometry(rows: number, cols: number, cellSize: number, gap: number) {
  const index = useMemo(() => {
    const posToRC = new Map<number, { r: number; c: number }>();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pos = cellPosition(r, c, cols);
        posToRC.set(pos, { r, c });
      }
    }
    return posToRC;
  }, [rows, cols]);

  const totalWidth = cols * cellSize + (cols - 1) * gap;
  const totalHeight = rows * cellSize + (rows - 1) * gap;

  const centerOf = (pos: number) => {
    const rc = index.get(pos);
    if (!rc) return { x: 0, y: 0 };
    const x = rc.c * (cellSize + gap) + cellSize / 2;
    const y = rc.r * (cellSize + gap) + cellSize / 2;
    return { x, y };
  };

  return { index, centerOf, totalWidth, totalHeight };
}

function getCellClass(info: CellInfo): string {
  if (info.hasP1 && info.hasP2) return `${styles.cell} ${styles.cellBoth}`;
  if (info.hasP1) return `${styles.cell} ${styles.cellP1}`;
  if (info.hasP2) return `${styles.cell} ${styles.cellP2}`;
  if (info.isLadder) return `${styles.cell} ${styles.cellLadder}`;
  if (info.isSnake) return `${styles.cell} ${styles.cellSnake}`;
  return styles.cell;
}

function getCellContent(info: CellInfo): React.ReactNode {
  if (info.hasP1 && info.hasP2) return <span className={styles.emoji}>🏃‍♂️🏃‍♀️</span>;
  if (info.hasP1) return <span className={styles.emoji}>🏃‍♂️</span>;
  if (info.hasP2) return <span className={styles.emoji}>🏃‍♀️</span>;
  if (info.isLadder) return <span className={styles.emoji}>🪜</span>;
  if (info.isSnake) return <span className={styles.emoji}>🐍</span>;
  return null;
}

const GameBoard: React.FC<GameBoardProps> = ({
  position1,
  position2,
  ladders,
  snakes,
  rows = 6,
  cols = 5,
  cellSizePx = 56,
  cellGapPx = 2,
  strictValidation = false,
  showArrows = true,
  arrowOpacity = 0.35,
}) => {
  const totalCells = rows * cols;

  useMemo(() => {
    const issues = validateJumps(ladders, snakes, totalCells);
    if (issues.length) {
      const message = `GameBoard validation issues:\n- ${issues.join("\n- ")}`;
      if (strictValidation) throw new Error(message);
      console.warn(message);
    }
  }, [ladders, snakes, totalCells, strictValidation]);

  const p1 = Math.max(0, Math.min(position1, totalCells));
  const p2 = Math.max(0, Math.min(position2, totalCells));

  const { totalWidth, totalHeight, centerOf } = useBoardGeometry(rows, cols, cellSizePx, cellGapPx);

  const ladderSegments = useMemo(() => Object.entries(ladders).map(([s, e]) => {
    const start = Number(s), end = Number(e);
    return { start, end, a: centerOf(start), b: centerOf(end) };
  }), [ladders, centerOf]);

  const snakeSegments = useMemo(() => Object.entries(snakes).map(([s, e]) => {
    const start = Number(s), end = Number(e);
    return { start, end, a: centerOf(start), b: centerOf(end) };
  }), [snakes, centerOf]);

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
                const pos = cellPosition(r, c, cols);
                const info: CellInfo = {
                  pos,
                  isLadder: ladders[pos] !== undefined,
                  isSnake: snakes[pos] !== undefined,
                  hasP1: pos === p1,
                  hasP2: pos === p2,
                };
                const isAlt = (r + c) % 2 === 0;

                return (
                  <td
                    key={`c-${pos}`}
                    role="gridcell"
                    className={`${getCellClass(info)} ${isAlt ? styles.cellAlt : ""}`}
                    aria-label={`Cell ${pos}${info.isLadder ? " with ladder" : ""}${info.isSnake ? " with snake" : ""}${info.hasP1 ? " with player 1" : ""}${info.hasP2 ? " with player 2" : ""}`}
                  >
                    <span className={styles.number}>{pos}</span>
                    <div className={styles.inner}>{getCellContent(info)}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {showArrows && (
        <svg className={styles.overlay} width={totalWidth} height={totalHeight} viewBox={`0 0 ${totalWidth} ${totalHeight}`} aria-hidden="true">
          <defs>
            <marker id="arrowhead-ladder" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" className={styles.arrowLadder} />
            </marker>
            <marker id="arrowhead-snake" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" className={styles.arrowSnake} />
            </marker>
          </defs>

          {ladderSegments.map(({ start, end, a, b }) => (
            <line key={`ladder-${start}-${end}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={styles.arrowLadder} strokeLinecap="round" markerEnd="url(#arrowhead-ladder)" />
          ))}
          {snakeSegments.map(({ start, end, a, b }) => (
            <line key={`snake-${start}-${end}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={styles.arrowSnake} strokeLinecap="round" markerEnd="url(#arrowhead-snake)" />
          ))}
        </svg>
      )}
    </div>
  );
};

export default GameBoard;
