import { distance, growth } from "./functions";

let state: GameState;
let me: string;

let enemyFleets: Fleet[];
let myFleets: Fleet[];
let myPlanets: ExtendedPlanet[];
let enemyPlanets: ExtendedPlanet[];
let neutralPlanets: ExtendedPlanet[];

export const processGame = (gameState: GameState, player: string) => {
  state = gameState;
  me = player;

  enemyFleets = (state.fleets || []).filter(f => f.owner !== me);

  myFleets = (state.fleets || []).filter(f => f.owner === me);

  (state.planets as ExtendedPlanet[]).forEach(extendPlanet);

  neutralPlanets = state.planets.filter(
    p => p.owner === "NEUTRAL"
  ) as ExtendedPlanet[];

  enemyPlanets = state.planets
    .filter(p => p.owner !== me)
    .sort((a, b) => b.growthRate - a.growthRate) as ExtendedPlanet[];

  myPlanets = state.planets
    .filter(p => p.owner === me)
    .sort((a, b) => b.growthRate - a.growthRate) as ExtendedPlanet[];

  const commands: Command[] = [];
  reinforcePlanets(commands);
  reinforceFleet(commands);
  naiveAttack(commands);
  //fleePlanet(commands);
  idleAttack(commands);

  return { commands };
};

const reinforcePlanets = (commands: Command[]) => {
  myPlanets
    .filter(p => p.balance > 0)
    .map(p => {
      const reinforceNeeded = myPlanets
        .filter(m => m.balance < 0)
        .find(
          m =>
            Math.abs(m.balance) -
              growth(m) * m.turnToLose +
              (distance(m, p) - m.turnToLose) * growth(m) +
              2 <
            p.balance
        );

      if (reinforceNeeded) {
        const army =
          Math.abs(reinforceNeeded.balance) + distance(reinforceNeeded, p) + 2;
        commands.push({
          numberOfShips: army,
          sourcePlanet: p.id,
          destinationPlanet: reinforceNeeded.id
        });
        reinforceNeeded.balance += army;
        p.balance -= army;
      }
    });
};

const reinforceFleet = (command: Command[]) => {
  enemyPlanets
    .filter(e => e.balance < 0)
    .filter(e => e.inboundAllies > 0)
    .forEach(e => {
      myPlanets
        .filter(m => m.balance > 10)
        .forEach(m => {
          command.push({
            sourcePlanet: m.id,
            destinationPlanet: e.id,
            numberOfShips: Math.min(e.balance + 2, m.balance - 10)
          });
        });
    });
};

const naiveAttack = (commands: Command[]) => {
  myPlanets
    .filter(p => p.balance > 0)
    .map(p => {
      const target = [...enemyPlanets]
        .sort((a, b) => {
          const costA = growth(a) / Math.abs(a.balance);
          const costB = growth(b) / Math.abs(b.balance);
          return costB - costA;
        })
        .filter(e => e.balance < 0)
        .find(
          e => Math.abs(e.balance) + distance(p, e) * growth(e) + 2 < p.balance
        );
      if (target) {
        const army =
          Math.abs(target.balance) + distance(p, target) * growth(target) + 2;
        commands.push({
          numberOfShips: army,
          sourcePlanet: p.id,
          destinationPlanet: target.id
        });
        target.balance += army;
        p.balance -= army;
      }
    });
};

const idleAttack = (commands: Command[]) => {
  myPlanets
    .filter(m => m.inboundEnemies < 10)
    .filter(m => m.balance > 50)
    .forEach(m => {
      const target = [...enemyPlanets].sort(
        (a, b) => distance(a, m) - distance(b, m)
      )[0];
      if (target) {
        commands.push({
          numberOfShips: 25,
          sourcePlanet: m.id,
          destinationPlanet: target.id
        });
        m.balance -= 25;
        target.balance += 25;
      }
    });
};

const fleePlanet = (commands: Command[]) => {
  const alivePlanets = myPlanets.filter(p => p.balance > 0);
  myPlanets
    .filter(p => p.balance < 0)
    .forEach(p => {
      const haven = [...alivePlanets].sort(
        (a, b) => distance(a, p) - distance(b, p)
      )[0];
      if (haven) {
        commands.push({
          numberOfShips: p.numberOfShips - 1,
          destinationPlanet: haven.id,
          sourcePlanet: p.id
        });
      }
    });
};

const extendPlanet = (p: ExtendedPlanet) => {
  const inboundEnemyFleets = enemyFleets.filter(f => f.targetPlanet === p.id);
  p.inboundEnemies = inboundEnemyFleets
    .map(f => f.numberOfShips)
    .reduce((a, b) => a + b, 0);

  p.inboundAllies = myFleets
    .filter(f => f.targetPlanet === p.id)
    .map(f => f.numberOfShips)
    .reduce((a, b) => a + b, 0);

  if (p.owner === me) {
    p.balance = p.numberOfShips + p.inboundAllies - p.inboundEnemies;
    if (p.balance < 0) {
      const sortedIncoming = [...(state.fleets || [])].sort(
        (a, b) => a.turnsRemaining - b.turnsRemaining
      );
      let balance = p.numberOfShips;
      let turns = 0;
      while (balance > 0 || !sortedIncoming.length) {
        const fleet = sortedIncoming.shift();
        if (fleet) {
          if (fleet.owner === me) {
            balance += fleet.numberOfShips;
            turns = fleet.turnsRemaining;
          } else {
            balance -= fleet.numberOfShips;
            turns = fleet.turnsRemaining;
          }
        }
      }
      p.turnToLose = turns;
    }
  } else if (p.owner === "NEUTRAL") {
    p.balance = p.inboundAllies - Math.abs(p.inboundEnemies - p.numberOfShips);
  } else {
    p.balance = p.inboundAllies - p.numberOfShips - p.inboundEnemies;
  }
};
