/**
 * Monte Carlo tree search (MCTS)
 */
import {
    Board, Stone, Candidate, 
    scanCandidates,
    cloneBoard, reverse, putStone, evalScore, countTurns
} from '../board';

import * as AlphaBeta from './alphabeta';

interface GameNode {
    board: Board;
    nodes: GameNode[];
    stone: Stone,
    x: number,
    y: number,
    score: number;
    n: number;
}

function evalUcb1(node: GameNode, n: number) {
    const x = node.score;
    const nj = node.n;
    return x / n + Math.sqrt(2 * Math.log2(n) / nj);
}

function playout(board: Board, stone: Stone) {
    let candidates = scanCandidates(board, stone);
    if (candidates.length == 0) {
        stone = reverse(stone);
        candidates = scanCandidates(board, stone);
    }
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

function gameNode(board: Board, stone: Stone) {
    const candidates = scanCandidates(board, stone);
    const rs = reverse(stone);
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
            stone: rs,
            nodes: [],
            x: x,
            y: y,
            score: score,
            n: 1,
        });
    }
    return nodes;
}

function choiceNode(nodes: GameNode[], stone: Stone) {
    if (nodes.length == 0) throw new Error();
 
    const stone0 = stone;

    const footprints = [];
    const threshold = 4;
    while (nodes.length > 0) {

        let index = -1;

        let n = 0;
        for (let i = 0; i < nodes.length; ++i) {
            n += nodes[i].n;
        }
        if (stone === stone0) {
            let maxScore = Number.NEGATIVE_INFINITY;
            for (let i = 0; i < nodes.length; ++i) {
                const score = evalUcb1(nodes[i], n);
                if (maxScore < score) {
                    maxScore = score;
                    index = i;
                }
            }
        } else {
            let minScore = Number.POSITIVE_INFINITY;
            for (let i = 0; i < nodes.length; ++i) {
                const score = evalUcb1(nodes[i], n);
                if (minScore > score) {
                    minScore = score;
                    index = i;
                }
            }
        }
        if (index < 0) throw new Error();
        const node = nodes[index];
        footprints.push(node);

        stone = node.stone;
        nodes = node.nodes;
        if (nodes.length == 0 && node.n > threshold) {
            node.nodes = gameNode(node.board, stone);
            if (node.nodes.length == 0) {
                stone = reverse(stone);
                node.nodes = gameNode(node.board, reverse(stone));
                stone = reverse(stone);
                node.stone = stone;
            }
            nodes = node.nodes;
        }
    }

    const node = footprints[footprints.length - 1];
    const playBoard = cloneBoard(node.board);
    playout(playBoard, stone);
    const score = evalScore(playBoard, stone0);
    for (const n of footprints) {
        n.score += score;
        ++n.n;
    }
}

const loops = 20000;

function candidateList(board: Board, stone: Stone): Candidate[] {
    const nodes = gameNode(board, stone);
    if (nodes.length == 0) {
        return [];        
    }

    const turns = countTurns(board);
    if (turns == 1) {
        return AlphaBeta.candidateList(board, stone, 0);
    }
    if (64 - turns <= 5) {
        console.log('algorithm -> alpha-beta');
        return AlphaBeta.candidateList(board, stone, 5);
    }

    nodes.sort((a, b) => {
        const dx = a.x - b.x;
        if (dx !== 0) return dx;
        return a.y - b.y;
    });

    for (let j = 0; j < loops; ++j) {
        choiceNode(nodes, stone);
    }

    let s = 0;
    const candidates: Candidate[] = [];
    for (const node of nodes) {
        candidates.push([[node.x, node.y], node.score / node.n, node.n]);
        s += node.n;
        //console.log('n1', node.x, node.y, node.n, node.score / node.n);
    }
    return candidates;
}

export { candidateList };