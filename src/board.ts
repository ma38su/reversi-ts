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

function countStones(board: Stone[][], stone: Stone) {
    let score = 0;
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            if (board[i][j] == stone) {
                ++score;
            }
        }
    }
    return score;
}

function countTurns(board: Stone[][]) {
    let score = 0;
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            if (board[i][j] !== E) {
                ++score;
            }
        }
    }
    return score - 3;
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

function nextStone(stone: Stone): Stone {
    return (stone * -1) as Stone;
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

function contains(x: number, y: number) {
    return 0 <= x && x < 8 && 0 <= y && y < 8;
}

function reverse(board: Stone[][], stone: Stone, x: number, y: number, dx: number, dy: number, count: number) {
    for (let i = 1; i < count; ++i) {
        x += dx, y += dy;
        board[x][y] = stone;
    }
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

function newBoard() {
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

export {
    E, B, W,
    dirs,
    MIN_SCORE, MAX_SCORE,
    Stone, Candidate,
    newBoard,
    cloneBoard, nextStone, putStone, hasCandidates,
    countStones, countTurns, evalScore
};