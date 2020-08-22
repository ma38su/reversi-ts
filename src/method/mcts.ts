import {
    MIN_SCORE, MAX_SCORE,
    Stone, Candidate, 
    cloneBoard, nextStone, putStone, hasCandidates, evalScore
} from '../board';

interface UCB1 {
    x: number; // average rewards
    n: number; // trials
}

function evalUcb1(val: UCB1, nj: number) {
    const n = val.n;
    const x = val.x / n;
    return x + Math.sqrt(2 * Math.log(n) / nj);
}

function ucb1(board: Stone[][], stone: Stone) {
    const candidates: [[number, number], UCB1][] = [];
    let nextBoard = cloneBoard(board);
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            const diff = putStone(nextBoard, stone, i, j);
            if (diff <= 0) continue;
            const ucb: UCB1 = {x: 0, n: 0};
            candidates.push([[i, j], ucb]);
            nextBoard = cloneBoard(board);
        }
    }

    choice(board, stone, candidates, 0);

    let nj = 1;
    let choiceIndex = -1;
    let maxScore = -Number.MAX_SAFE_INTEGER;

    while (nj < 100) {
        for (let i = 0; i < candidates.length; ++i) {
            const [ij, ucb] = candidates[i];
            const score = evalUcb1(ucb, nj);
            if (maxScore < score) {
                maxScore = score;
                choiceIndex = i;
            }
        }
        ++nj;
        choice(board, stone, candidates, choiceIndex);
    }
    const list: Candidate[] = [];
    return list;
}

function choice(board: Stone[][], stone: Stone, candidates: [[number, number], UCB1][], i: number) {
    const [ij, ucb] = candidates[i];

    const score = playout(board, stone);
    ++ucb.n;
    ucb.x += score;
}

function playout(board: Stone[][], stone: Stone) {
    return evalScore(board, stone);
}
