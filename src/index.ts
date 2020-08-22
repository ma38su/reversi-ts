import { Game } from "./Game";
import './style.css';

window.addEventListener("DOMContentLoaded", () => {
    init();
});

function init() {
    const game = new Game();
    document.body.appendChild(game.div);
}
