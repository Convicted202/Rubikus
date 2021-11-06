import { SolutionGenerationError } from '../utils/errors';

type vi = Array<number>;

const toId = (v: vi) => v.toString();

export const SolvedStateCubicles = [
  'UF',
  'UR',
  'UB',
  'UL',
  'DF',
  'DR',
  'DB',
  'DL',
  'FR',
  'FL',
  'BR',
  'BL',
  'UFR',
  'URB',
  'UBL',
  'ULF',
  'DRF',
  'DFL',
  'DLB',
  'DBR',
];

/**
 * Pochman's version of Thistlethwaite's Rubik's Cube solver algorithm
 *
 * Completely taken and rewritten from C++ to TS
 *
 * Original source: https://www.stefan-pochmann.info/spocc/other_stuff/tools/solver_thistlethwaite/solver_thistlethwaite_cpp.txt
 * Context: https://www.stefan-pochmann.info/spocc/other_stuff/tools/solver_thistlethwaite/solver_thistlethwaite.txt
 *
 * /**********************************************************************
 *
 * A cube 'state' is a vector<int> with 40 entries, the first 20
 * are a permutation of {0,...,19} and describe which cubie is at
 * a certain position (regarding the input ordering). The first
 * twelve are for edges, the last eight for corners.
 *
 * The last 20 entries are for the orientations, each describing
 * how often the cubie at a certain position has been turned
 * counterclockwise away from the correct orientation. Again the
 * first twelve are edges, the last eight are corners. The values
 * are 0 or 1 for edges and 0, 1 or 2 for corners.
 *
 ***********************************************************************/

export class ThistlethwaiteSolver {
  private applicableMoves = [0, 262143, 259263, 74943, 74898];
  private affectedCubies = [
    [0, 1, 2, 3, 0, 1, 2, 3], // U
    [4, 7, 6, 5, 4, 5, 6, 7], // D
    [0, 9, 4, 8, 0, 3, 5, 4], // F
    [2, 10, 6, 11, 2, 1, 7, 6], // B
    [3, 11, 7, 9, 3, 2, 6, 5], // L
    [1, 8, 5, 10, 1, 0, 4, 7], // R
  ];
  private phase: number;
  private currentState: number[];
  private goalState: number[];

  constructor() {
    this.reset();
  }

  reset() {
    this.phase = 0;
  }

  applyMove(move: number, _state: vi): vi {
    let turns = (move % 3) + 1;
    const face = Math.floor(move / 3);
    const state = Array.from(_state);

    while (turns--) {
      const oldState = Array.from(state);

      for (let i = 0; i < 8; i++) {
        const isCorner = i > 3 ? 1 : 0;
        const target = this.affectedCubies[face][i] + isCorner * 12;
        const killer = this.affectedCubies[face][(i & 3) === 3 ? i - 3 : i + 1] + isCorner * 12;
        const orientationDelta = i < 4 ? +(face > 1 && face < 4) : face < 2 ? 0 : 2 - (i & 1);
        state[target] = oldState[killer];
        state[target + 20] = oldState[killer + 20] + orientationDelta;
        if (!turns) {
          state[target + 20] %= 2 + isCorner;
        }
      }
    }
    return state;
  }

  inverse(move: number): number {
    return move + 2 - 2 * (move % 3);
  }

  getId(state: vi): string {
    //--- Phase 1: Edge orientations.
    if (this.phase < 2) {
      return toId(state.slice(20, 32));
    }

    //-- Phase 2: Corner orientations, E slice edges.
    if (this.phase < 3) {
      const result = state.slice(31, 40);
      for (let e = 0; e < 12; e++) {
        result[0] |= Math.floor(state[e] / 8) << e;
      }
      return toId(result);
    }

    //--- Phase 3: Edge slices M and S, corner tetrads, overall parity.
    if (this.phase < 4) {
      const result = [0, 0, 0];
      for (let e = 0; e < 12; e++) {
        result[0] |= (state[e] > 7 ? 2 : state[e] & 1) << (2 * e);
      }
      for (let c = 0; c < 8; c++) {
        result[1] |= ((state[c + 12] - 12) & 5) << (3 * c);
      }
      for (let i = 12; i < 20; i++) {
        for (let j = i + 1; j < 20; j++) {
          result[2] ^= +(state[i] > state[j]);
        }
      }
      return toId(result);
    }

    //--- Phase 4: The rest.
    return toId(state);
  }

  private verifyCorrectness(): boolean {
    if (!Array.isArray(this.currentState)) return false;
    //orientation of edges
    var sum = 0;
    this.currentState.slice(20, 32).forEach(function (edge) {
      sum += edge;
    });
    if (sum % 2 !== 0) {
      throw new SolutionGenerationError('Cannot solve: Edges not oriented correctly.');
    }
    sum = 0;
    //orientation of corners
    this.currentState.slice(32, 40).forEach(function (edge) {
      sum += edge;
    });
    if (sum % 3 !== 0) {
      //corner orientation
      throw new SolutionGenerationError('Cannot solve: Corners not oriented correctly.');
    }

    var getParity = function (a: number[]) {
      var count = 0;
      for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < i; j++) {
          if (a[j] > a[i]) {
            count++;
            var temp = a[i];
            a[i] = a[j];
            a[j] = temp;
          }
        }
      }
      return count;
    };
    //check for parity
    sum = 0;
    //edge parity
    sum += getParity(this.currentState.slice(0, 12));
    //corner parity
    sum += getParity(this.currentState.slice(12, 20));
    if (sum % 2 !== 0) {
      throw new SolutionGenerationError('Cannot solve: Parity error only one set of corners or edges swapped.');
    }

    return true;
  }

  prepare(cubicles: string[]) {
    if (cubicles.length !== 20) {
      throw new SolutionGenerationError('Not enough cubies provided.');
    }

    //--- Define the goal.
    const goal = Array.from(SolvedStateCubicles);

    //--- Prepare current (start) and goal state.
    this.currentState = new Array(40).fill(0);
    this.goalState = new Array(40).fill(0);

    for (var i = 0; i < 20; i++) {
      //--- Goal state.
      this.goalState[i] = i;

      //--- Current (start) state.
      let cubie: string = cubicles[i];
      while ((this.currentState[i] = goal.indexOf(cubie)) === -1) {
        cubie = cubie.substr(1) + cubie[0];
        this.currentState[i + 20]++;

        // orientation can only be 0 | 1 for edges and 0 | 1 | 2 for corners
        if (this.currentState[i + 20] > 2) {
          throw new SolutionGenerationError('Cannot solve: Invalid painting of cube.');
        }
      }
      goal[goal.indexOf(cubie)] = '';
    }

    // return this.verifyCorrectness();
  }

  runPhase(solution: string) {
    //--- Compute ids for current and goal state, skip phase if equal.
    const currentId = this.getId(this.currentState);
    const goalId = this.getId(this.goalState);
    if (currentId === goalId) {
      return;
    }
    //--- Initialize the BFS queue.
    const q = [];
    q.push(this.currentState);
    q.push(this.goalState);

    //--- Initialize the BFS tables.
    const predecessor: Record<string, string> = {};
    const direction: Record<string, number> = {};
    const lastMove: Record<string, number> = {};
    direction[currentId] = 1;
    direction[goalId] = 2;

    //--- Dance the funky bidirectional BFS...
    while (1) {
      //--- Get state from queue, compute its ID and get its direction.
      let oldState = q.shift();
      let oldId = this.getId(oldState);
      let oldDir = direction[oldId];

      //--- Apply all applicable moves to it and handle the new state.
      for (let move = 0; move < 18; move++) {
        if (this.applicableMoves[this.phase] & (1 << move)) {
          //--- Apply the move.
          let newState = this.applyMove(move, oldState);
          let newId = this.getId(newState);
          let newDir = direction[newId];

          //--- Have we seen this state (id) from the other direction already?
          //--- I.e. have we found a connection?
          if (newDir && newDir !== oldDir) {
            //--- Make oldId represent the forwards and newId the backwards search state.
            if (oldDir > 1) {
              const temp = newId;
              newId = oldId;
              oldId = temp;
              move = this.inverse(move);
            }

            //--- Reconstruct the connecting algorithm.
            const algorithm = [move];
            while (oldId !== currentId) {
              algorithm.unshift(lastMove[oldId]);
              oldId = predecessor[oldId];
            }
            while (newId !== goalId) {
              algorithm.push(this.inverse(lastMove[newId]));
              newId = predecessor[newId];
            }

            //--- append to the solution and apply the algorithm.
            for (let i = 0; i < algorithm.length; i++) {
              for (let j = 0; j < (algorithm[i] % 3) + 1; j++) {
                solution += 'UDFBLR'[Math.floor(algorithm[i] / 3)];
              }
              this.currentState = this.applyMove(algorithm[i], this.currentState);
            }

            //--- Jump to the next phase.
            return solution;
          }

          //--- If we've never seen this state (id) before, visit it.
          if (!newDir) {
            q.push(newState);
            direction[newId] = direction[oldId];
            lastMove[newId] = move;
            predecessor[newId] = oldId;
          }
        }
      }
    }
  }

  simplifySolution(solution: string): string {
    // get blocks of repetitive moves
    const moves = solution.match(/(F|R|U|L|B|D)\1*/g);

    console.log(solution, moves);

    const s = moves
      .map((move) => {
        const face = move[0];

        // group in quarter turns
        const rCount = move.length % 4;

        if (!rCount) {
          return null;
        }

        const modifier = rCount === 2 ? '(2)' : rCount === 3 ? "'" : '';

        return face + modifier;
      })
      .filter(Boolean);

    console.log(s);

    return s.join(' ');
  }

  /**
   * Expects 20 strings in following format
   * UF UR UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB DBR
   * where 2-char string represents edge, 3-char string represents corner
   * @param cubicles Cubicles of scrambled cube
   * @returns Joined moves to unscramble the cube
   */
  solve(cubicles: string[]): string {
    let solution = '';
    this.phase = 0;

    this.prepare(cubicles);

    while (++this.phase < 5) {
      solution = this.runPhase(solution);
    }

    return this.simplifySolution(solution);
  }
}
