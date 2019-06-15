
interface Planet {
    id: string;
    owner: string;
    numberOfShips: number;
    growthRate: number;
    coordinates: { x: number; y: number };
}

interface Fleet {
    owner: string;
    sourcePlanet: string;
    targetPlanet: string;
    numberOfShips: number;
    totalTripLength: number;
    turnsRemaining: number;
}

interface GameState {
    planets: Planet[];
    players: string[];
    fleets: Fleet[];

    turn: number;
    id: string;
    startedAt: number;
    mapId: string;
}

interface Command {
    sourcePlanet: string;
    destinationPlanet: string;
    numberOfShips: number;
}

interface CommandResponse {
    commands: Command[];
}

interface ExtendedPlanet extends Planet {
    inboundEnemies: number;
    inboundAllies: number;
    balance: number;
    targeted?: boolean;
    turnToLose: number;
}