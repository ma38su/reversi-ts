const B = 1
const W = -1
const E = 0;

type Stone = -1 | 0 | 1;
type Board = Stone[][];
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

function scanCandidates(board: Board, stone: Stone) {
    const list: Candidate[] = [];
    for (let y = 0; y < 8; ++y) {
        for (let x = 0; x < 8; ++x) {
            if (board[x][y] !== E) continue;
            
            for (const dir of dirs) {
                const [dx, dy] = dir;
                if (reversable(board, stone, x, y, dx, dy)) {
                    list.push([[x, y], MIN_SCORE, 0]);
                    break;
                }
            }
        }
    }
    return list;
}

function reversable(board: Board, stone: Stone, x: number, y: number, dx: number, dy: number) {
    const rs = reverse(stone);
    let count = 0;
    let nx = x;
    let ny = y;
    while (true) {
        nx += dx;
        ny += dy;
        if (!contains(nx, ny)) break;
        const s = board[nx][ny];
        if (s === rs) {
            count++;
            continue;
        }
        if (s === stone && count > 0) return true;
        break;
    }
    return false;
}

function countStones(board: Board, stone: Stone) {
    let score = 0;
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            if (board[i][j] === stone) {
                ++score;
            }
        }
    }
    return score;
}

function countTurns(board: Board) {
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

function evalScore(board: Board, stone: Stone) {
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

function cloneBoard(board: Board) {
    const cloneBoard: Board = new Array(8);
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

function reverse(stone: Stone): Stone {
    return (stone * -1) as Stone;
}

function putStone(board: Board, stone: Stone, x: number, y: number) {
    if (board[x][y] !== E) return 0;

    let diff = 0;
    for (const dir of dirs) {
        const [dx, dy] = dir;
        let count = 0;
        let nx = x;
        let ny = y;
        while (true) {
            nx += dx;
            ny += dy;
            if (!contains(nx, ny)) break;
            const s = board[nx][ny];
            if (s === E) break;
            if (s === stone) {
                if (count > 0) {
                    reverseLine(board, s, x, y, dx, dy, count);
                    diff += count;
                }
                break;
            }
            count++;
        }
    }
    if (diff > 0) {
        board[x][y] = stone;
    }
    return diff;
}

function contains(x: number, y: number) {
    return 0 <= x && x < 8 && 0 <= y && y < 8;
}

function reverseLine(board: Board, stone: Stone, x: number, y: number, dx: number, dy: number, count: number) {
    for (let i = 0; i < count; ++i) {
        x += dx, y += dy;
        board[x][y] = stone;
    }
}

function hasCandidates(board: Board, stone: Stone) {
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            if (board[i][j] !== E) continue;
            
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
    const board: Board = new Array(8);
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
    Board, Stone, Candidate,
    newBoard, scanCandidates,
    cloneBoard, reverse, putStone, hasCandidates,
    countStones, countTurns, evalScore
};