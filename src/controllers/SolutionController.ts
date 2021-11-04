import { Scene } from 'three';
import { Rotation } from './RotationController';
import { SliceMoveParser } from './Move';
import { RubiksCube } from '../cube/Cube';

export class SolutionAnimation {
  public rotation: Rotation;
  public cube: RubiksCube;

  private moveParser: SliceMoveParser;

  private state: string;
  private index: number;
  private inProgress: boolean;

  constructor(scene: Scene, cube: RubiksCube, movesNotation: string) {
    this.index = 0;
    this.state = 'idle';
    this.inProgress = false;
    this.cube = cube;
    this.rotation = new Rotation(scene, this.cube);

    this.moveParser = new SliceMoveParser(movesNotation, this.cube.size);
  }

  doTimeline(rotation: Rotation, callback = (_: number) => {}) {
    if (this.state === 'stopped') {
      return;
    }

    if (this.index >= this.movesLength) {
      return;
    }

    if (this.inProgress) {
      return;
    }

    this.inProgress = true;

    return rotation.animateSliceRotation(this.moveParser.moves[this.index++], 1500, 0).finished.then(() => {
      this.inProgress = false;
      callback(this.index);
      this.doTimeline(rotation, callback);
    });
  }

  doForwardMove(rotation: Rotation) {
    if (this.state === 'processing') {
      this.stop();
    }

    if (this.index >= this.movesLength) {
      return;
    }

    if (this.inProgress) {
      return;
    }

    this.inProgress = true;

    return rotation
      .animateSliceRotation(this.moveParser.moves[this.index++], 1000, 0)
      .finished.then(() => (this.inProgress = false));
  }

  doBackwardMove(rotation: Rotation) {
    if (this.state === 'processing') {
      this.stop();
    }

    if (this.index === 0) {
      return;
    }

    if (this.inProgress) {
      return;
    }

    this.inProgress = true;

    return rotation
      .animateSliceRotation(this.moveParser.invertMoves[--this.index], 1000, 0)
      .finished.then(() => (this.inProgress = false));
  }

  start(moveCallback: (_: number) => void) {
    this.state = 'processing';

    this.doTimeline(this.rotation, moveCallback);
  }

  stop() {
    this.state = 'stopped';
  }

  next() {
    this.doForwardMove(this.rotation);
  }

  back() {
    this.doBackwardMove(this.rotation);
  }

  get movesLength() {
    return this.moveParser.moves.length;
  }

  get isTimelineRunning() {
    return this.state === 'processing';
  }

  get isTimelineStopped() {
    return this.state === 'stopped';
  }
}
