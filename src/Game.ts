import {
    E, B, W,
    dirs,
    MIN_SCORE, MAX_SCORE,
    Stone, Candidate,
    newBoard, putStone,
    nextStone, hasCandidates,
    evalScore, countTurns, countStones
} from './board';
import { candidateList } from './method/alphabeta';

function bestCandidates(board: Stone[][], stone: Stone, depth: number) {
    let bestPos = null;
    let maxScore = MIN_SCORE;

    const list = candidateList(board, stone, depth);
    for (const candidate of list) {
        const [ij, score] = candidate;
        if (maxScore < score) {
            maxScore = score;
            bestPos = ij;
        }
    }
    return bestPos;
}

function npc(board: Stone[][], stone: Stone) {
    const ns = nextStone(stone);
    if (!hasCandidates(board, stone)) {
        alert('NPC must pass.');
        return;
    }
    while (true) {
        const ij = bestCandidates(board, stone, 5);
        if (!ij) {
            alert("illegal state 1");
            return;
        }

        const [i, j] = ij;
        const diff1 = putStone(board, stone, i, j);
        if (diff1 <= 0) {
            alert("illegal state 2");
        }
        if (hasCandidates(board, ns) || !hasCandidates(board, stone)) {
            break;
        }
        alert('You must pass.');
    }
}

function alertGameResult(board: Stone[][], stone: Stone) {
    setTimeout(() => {
        const score = evalScore(board, stone);
        if (score == 0) {
            alert("Draw");
        } else if (score > 0) {
            alert("Win");
        } else {
            alert("Lose");
        }
    }, 100);
}

class Game {

    yourStone: Stone = B;
    npcEnabled: boolean = true;

    searchDepth: number = 5;
    scoreVisible: boolean = false;

    stone: Stone;
    board: Stone[][];

    div: HTMLDivElement;

    constructor() {
        this.div = document.createElement('div');

        this.board = newBoard();
        this.stone = B;
        this.updateBoard(true, this.scoreVisible);
    }

    updateBoard(buttonEnabled: boolean, scoreVisible: boolean) {
        const div = this.div;
        div.innerHTML = '';

        div.appendChild(this.createBoardDom(buttonEnabled, scoreVisible));
        div.append(this.createInfoDom());
        div.append(this.createScoreDom());
        div.append(this.controllerDom());
    }

    controllerDom() {
        const table = document.createElement('table');
        {
            const tr = document.createElement('tr');

            const label = document.createElement('label');
            label.innerHTML = 'NPC';
            label.htmlFor = 'npc-check'; 

            const th = document.createElement('th');
            th.appendChild(label);
            tr.appendChild(th);

            const checkbox = document.createElement('input');
            checkbox.id = 'npc-check';
            checkbox.type = 'checkbox';
            checkbox.onchange = () => {
                if (checkbox.checked) {
                    this.npcEnabled = true;
                } else {
                    this.npcEnabled = false;
                }
            };
            checkbox.checked = this.npcEnabled;
            checkbox.className = 'control';

            const td = document.createElement('td');
            td.appendChild(checkbox);
            tr.appendChild(td);
            table.appendChild(tr);
        }
        {
            const tr = document.createElement('tr');

            const label = document.createElement('label');
            label.innerHTML = 'Score';
            label.htmlFor = 'score-check'; 

            const th = document.createElement('th');
            th.appendChild(label);
            tr.appendChild(th);

            const checkbox = document.createElement('input');
            checkbox.id = 'score-check'
            checkbox.type = 'checkbox';
            checkbox.onchange = () => {
                if (checkbox.checked) {
                    this.scoreVisible = true;
                } else {
                    this.scoreVisible = false;
                }
                this.updateBoard(true, this.scoreVisible);
            };
            checkbox.checked = this.scoreVisible;
            checkbox.className = 'control';

            const td = document.createElement('td');
            td.appendChild(checkbox);
            tr.appendChild(td);
            table.appendChild(tr);
        }
        {
            const tr = document.createElement('tr');

            const label = document.createElement('label');
            label.innerHTML = 'Depth';
            label.htmlFor = 'depth-input'; 

            const th = document.createElement('th');
            th.appendChild(label);
            tr.appendChild(th);

            const select = document.createElement('select');
            select.id = 'depth'
            for (let depth of [1, 2, 3, 4, 5, 6, 7, 8]) {
                const option = document.createElement('option');
                option.innerHTML = depth.toString();
                option.value = depth.toString();
                select.appendChild(option);
                if (this.searchDepth == depth) {
                    option.selected = true;
                }
            }
            select.onchange = () => {
                for (const opt of select.selectedOptions) {
                    this.searchDepth = parseInt(opt.value);
                    break;
                }
                console.log('search-depth: ', this.searchDepth);
                if (this.scoreVisible) {
                    this.updateBoard(true, this.scoreVisible);
                }
            };
            select.className = 'control';

            const td = document.createElement('td');
            td.appendChild(select);
            tr.appendChild(td);
            table.appendChild(tr);
        }
        {
            const tr = document.createElement('tr');

            const th = document.createElement('th');
            tr.appendChild(th);

            const buttonReset = document.createElement('input');
            buttonReset.type = 'button';
            buttonReset.value = 'Reset';
            buttonReset.onclick = () => {
                this.board = newBoard();
                this.stone = B;
                this.updateBoard(true, this.scoreVisible);
            };
            buttonReset.className = 'control';

            const td = document.createElement('td');
            td.appendChild(buttonReset);
            tr.appendChild(td);
            table.appendChild(tr);
        }

        return table;
    }

    createInfoDom() {
        const table = document.createElement("table");

        {
            const tr = document.createElement("tr");

            const thNext = document.createElement('th');
            thNext.className = 'info';
            thNext.innerHTML = 'Next';
            tr.appendChild(thNext);

            const thTurn = document.createElement('th');
            thTurn.className = 'info';
            thTurn.innerHTML = 'Turn';
            tr.appendChild(thTurn);

            table.appendChild(tr);
        }

        {
            if (this.stone !== E
                    && !hasCandidates(this.board, this.stone)
                    && !hasCandidates(this.board, nextStone(this.stone))) {
                this.stone = E;
            }

            const tr = document.createElement("tr");

            const tdNext = document.createElement('td');
            if (this.stone == B) {
                tdNext.className = 'b info';
                tdNext.innerHTML = '●';
            } else if (this.stone == W) {
                tdNext.className = 'w info';
                tdNext.innerHTML = '●';
            } else {
                tdNext.innerHTML = 'Game End';
                tdNext.className = 'info';
            }
            tr.appendChild(tdNext);

            const tdTurn = document.createElement('td');
            tdTurn.className = 'info';

            const stones = countTurns(this.board);
            tdTurn.innerHTML = (stones - 3).toString();
            tr.appendChild(tdTurn);

            table.appendChild(tr);
        }
        return table;
    }

    createScoreDom() {
        const table = document.createElement("table");

        {
            const tr = document.createElement("tr");

            const thName = document.createElement('th');
            thName.className = 'score';
            thName.innerHTML = 'Name';
            tr.appendChild(thName);

            const thBlack = document.createElement('th');
            thBlack.className = 'score';
            thBlack.innerHTML = 'Black';
            tr.appendChild(thBlack);

            const thWhite = document.createElement('th');
            thWhite.className = 'score';
            thWhite.innerHTML = 'White';
            tr.appendChild(thWhite);

            table.appendChild(tr);
        }
        
        const bStones = countStones(this.board, B);
        const wStones = countStones(this.board, W);
        
        {
            const tr = document.createElement("tr");

            const tdLabel = document.createElement('td');
            tdLabel.className = 'score';
            tdLabel.innerHTML = 'Stones';
            tr.appendChild(tdLabel);
    
            const tdBlack = document.createElement('td');
            tdBlack.className = 'score';
            tdBlack.innerHTML = bStones.toString();
            tr.appendChild(tdBlack);
    
            const tdWhite = document.createElement('td');
            tdWhite.className = 'score';
            tdWhite.innerHTML = wStones.toString();
            tr.appendChild(tdWhite);

            table.appendChild(tr);
        }

        {
            const tr = document.createElement("tr");

            const tdLabel = document.createElement('td');
            tdLabel.className = 'score';
            tdLabel.innerHTML = 'Score';
            tr.appendChild(tdLabel);
    
            const tdBlack = document.createElement('td');
            tdBlack.className = 'score';
            tdBlack.innerHTML = (bStones - wStones).toString();
            tr.appendChild(tdBlack);
    
            const tdWhite = document.createElement('td');
            tdWhite.className = 'score';
            tdWhite.innerHTML = (wStones - bStones).toString();
            tr.appendChild(tdWhite);
            table.appendChild(tr);
        }

        return table;
    }

    createBoardDom(buttonEnabled: boolean, scoreVisible: boolean) {
        const yourStone = this.yourStone;
        const table = document.createElement("table");
        table.className = 'board';
    
        const ns = this.stone;

        let list: Candidate[];
        if (scoreVisible && buttonEnabled) {
            list = candidateList(this.board, ns, this.searchDepth);
        } else if (buttonEnabled) {
            list = candidateList(this.board, ns, 0);
        } else {
            list = [];
        }

        let totalCount = 0;
        let maxScore = MIN_SCORE;
        for (const candidate of list) {
            const [ij, score, count] = candidate;
            maxScore = Math.max(maxScore, score);
            totalCount += count;
        }

        for (let i = 0; i < 8; ++i) {
            const tr = document.createElement("tr");
            tr.className = 'board';
            table.appendChild(tr);
    
            for (let j = 0; j < 8; ++j) {
                const td = document.createElement("td");
                const stone = this.board[i][j];
                if (stone === B) {
                    td.innerHTML = '●';
                    td.className = 'board b';
                } else if (stone == W) {
                    td.innerHTML = '●';
                    td.className = 'board w';
                } else {
                    td.className = 'board';
                    let score = null;
                    for (const data of list) {
                        const [i1, j1] = data[0];
                        if (i1 === i && j1 === j) {
                            score = data[1];
                            break;
                        }
                    }
                    if (score != null) {
                        const button = document.createElement("input");
                        button.type = 'button';

                        if (score == MIN_SCORE) {
                            button.className = 'candidate';
                            button.value = '';
                        } else if (score == maxScore) {
                            if (ns === B) {
                                button.className = 'best-candidate-b';
                                button.value = ''+ score;
                            } else if (ns === W) {
                                button.className = 'best-candidate-w';
                                button.value = ''+ score;
                            }
                        } else {
                            if (ns === B) {
                                button.className = 'candidate-b';
                                button.value = ''+ score;
                            } else if (ns === W) {
                                button.className = 'candidate-w';
                                button.value = ''+ score;
                            }
                        }
                        button.onclick = () => {
                            const diff = putStone(this.board, this.stone, i, j);
                            if (diff <= 0) return;

                            this.updateBoard(false, false);

                            const ns = nextStone(this.stone);
                            if (!hasCandidates(this.board, this.stone)
                                    && !hasCandidates(this.board, ns) ) {
                                this.stone = E;
                                alertGameResult(this.board, yourStone);
                                return;
                            }

                            this.updateBoard(false, false);

                            setTimeout(() => {
                                if (this.npcEnabled) {
                                    npc(this.board, ns);
                                    if (!hasCandidates(this.board, this.stone)) {
                                        this.stone = E;
                                        alertGameResult(this.board, yourStone);
                                    }
                                } else {
                                    if (hasCandidates(this.board, ns)) {
                                        this.stone = ns;
                                    } else if (!hasCandidates(this.board, this.stone)) {
                                        this.stone = E;
                                    }
                                }
                                this.updateBoard(true, this.scoreVisible);
                            }, 10);
                        }
                        td.appendChild(button);
                    }
                }
                tr.appendChild(td);
            }
        }
        return table;
    }
}

export { Game, Stone, B, W, E };