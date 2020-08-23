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

const npcDark = (board: Board, stone: Stone) => MCTS.candidateList(board, stone, 1000, 2);
const npcLight = (board: Board, stone: Stone) => MCTS.candidateList(board, stone, 1000, 4);

function getNpcAlgorithm(stone: Stone) {
    if (stone === B) {
        return npcDark;
    } else if (stone === W) {
        return npcLight;
    }
    throw new Error();
}

function bestCandidates(board: Board, stone: Stone,
        algorithm: (board: Board, stone: Stone) => Candidate[]) {

    const candidates = algorithm(board, stone);

    let maxScore = MIN_SCORE;
    const list = [];
    for (const candidate of candidates) {
        const [xy, score] = candidate;
        if (maxScore < score) {
            maxScore = score;
            list.length = 0;
            list.push(xy);
        } else if (maxScore === score) {
            list.push(xy);
        }
    }
    return list;
}

function match() {
    const board = newBoard();
    let stone: Stone = B;
    while (hasCandidates(board, stone)) {
        let npc = getNpcAlgorithm(stone);

        const candidates = bestCandidates(board, stone, npc);

        const index = Math.floor(Math.random() * candidates.length);
        const xy = candidates[index];

        const [x, y] = xy;
        const diff = putStone(board, stone, x, y);
        if (diff <= 0) throw new Error("illegal state 2");

        stone = reverse(stone);
        if (!hasCandidates(board, stone)) {
            stone = reverse(stone);
            if (!hasCandidates(board, stone)) {
                break;
            }
        }
    }
    return evalScore(board, stone);
}

function main() {
    const score = match();
    console.log(score);
}

main();