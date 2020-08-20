import { Board } from "./board";
import './style.css';

window.addEventListener("DOMContentLoaded", () => {
    init();
});

function init() {
    const div = document.createElement('div');
    const board = new Board(div);
    document.body.appendChild(div);
}
