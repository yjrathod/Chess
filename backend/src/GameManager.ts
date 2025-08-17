import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game"; 

// Define a placeholder Game type if not already defined

export class GameManager {

    private games: Game[];
    private pendingUser: WebSocket | null = null;
    private users: WebSocket[];

    constructor() {
        this.games = [];
        this.users = [];
        this.pendingUser = null;
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);
        this.addHandlers(socket);
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user !== socket);
        // stop the game here because the user has disconnected
    }

    private addHandlers(socket: WebSocket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === INIT_GAME) {
                if(this.pendingUser) {
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = socket;
                }
            }

            if (message.type === MOVE) {
                const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
                if (game) {
                    game.makeMove(socket, message.move);
                }
            }
        });
    }
}