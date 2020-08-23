/**
 * Monte Carlo tree search (MCTS)
 */
import {
    MIN_SCORE, MAX_SCORE,
    Board, Stone, Candidate, 
    cloneBoard, reverse, putStone, hasCandidates, evalScore
} from '../board';

function candidateList(board: Board, stone: Stone, depth: number): Candidate[] {
    const rs = reverse(stone);
    const list: Candidate[] = [];
    let nextBoard = cloneBoard(board);
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            const diff = putStone(nextBoard, stone, i, j);
            if (diff <= 0) continue;

            if (depth <= 0) {
                list.push([[i, j], MIN_SCORE, 1]);
            } else {
                const [score, n] = minCandidates(nextBoard, stone, depth - 1);
                if (score < MAX_SCORE) {
                    list.push([[i, j], score, n]);
                } else {
                    const [score2, n2] = maxCandidates(nextBoard, stone, depth - 1);
                    if (score2 > MIN_SCORE) {
                        list.push([[i, j], score2, n2]);
                    } else if (!hasCandidates(nextBoard, stone) && !hasCandidates(nextBoard, rs)) {
                        list.push([[i, j], evalScore(nextBoard, stone), 1]);
                    }
                }
            }
            nextBoard = cloneBoard(board);
        }
    }
    return list;
}

function maxCandidates(board: Board, stone: Stone, depth: number) {
    const rs = reverse(stone);
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
                const [score, n] = minCandidates(
                        nextBoard, stone, depth - 1);
                count += n;
                if (score < MAX_SCORE) {
                    maxScore = Math.max(maxScore, score);
                } else {
                    const [score2, n2] = maxCandidates(
                            nextBoard, stone, depth - 1);
                    count += n2;
                    if (score2 > MIN_SCORE) {
                        maxScore = Math.max(maxScore, score2);
                    } else if (!hasCandidates(nextBoard, stone) && !hasCandidates(nextBoard, rs)) {
                        maxScore = Math.max(maxScore, evalScore(nextBoard, stone));
                        ++count;
                    }
                }
            }
            nextBoard = cloneBoard(board);
        }
    }
    return [maxScore, count];
}

function minCandidates(board: Board, stone: Stone, depth: number) {
    const rs = reverse(stone);
    let count = 0;
    let minScore = MAX_SCORE;
    let nextBoard = cloneBoard(board);
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            const diff = putStone(nextBoard, rs, i, j);
            if (diff <= 0) continue;

            if (depth <= 0) {
                ++count;
                const score = evalScore(nextBoard, stone);
                minScore = Math.min(minScore, score);
            } else {
                const [score, n] = maxCandidates(
                        nextBoard, stone, depth - 1);
                count += n;
                if (score > MIN_SCORE) {
                    minScore = Math.min(minScore, score);
                } else {
                    const [score2, n2] = minCandidates(
                            nextBoard, stone, depth - 1);
                    count += n2;
                    if (score2 < MAX_SCORE) {
                        minScore = Math.min(minScore, score2);
                    } else if (!hasCandidates(nextBoard, stone) && !hasCandidates(nextBoard, rs)) {
                        minScore = Math.min(minScore, evalScore(nextBoard, stone));
                        ++count;
                    }
                }
            }
            nextBoard = cloneBoard(board);
        }
    }
    return [minScore, count];
}

export { candidateList };