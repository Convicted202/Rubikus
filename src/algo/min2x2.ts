import { SolutionGenerationError } from '../utils/errors';

const dup = <T>(el: T, count: number) => Array(count).fill(el).join('');

// http://codegolf.stackexchange.com/questions/35002/solve-the-rubiks-pocket-cube
// https://gitlab.control.lth.se/Robertsson/YuMi_rubiks_cube/-/blob/96971f544b871f09a2bd4c18636ac706a53b3062/PythonWorkspace/cube.py
export class BFS2x2Solver {
  // R, U, F permutations
  private permutations = [
    [0, 7, 2, 15, 4, 5, 6, 21, 16, 8, 3, 11, 12, 13, 14, 23, 17, 9, 1, 19, 20, 18, 22, 10],
    [2, 0, 3, 1, 6, 7, 8, 9, 10, 11, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    [0, 1, 13, 5, 4, 20, 14, 6, 2, 9, 10, 11, 12, 21, 15, 7, 3, 17, 18, 19, 16, 8, 22, 23],
  ];

  private applyMove(state: string, move: number) {
    const permutation = this.permutations[move];

    return permutation.map((p) => state[p]).join('');
  }

  private getTerminalStates(incoming: string) {
    const lbdOnly = [incoming[12], incoming[19], incoming[22]];

    // remove up, front, rigth colors
    const scramble = Array.from(incoming)
      .map((x) => (lbdOnly.includes(x) ? x : ' '))
      .join('');
    const goal =
      dup(' ', 4) +
      dup(scramble[12], 2) +
      dup(' ', 4) +
      dup(scramble[19], 2) +
      dup(scramble[12], 2) +
      dup(' ', 4) +
      dup(scramble[19], 2) +
      dup(scramble[22], 4);

    return [scramble, goal];
  }

  private simplifySolution(solution: string): string {
    // get blocks of repetitive moves
    const moves = solution.match(/(..)/g);

    const s = moves.map((move) => {
      return move.trim().replace(/(\d)/, '($1)');
    });

    return s.join(' ');
  }

  private run(incoming: string) {
    const moveNames = ['R', 'U', 'F'];
    const turnNames = [' ', '2', "'"];

    const [scramble, goal] = this.getTerminalStates(incoming);

    let scrambleMap = new Map<string, string>().set(scramble, '');
    let goalMap = new Map<string, string>().set(goal, '');

    let tmp: Map<string, string>;
    let moveString: string;

    let solution = '';
    // go both directions to depth of 6
    for (let _ of Array(6).keys()) {
      tmp = new Map();
      for (let state of scrambleMap.keys()) {
        if (goalMap.has(state)) {
          // solution found
          solution = scrambleMap.get(state) + goalMap.get(state);
          return solution;
        }
        moveString = scrambleMap.get(state);
        // do all 9 moves
        for (let move of Array(3).keys()) {
          for (let turn of Array(3).keys()) {
            state = this.applyMove(state, move);
            tmp.set(state, moveString + moveNames[move] + turnNames[turn]);
          }
          state = this.applyMove(state, move);
        }
      }

      scrambleMap = tmp;
      tmp = new Map();
      for (let state of goalMap.keys()) {
        if (scrambleMap.has(state)) {
          solution = scrambleMap.get(state) + goalMap.get(state);
          return solution;
        }
        moveString = goalMap.get(state);
        // do all 9 moves
        for (let move of Array(3).keys()) {
          for (let turn of Array(3).keys()) {
            state = this.applyMove(state, move);
            tmp.set(state, moveNames[move] + turnNames[2 - turn] + moveString);
          }
          state = this.applyMove(state, move);
        }
      }
      goalMap = tmp;
    }
  }

  solve(incoming: string[]): string {
    if (incoming.length !== 24) {
      throw new SolutionGenerationError('Not enough cubies provided.');
    }

    const scramble = incoming.join('');

    const solution = this.run(scramble);

    if (!solution) return null;

    return this.simplifySolution(solution);
  }
}
