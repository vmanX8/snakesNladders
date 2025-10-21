/**
 * Board math helpers for serpentine grids and token facing.
 * These are UI-agnostic (pure functions) so they’re easy to test.
 */

export type Dir = "left" | "right";
export type JumpsMap = Record<number, number>;

/**
 * Convert a 1-based board position to visual (row, col) for a serpentine grid.
 * Rows/cols are zero-based; (0,0) is the visual top-left.
 *
 * Serpentine: even effective rows increase L→R, odd effective rows increase R→L.
 * If `startFromBottom` is true, we flip the visual row index so that position 1
 * appears on the bottom-left.
 */
export function posToRowCol(
  pos: number,
  rows: number,
  cols: number,
  startFromBottom = true
) {
  const max = rows * cols;
  if (pos < 1 || pos > max) return { row: 0, col: 0 };

  const effectiveRow = Math.floor((pos - 1) / cols);
  const posInRow = (pos - 1) % cols;

  // serpentine: even row → L→R, odd row → R→L
  const col = effectiveRow % 2 === 0 ? posInRow : cols - 1 - posInRow;
  // optionally flip so visual row 0 is the bottom row
  const row = startFromBottom ? rows - 1 - effectiveRow : effectiveRow;

  return { row, col };
}

/**
 * Return the natural horizontal "forward" direction on the row that contains `pos`
 * (according to serpentine numbering).
 */
export function forwardDirForPos(
  pos: number,
  _rows: number,
  cols: number
): Dir {
  const effectiveRow = Math.floor((pos - 1) / cols);
  return effectiveRow % 2 === 0 ? "right" : "left";
}

/**
 * Determine if a jump from `landed` to `final` was a snake or ladder.
 * Check mapping to avoid false positives.
 */
export function isSnakeJump(
  landed: number,
  final: number,
  snakes: JumpsMap
): boolean {
  return snakes[landed] === final;
}

export function isLadderJump(
  landed: number,
  final: number,
  ladders: JumpsMap
): boolean {
  return ladders[landed] === final;
}

/**
 * Decide the facing (“left”/“right”) for a token after a move.
 *
 * Rules:
 * 1) If the move triggered a snake → face LEFT.
 * 2) If the move triggered a ladder → face RIGHT.
 * 3) Otherwise:
 *    a) If prev and final are on the same visual row, compare columns:
 *       - col increases → RIGHT
 *       - col decreases → LEFT
 *    b) If row changed (normal roll crossing a row boundary), face the natural
 *       forward direction of the row you ended up on.
 *       If it was a backward move (shouldn’t happen outside snake), flip it.
 *
 * @param prev  previous 1-based position (before rolling)
 * @param landed  intermediate position after the dice (before snake/ladder)
 * @param final  final position after applying snake/ladder
 * @param rows   board rows
 * @param cols   board cols
 * @param startFromBottom must match GameBoard’s prop so rows map correctly
 */
export function computeFacingAfterMove(
  prev: number,
  landed: number,
  final: number,
  rows: number,
  cols: number,
  startFromBottom: boolean,
  snakes: JumpsMap,
  ladders: JumpsMap
): Dir {
  // Explicit snake/ladder rule first
  if (isSnakeJump(landed, final, snakes)) return "left";
  if (isLadderJump(landed, final, ladders)) return "right";

  // Compare visual positions prev → final
  const a = posToRowCol(prev, rows, cols, startFromBottom);
  const b = posToRowCol(final, rows, cols, startFromBottom);

  if (a.row === b.row) {
    if (b.col > a.col) return "right";
    if (b.col < a.col) return "left";
  }

  // Row changed without a snake/ladder
  const forward = forwardDirForPos(final, rows, cols);
  if (final >= prev) return forward;           // forward progress
  return forward === "right" ? "left" : "right"; // backward
}

/** Facing to use when a game starts or resets. */
export function defaultFacingOnReset(): Dir {
  return "right";
}
