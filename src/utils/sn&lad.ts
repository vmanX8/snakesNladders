export interface Snakes {
  [key: number]: number;
}

export interface Ladders {
  [key: number]: number;
}

export const generateSnakesAndLadders = (count = 3): { snakes: Snakes; ladders: Ladders } => {
  const snakes: Snakes = {};
  const ladders: Ladders = {};
  const used = new Set<number>();

  while (Object.keys(snakes).length < count) {
    const from = Math.floor(Math.random() * 28) + 2; // from 2 to 29
    const to = Math.floor(Math.random() * (from - 1)) + 1; // less than from

    if (!used.has(from) && from !== to && to !== 30 && !snakes[from] && !ladders[from]) {
      snakes[from] = to;
      used.add(from);
    }
  }

  while (Object.keys(ladders).length < count) {
    const from = Math.floor(Math.random() * 28) + 1; // from 1 to 28
    const to = Math.floor(Math.random() * (30 - from)) + from + 1; // greater than from

    if (!used.has(from) && from !== to && to !== 30 && !ladders[from] && !snakes[from]) {
      ladders[from] = to;
      used.add(from);
    }
  }

  return { snakes, ladders };
};

export const getNewPosition = (pos: number, snakes: Snakes, ladders: Ladders): number => {
  if (ladders[pos]) return ladders[pos];
  if (snakes[pos]) return snakes[pos];
  return pos;
};