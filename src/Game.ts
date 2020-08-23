import {
    E, B, W,
    MIN_SCORE, MAX_SCORE,
    Board, Stone, Candidate,
    newBoard, putStone,
    reverse, hasCandidates,
    scanCandidates,
    evalScore, countTurns, countStones
} from './board';
import * as AlphaBeta from './method/alphabeta';
import * as MCTS from './method/mcts';
import * as Greedy from './method/greedy';

const version = '0.1.1';

function bestCandidates(board: Board, stone: Stone, algorithm: string) {
    let maxScore = MIN_SCORE;
    let list = [];
    let candidates: Candidate[];
    switch (algorithm) {
        case 'mcts': {
            candidates = MCTS.candidateList(board, stone);
            break;
        }
        case 'alphabeta': {
            candidates = AlphaBeta.candidateList(board, stone);
            break;
        }
        case 'greedy': {
            candidates = Greedy.candidateList(board, stone);
            break;
        }
        default:
            throw new Error();
    }
    for (const candidate of candidates) {
        const [ij, score] = candidate;
        if (maxScore < score) {
            maxScore = score;
            list = [];
            list.push(ij);
        } else if (maxScore == score) {
            list.push(ij);
        }
    }
    return list;
}

function npc(board: Board, stone: Stone, algorithm: string) {
    console.log('npc', algorithm);

    const ns = reverse(stone);
    if (!hasCandidates(board, stone)) {
        alert('NPC must pass.');
        return;
    }
    while (true) {
        const list = bestCandidates(board, stone, algorithm);
        const index = Math.floor(Math.random() * list.length);
        const xy = list[index];

        if (xy == null) {
            alert("illegal state 1");
            return;
        }

        const [x, y] = xy;
        const diff1 = putStone(board, stone, x, y);
        if (diff1 <= 0) {
            alert("illegal state 2");
        }
        if (hasCandidates(board, ns) || !hasCandidates(board, stone)) {
            break;
        }
        alert('You must pass.');
    }
}

function alertGameResult(board: Board, stone: Stone) {
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

    scoringAlgorithm: string = 'mcts';
    npcAlgorithm: string = 'mcts';

    npcLightEnabled: boolean = true;

    scoreVisible: boolean = false;

    stone: Stone;
    board: Board;

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
        div.append(this.createControllerDom());
    }

    createControllerDom() {
        const table = document.createElement('table');
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

            const select = document.createElement('select');
            select.id = 'score-algorithm'
            for (const algorithm of ['greedy', 'alphabeta', 'mcts']) {
                const option = document.createElement('option');
                option.innerHTML = algorithm.toString();
                option.value = algorithm.toString();
                select.appendChild(option);
                if (this.scoringAlgorithm == algorithm) {
                    option.selected = true;
                }
            }
            select.onchange = () => {
                for (const opt of select.selectedOptions) {
                    this.scoringAlgorithm = opt.value;
                    break;
                }
                console.log('algorithm: ', this.scoringAlgorithm);
                if (this.scoreVisible) {
                    this.updateBoard(true, this.scoreVisible);
                }
            };
            select.className = 'control';

            const tdScoring = document.createElement('td');
            tdScoring.appendChild(select);
            tr.appendChild(tdScoring);

            table.appendChild(tr);
        }
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
                    this.npcLightEnabled = true;
                } else {
                    this.npcLightEnabled = false;
                }
            };
            checkbox.checked = this.npcLightEnabled;
            checkbox.className = 'control';

            const td = document.createElement('td');
            td.appendChild(checkbox);
            tr.appendChild(td);

            const select = document.createElement('select');
            select.id = 'npc-algorithm'
            for (const algorithm of ['greedy', 'alphabeta', 'mcts']) {
                const option = document.createElement('option');
                option.innerHTML = algorithm.toString();
                option.value = algorithm.toString();
                select.appendChild(option);
                if (this.npcAlgorithm == algorithm) {
                    option.selected = true;
                }
            }
            select.onchange = () => {
                for (const opt of select.selectedOptions) {
                    this.npcAlgorithm = opt.value;
                    break;
                }
                console.log('algorithm: ', this.npcAlgorithm);
                if (this.scoreVisible) {
                    this.updateBoard(true, this.scoreVisible);
                }
            };
            select.className = 'control';

            const tdAlgorithm = document.createElement('td');
            tdAlgorithm.appendChild(select);
            tr.appendChild(tdAlgorithm);

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

            const thVersion = document.createElement('th');
            thVersion.className = 'info';
            thVersion.innerHTML = 'Version';
            tr.appendChild(thVersion);

            table.appendChild(tr);
        }

        {
            if (this.stone !== E
                    && !hasCandidates(this.board, this.stone)
                    && !hasCandidates(this.board, reverse(this.stone))) {
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

            const tdVersion = document.createElement('td');
            tdVersion.className = 'info';
            tdVersion.innerHTML = version;
            tr.appendChild(tdVersion);

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
        const table = document.createElement("table");
        table.className = 'board';
    
        const s = this.stone;

        let list: Candidate[];
        if (scoreVisible && buttonEnabled) {
            console.log('scoring', this.scoringAlgorithm);
            if (this.scoringAlgorithm === 'mcts') {
                list = MCTS.candidateList(this.board, s);
            } else if (this.scoringAlgorithm === 'alphabeta') {
                list = AlphaBeta.candidateList(this.board, s);
            } else if (this.scoringAlgorithm === 'greedy') {
                list = Greedy.candidateList(this.board, s);
            } else {
                throw new Error('algorithm: '+ this.scoringAlgorithm);
            }
        } else if (buttonEnabled) {
            list = scanCandidates(this.board, s);
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
                            if (s === B) {
                                button.className = 'best-candidate-b';
                                button.value = Math.round(score).toString();
                            } else if (s === W) {
                                button.className = 'best-candidate-w';
                                button.value = Math.round(score).toString();
                            }
                        } else {
                            if (s === B) {
                                button.className = 'candidate-b';
                                button.value = Math.round(score).toString();
                            } else if (s === W) {
                                button.className = 'candidate-w';
                                button.value = Math.round(score).toString();
                            }
                        }
                        button.onclick = () => {
                            const diff = putStone(this.board, this.stone, i, j);
                            if (diff <= 0) return;

                            this.updateBoard(false, false);

                            const ns = reverse(this.stone);
                            if (!hasCandidates(this.board, this.stone)
                                    && !hasCandidates(this.board, ns) ) {
                                this.stone = E;
                                alertGameResult(this.board, s);
                                return;
                            }

                            this.updateBoard(false, false);

                            setTimeout(() => {
                                if (this.npcLightEnabled) {
                                    npc(this.board, ns, this.npcAlgorithm);
                                    if (!hasCandidates(this.board, this.stone)) {
                                        this.stone = E;
                                        alertGameResult(this.board, s);
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