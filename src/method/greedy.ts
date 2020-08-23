/**
 * Greedy
 */
import {
    Board, Stone, Candidate, 
    cloneBoard, reverse, putStone
} from '../board';

function candidateList(board: Board, stone: Stone): Candidate[] {
    const rs = reverse(stone);

    let nextBoard = cloneBoard(board);

    let maxDiff = 0;
    let list: Candidate[] = [];
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            const diff = putStone(nextBoard, stone, i, j);
            if (diff <= 0) continue;

            list.push([[i, j], diff, 1]);
            nextBoard = cloneBoard(board);
        }
    }
    return list;
}

export { candidateList };