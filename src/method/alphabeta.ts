import {
    MIN_SCORE, MAX_SCORE,
    Stone, Candidate, 
    cloneBoard, nextStone, putStone, hasCandidates, evalScore
} from '../board';

function candidateList(board: Board, stone: Stone, depth: number): Candidate[] {
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
                const [score, n] = minCandidates(nextBoard, stone, depth - 1, MIN_SCORE);
                if (score < MAX_SCORE) {
                    list.push([[i, j], score, n]);
                } else {
                    const [score2, n2] = maxCandidates(nextBoard, stone, depth - 1, MIN_SCORE);
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

function maxCandidates(board: Board, stone: Stone, depth: number, upper: number): [number, number] {
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
                const [score, n] = minCandidates(
                        nextBoard, stone, depth - 1, maxScore);
                count += n;
                if (score < MAX_SCORE) {
                    if (score > upper)
                        return [score, count];
                    maxScore = Math.max(maxScore, score);
                } else {
                    const [score2, n2] = maxCandidates(
                            nextBoard, stone, depth - 1, upper);
                    count += n2;
                    if (score2 > upper)
                        return [score2, count];
                    if (score2 > MIN_SCORE) {
                        maxScore = Math.max(maxScore, score2);
                    } else if (!hasCandidates(nextBoard, stone) && !hasCandidates(nextBoard, ns)) {
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

function minCandidates(board: Board, stone: Stone, depth: number, lower: number): [number, number] {
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
                const [score, n] = maxCandidates(
                        nextBoard, stone, depth - 1, minScore);
                count += n;
                if (score > MIN_SCORE) {
                    if (score < lower)
                        return [score, count];
                    minScore = Math.min(minScore, score);
                } else {
                    const [score2, n2] = minCandidates(
                            nextBoard, stone, depth - 1, lower);
                    count += n2;
                    if (score2 < MAX_SCORE) {
                        minScore = Math.min(minScore, score2);
                    } else if (!hasCandidates(nextBoard, stone) && !hasCandidates(nextBoard, ns)) {
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