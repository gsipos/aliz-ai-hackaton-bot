export const planetsOfPlayer = (player: string) => (planets: Planet[]) =>
  planets.filter(p => p.owner === player);

export const getLeaderBoard = (game: GameState) => {
  const board: Record<string, number> = {};
  game.players.forEach(p => (board[p] = 0));
  game.fleets.forEach(f => (board[f.owner] = board[f.owner] + f.numberOfShips));
  game.planets.forEach(
    p => (board[p.owner] = board[p.owner] + p.numberOfShips)
  );
  return board;
};

export const distance = (destination: Planet, source: Planet) => {
  return Math.ceil(
    Math.sqrt(
      Math.pow(destination.coordinates.x - source.coordinates.x, 2) +
        Math.pow(destination.coordinates.y - source.coordinates.y, 2)
    )
  ) + 1;
};

export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const growth = (planet: Planet) => planet.owner === 'NEUTRAL' ? 0 : planet.growthRate;