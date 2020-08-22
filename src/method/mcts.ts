import {
    MIN_SCORE, MAX_SCORE,
    Board, Stone, Candidate, 
    scanCandidates,
    cloneBoard, reverse, putStone, hasCandidates, evalScore
} from '../board';

import * as AlphaBeta from './alphabeta';

function evalUcb1(node: GameNode, n: number) {
    const x = node.score;
    const nj = node.n;
    return x / n + Math.sqrt(2 * Math.log2(n) / nj);
}

function playout(board: Board, stone: Stone) {
    let candidates = scanCandidates(board, stone);
    while (candidates.length > 0) {
        const index = Math.floor(candidates.length * Math.random());
        
        const [xy] = candidates[index];
        const [x, y] = xy;

        const diff = putStone(board, stone, x, y);
        if (diff <= 0) throw new Error();

        stone = reverse(stone);
        candidates = scanCandidates(board, stone);
        if (candidates.length > 0) continue;

        stone = reverse(stone);
        candidates = scanCandidates(board, stone);
    }
}

function choice(board: Board, stone: Stone, candidates: Candidate[], i: number) {
    const candidate = candidates[i];
    const [x, y] = candidate[0];

    let nextBoard = cloneBoard(board);
    const diff = putStone(nextBoard, stone, x, y);
    if (diff <= 0) throw new Error();

    playout(nextBoard, stone);
    const score = evalScore(nextBoard, stone);

    candidate[1] += score;
    ++candidate[2];
}

interface GameNode {
    board: Board;
    nodes: GameNode[];
    x: number,
    y: number,
    score: number;
    n: number;
}

function gameNode(board: Board, stone: Stone) {
    const candidates = scanCandidates(board, stone);

    const nodes: GameNode[] = [];
    for (const candidate of candidates) {
        const [x, y] = candidate[0];
        let nextBoard = cloneBoard(board);
        const diff = putStone(nextBoard, stone, x, y);
        if (diff <= 0) throw new Error();

        const playBoard = cloneBoard(nextBoard);
        playout(playBoard, stone);
        const score = evalScore(nextBoard, stone);

        nodes.push({
            board: nextBoard,
            nodes: [],
            x: x,
            y: y,
            score: score,
            n: 1,
        });
    }
    return nodes;
}

function choiceNode(nodes: GameNode[], stone: Stone, n: number) {
    const footprints = [];
    const threshold = 10;
    while (nodes.length > 0) {
        let maxScore = Number.NEGATIVE_INFINITY;
        let index = -1;
        for (let i = 0; i < nodes.length; ++i) {
            const score = evalUcb1(nodes[i], n);
            if (maxScore < score) {
                maxScore = score;
                index = i;
            }
        }
        if (index < 0) throw new Error();
        const node = nodes[index];
        footprints.push(node);

        stone = reverse(stone);

        nodes = node.nodes;
        if (nodes.length == 0 && node.n > threshold) {
            node.nodes = gameNode(node.board, stone);
            nodes = node.nodes;
        }
    }

    const node = footprints[footprints.length - 1];

    const playBoard = cloneBoard(node.board);
    playout(playBoard, stone);
    const score = evalScore(playBoard, stone);
    for (const n of footprints) {
        n.score += score;
        n.n++;
    }
}

function candidateList(board: Board, stone: Stone): Candidate[] {
    const nodes = gameNode(board, stone);

    let n = nodes.length;
    for (let j = 0; j < 10000; ++j) {
        choiceNode(nodes, stone, n);
        ++n;
    }

    const candidates: Candidate[] = [];
    for (const node of nodes) {
        const ucb1 = evalUcb1(node, n);
        candidates.push([[node.x, node.y], ucb1, n]);
    }
    return candidates;
}

export { candidateList };