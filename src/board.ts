const B = 1
const W = -1
const E = 0;

type Stone = -1 | 0 | 1;
type Candidate = [[number, number], number, number]

const dirs = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1]
];

const MAX_SCORE = 8 * 8 + 1;
const MIN_SCORE = - MAX_SCORE;

function contains(x: number, y: number) {
    return 0 <= x && x < 8 && 0 <= y && y < 8;
}

function cloneBoard(board: Stone[][]) {
    const cloneBoard: Stone[][] = new Array(8);
    for (let i = 0; i < 8; ++i) {
        const row = board[i];
        const cloneRow = new Array(8);
        for (let j = 0; j < 8; ++j) {
            cloneRow[j] = row[j];
        }
        cloneBoard[i] = cloneRow;
    }
    return cloneBoard;
}

function putStone(board: Stone[][], stone: Stone, i: number, j: number) {
    if (board[i][j] != E) return 0;

    let diff = 0;
    for (const dir of dirs) {
        const [dx, dy] = dir;
        let count = 1;
        while (true) {
            const x = i + dx * count;
            const y = j + dy * count;
            if (!contains(x, y)) break;
            const s = board[x][y];
            if (s === E) break;
            if (s === stone) {
                if (count > 1) {
                    reverse(board, s, i, j, dx, dy, count);
                    diff += count - 1;
                }
                break;
            }
            count++;
        }
    }
    if (diff > 0) {
        board[i][j] = stone;
    }
    return diff;
}

function reverse(board: Stone[][], stone: Stone, x: number, y: number, dx: number, dy: number, count: number) {
    for (let i = 1; i < count; ++i) {
        x += dx, y += dy;
        board[x][y] = stone;
    }
}

function nextStone(stone: Stone): Stone {
    return (stone * -1) as Stone;
}

function evalScore(board: Stone[][], stone: Stone) {
    let score = 0;
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            const s = board[i][j];
            if (s === stone) {
                ++score;
            } else if (s !== E) {
                --score;
            }
        }
    }
    return score;
}

function maxCandidates(board: Stone[][], stone: Stone, depth: number) {
    const ns = nextStone(stone);
    let count = 0;
    let maxScore = MIN_SCORE;
    let nextBoard = cloneBoard(board);
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            const diff = putStone(nextBoard, stone, i, j);
            if (diff <= 0) continue;

            if (depth <= 0) {
                ++count;
                const score = evalScore(nextBoard, stone);
                maxScore = Math.max(maxScore, score);
            } else {
                const [score, n] = minCandidates(nextBoard, stone, depth - 1);
                count += n;
                if (score < MAX_SCORE) {
                    maxScore = Math.max(maxScore, score);
                } else {
                    const [score2, n2] = maxCandidates(nextBoard, stone, depth - 1);
                    count += n2;
                    if (score2 > MIN_SCORE) {
                        maxScore = Math.max(maxScore, score2);
                    } else {
                        if (!hasCandidates(nextBoard, stone) && !hasCandidates(nextBoard, ns)) {
                            maxScore = Math.max(maxScore, evalScore(nextBoard, stone));
                            ++count;
                        }
                    }
                }
            }
            nextBoard = cloneBoard(board);
        }
    }
    return [maxScore, count];
}

function minCandidates(board: Stone[][], stone: Stone, depth: number) {
    const ns = nextStone(stone);
    let count = 0;
    let minScore = MAX_SCORE;
    let nextBoard = cloneBoard(board);
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            const diff = putStone(nextBoard, ns, i, j);
            if (diff <= 0) continue;

            if (depth <= 0) {
                minScore = Math.min(minScore, evalScore(nextBoard, stone));
                ++count;
            } else {
                const [score, n] = maxCandidates(nextBoard, stone, depth - 1);
                count += n;
                if (score > MIN_SCORE) {
                    minScore = Math.min(minScore, score);
                } else {
                    const [score2, n2] = minCandidates(nextBoard, stone, depth - 1);
                    count += n2;
                    if (score2 < MAX_SCORE) {
                        minScore = Math.min(minScore, score2);
                    } else {
                        if (!hasCandidates(nextBoard, stone) && !hasCandidates(nextBoard, ns)) {
                            minScore = Math.min(minScore, evalScore(nextBoard, stone));
                            ++count;
                        }
                    }
                }
            }
            nextBoard = cloneBoard(board);
        }
    }
    return [minScore, count];
}


function maxCandidates2(board: Stone[][], stone: Stone, depth: number, upper: number): [number, number] {
    const ns = nextStone(stone);
    let count = 0;
    let maxScore = MIN_SCORE;
    let nextBoard = cloneBoard(board);
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            const diff = putStone(nextBoard, stone, i, j);
            if (diff <= 0) continue;

            if (depth <= 0) {
                ++count;
                const score = evalScore(nextBoard, stone);
                if (score > upper)
                    return [score, count];
                maxScore = Math.max(maxScore, score);
            } else {
                const [score, n] = minCandidates2(nextBoard, stone, depth - 1, maxScore);
                count += n;
                if (score < MAX_SCORE) {
                    if (score > upper)
                        return [score, count];
                    maxScore = Math.max(maxScore, score);
                } else {
                    const [score2, n2] = maxCandidates2(nextBoard, stone, depth - 1, MAX_SCORE);
                    count += n2;
                    if (score2 > MIN_SCORE) {
                        maxScore = Math.max(maxScore, score2);
                    } else {
                        if (!hasCandidates(nextBoard, stone) && !hasCandidates(nextBoard, ns)) {
                            maxScore = Math.max(maxScore, evalScore(nextBoard, stone));
                            ++count;
                        }
                    }
                }
            }
            nextBoard = cloneBoard(board);
        }
    }
    return [maxScore, count];
}

function minCandidates2(board: Stone[][], stone: Stone, depth: number, lower: number): [number, number] {
    const ns = nextStone(stone);
    let count = 0;
    let minScore = MAX_SCORE;
    let nextBoard = cloneBoard(board);
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            const diff = putStone(nextBoard, ns, i, j);
            if (diff <= 0) continue;

            if (depth <= 0) {
                ++count;
                const score = evalScore(nextBoard, stone);
                if (score < lower)
                    return [score, count];
                minScore = Math.min(minScore, score);
            } else {
                const [score, n] = maxCandidates2(nextBoard, stone, depth - 1, minScore);
                count += n;
                if (score > MIN_SCORE) {
                    if (score < lower)
                        return [score, count];
                    minScore = Math.min(minScore, score);
                } else {
                    const [score2, n2] = minCandidates(nextBoard, stone, depth - 1);
                    count += n2;
                    if (score2 < MAX_SCORE) {
                        minScore = Math.min(minScore, score2);
                    } else {
                        if (!hasCandidates(nextBoard, stone) && !hasCandidates(nextBoard, ns)) {
                            minScore = Math.min(minScore, evalScore(nextBoard, stone));
                            ++count;
                        }
                    }
                }
            }
            nextBoard = cloneBoard(board);
        }
    }
    return [minScore, count];
}

function candidateList(board: Stone[][], stone: Stone, depth: number) {
    const ns = nextStone(stone);
    const list: Candidate[] = [];
    let nextBoard = cloneBoard(board);
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            const diff = putStone(nextBoard, stone, i, j);
            if (diff <= 0) continue;

            if (depth <= 0) {
                list.push([[i, j], MIN_SCORE, 1]);
            } else {
                const [score, n] = minCandidates2(nextBoard, stone, depth - 1, MIN_SCORE);
                //const [minMaxScore, minMaxN] = minCandidates(nextBoard, stone, depth - 1);
                //console.log('minmax', minMaxScore, n, 'ab', score, n);

                if (score < MAX_SCORE) {
                    list.push([[i, j], score, n]);
                } else {
                    const [score2, n2] = maxCandidates(nextBoard, stone, depth - 1);
                    if (score2 > MIN_SCORE) {
                        list.push([[i, j], score2, n2]);
                    } else if (!hasCandidates(nextBoard, stone) && !hasCandidates(nextBoard, ns)) {
                        list.push([[i, j], evalScore(nextBoard, stone), 1]);
                    }
                }
            }
            nextBoard = cloneBoard(board);
        }
    }
    return list;
}

function hasCandidates(board: Stone[][], stone: Stone) {
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            if (board[i][j] != E) continue;
            
            for (const dir of dirs) {
                const [dx, dy] = dir;
                let count = 1;
                while (true) {
                    const x = i + dx * count;
                    const y = j + dy * count;
                    if (!contains(x, y)) break;
                    const s = board[x][y];
                    if (s === E) break;
                    if (s === stone) {
                        if (count > 1) return true;
                        break;
                    }
                    count++;
                }
            }
        }
    }
    return false;
}

function bestCandidates(board: Stone[][], stone: Stone, depth: number) {
    const list = candidateList(board, stone, depth);
    let bestPos = null;
    let maxScore = MIN_SCORE;
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
        alert('npc skip');
    }
    while (hasCandidates(board, stone)) {
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
        if (hasCandidates(board, ns)) {
            break;
        }
        alert('pass');
    }
}

class Board {

    npcEnabled: boolean = true;
    searchDepth: number = 7;
    scoreVisible: boolean = false;

    stone: Stone;
    board: Stone[][];

    div: HTMLDivElement;

    constructor(div: HTMLDivElement) {
        this.div = div;

        this.board = this.newBoard();
        this.stone = B;
        this.updateBoard(true, this.scoreVisible);
    }

    newBoard() {
        const board: Stone[][] = new Array(8);
        for (let i = 0; i < board.length; ++i) {
            board[i] = new Array(8).fill(E);
        }
        board[3][3] = B;
        board[3][4] = W;
        board[4][3] = W;
        board[4][4] = B;
        return board;
    }

    stones(stone: Stone) {
        let score = 0;
        for (let i = 0; i < 8; ++i) {
            for (let j = 0; j < 8; ++j) {
                if (this.board[i][j] == stone) {
                    ++score;
                }
            }
        }
        return score;
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
                this.board = this.newBoard();
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

        const bStones = this.stones(B);
        const wStones = this.stones(W);

        {
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
            tdTurn.innerHTML = (bStones + wStones - 3).toString();
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
        
        const bStones = this.stones(B);
        const wStones = this.stones(W);
        
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

                            setTimeout(() => {
                                const ns = nextStone(this.stone);
                                if (this.npcEnabled) {
                                    npc(this.board, ns);
                                    if (!hasCandidates(this.board, this.stone)) {
                                        this.stone = E;
                                    }
                                } else {
                                    if (hasCandidates(this.board, ns)) {
                                        this.stone = ns;
                                    } else if (!hasCandidates(this.board, this.stone)) {
                                        this.stone = E;
                                    }
                                }

                                this.updateBoard(true, this.scoreVisible);
                            }, 100);
                        }
                        td.appendChild(button);
                    }
                }
                tr.appendChild(td);
            }
        }
        //alert("search: "+ totalCount);
        return table;
    }
}

export { Board, Stone, B, W, E };