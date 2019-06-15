import { processGame } from "./game";

export async function bot(req: any, res: any) {
    try {
        const player = req.query.player;
        
        if (req.body.type === 'START_GAME') {
            res.status(200);
            res.send('OK')
            return;
        }

        const gamestate = req.body.gameState;

        const commands = processGame(gamestate, player);
    
        res.status(200);
        res.send(commands);

        console.info(gamestate);
        console.warn(JSON.stringify(commands));
    } catch (error) {
        res.status(500);
        res.send('Bloody hell!');

        console.error(error);
    }
    console.debug('Request End');
}