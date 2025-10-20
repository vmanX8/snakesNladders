export interface Snakes { [key: number]: number; }   // head -> tail (tail < head)
export interface Ladders { [key: number]: number; }  // start -> end (end > start)

/** Generate random snakes and ladders for a board. */
export const generateSnakesAndLadders = (
  count = 3,
  maxCell = 30
): { snakes: Snakes; ladders: Ladders } => {
  const snakes: Snakes = {};
  const ladders: Ladders = {};
  const used = new Set<number>();

  const rand = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Snakes: head > tail
  while (Object.keys(snakes).length < count) {
    const from = rand(3, maxCell - 1);
    const to = rand(1, from - 2);
    if (!used.has(from) && !used.has(to) && !snakes[from] && !ladders[from] && from !== to) {
      snakes[from] = to;
      used.add(from); used.add(to);
    }
  }

  // Ladders: end > start
  while (Object.keys(ladders).length < count) {
    const from = rand(1, maxCell - 3);
    const to = rand(from + 2, maxCell - 1);
    if (!used.has(from) && !used.has(to) && !ladders[from] && !snakes[from] && from !== to) {
      ladders[from] = to;
      used.add(from); used.add(to);
    }
  }

  return { snakes, ladders };
};

/** Apply snakes & ladders: return the new position for a player after they land on `pos`. */
export const getNewPosition = (pos: number, snakes: Snakes, ladders: Ladders): number => {
  if (ladders[pos]) return ladders[pos];
  if (snakes[pos]) return snakes[pos];
  return pos;
};
