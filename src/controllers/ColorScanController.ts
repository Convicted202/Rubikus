import { Scene } from 'three';
import { RefObject } from 'react';
import { Rotation } from './RotationController';
import { CubeMoveDescriptor } from './Move';
import { RubiksCube } from '../cube/Cube';
import { Axis, Face } from '../const/constants';
import type { IAnimatableTriggers } from '../types';

const rotationDown = new CubeMoveDescriptor(Axis.X, true, 1);
const rotationRight = new CubeMoveDescriptor(Axis.Y, true, 1);
const twistOnY = new CubeMoveDescriptor(Axis.Y, false, 4);
const twistOnX = new CubeMoveDescriptor(Axis.X, false, 2);

export class ColorAnimation {
  public rotation: Rotation;
  public cube: RubiksCube;
  public assignmentMoves: CubeMoveDescriptor[];

  private refs;
  private index;
  public inProgress: boolean;

  constructor(scene: Scene, cube: RubiksCube, [down, right]: [RefObject<IAnimatableTriggers>, RefObject<IAnimatableTriggers>]) {
    this.index = 0;
    this.inProgress = false;
    this.cube = cube;
    this.rotation = new Rotation(scene, this.cube);
    this.refs = [down, right, right, right, down];
    this.assignmentMoves = [
      rotationDown.clone(),
      rotationRight.clone(),
      rotationRight.clone(),
      rotationRight.clone(),
      rotationDown.clone(),
      twistOnY,
    ];
  }

  // NOTE: Not used anywhere
  createInitialAnimation() {
    this.inProgress = true;

    return this.rotation.animateRotation(twistOnX, 2000, 200, 500).finished.then(() => (this.inProgress = false));
  }

  createAnimation(callback: () => void) {
    const onFinish = () => {
      callback();
      this.inProgress = false;
    };

    if (this.inProgress) return;

    console.log('NOT IN PROGRESS');

    if (this.index < 6) {
      this.inProgress = true;

      const showMsgPromise = this.index < 5 ? this.refs[this.index].current.trigger().finished : Promise.resolve();

      showMsgPromise.then(() =>
        this.rotation.animateRotation(this.assignmentMoves[this.index++], 2000).finished.then(() => {
          this.inProgress = false;

          if (this.index === 6) {
            onFinish();
          }
        }),
      );
    }
  }

  applyColorsToFrontFace(colors: string[]) {
    if (colors) {
      this.cube.setColorsForFace(Face.F, colors);
    }
  }
}
