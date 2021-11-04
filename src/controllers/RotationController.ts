import { Object3D, Scene } from 'three';
import { CubeMoveDescriptor, SliceMoveDescriptor, IMoveDescriptor } from './Move';
import { RubiksCube } from '../cube/Cube';
import { Cubelet } from '../cube/Cubelet';
import { AnimationController } from './AnimationController';

export class Rotation {
  private cube: RubiksCube;

  private pivotBox: Object3D;
  private scene: Scene;

  constructor(scene: Scene, cube: RubiksCube) {
    this.pivotBox = new Object3D();
    this.scene = scene;
    this.cube = cube;

    this.resetPivotBox();
    this.scene.add(this.pivotBox);
  }

  private resetPivotBox() {
    this.pivotBox.rotation.set(0, 0, 0);
    this.pivotBox.updateMatrixWorld();
  }

  private select(move?: SliceMoveDescriptor) {
    const selectedGroup = move ? this.cube.getCubeletsByAxisSlice(move.axis, move.sliceIndex) : this.cube.cubelets;

    selectedGroup?.forEach((cubelet) => {
      this.pivotBox.attach(cubelet.sceneElement);
    });

    return selectedGroup;
  }

  private flushToScene(selectedGroup: Cubelet[], move: IMoveDescriptor) {
    this.pivotBox.updateMatrixWorld();

    selectedGroup.forEach((cubelet) => {
      cubelet.moveAxisNormal(move.axis, move.rotationDeg);

      this.scene.attach(cubelet.sceneElement);
    });
  }

  rotateSlice(move: SliceMoveDescriptor) {
    this.resetPivotBox();

    const selectedGroup = this.select(move);

    const prop = move.axis;

    this.pivotBox.rotation[prop] = move.rotationRad;

    this.flushToScene(selectedGroup, move);
  }

  rotate(move: CubeMoveDescriptor) {
    this.resetPivotBox();

    const selectedGroup = this.select();

    const prop = move.axis;

    this.pivotBox.rotation[prop] = move.rotationRad;

    this.flushToScene(selectedGroup, move);
  }

  animateSliceRotation(move: SliceMoveDescriptor, duration: number, postDelay = 0, preDelay = 0) {
    this.resetPivotBox();

    const selectedGroup = this.select(move);

    const onFinish = () => this.flushToScene(selectedGroup, move);

    const prop = move.axis.toLowerCase();

    return AnimationController.animate({
      target: this.pivotBox.rotation,
      to: { [prop]: [move.rotationRad] },
      duration,
      delay: preDelay,
      easing: AnimationController.Easing.Elastic.Out(1, 0.8),
      onComplete: onFinish,
    });
  }

  animateRotation(move: CubeMoveDescriptor, duration: number, postDelay = 0, preDelay = 200) {
    this.resetPivotBox();

    const selectedGroup = this.select();

    const onFinish = () => this.flushToScene(selectedGroup, move);

    const prop = move.axis.toLowerCase();

    return AnimationController.animate({
      target: this.pivotBox.rotation,
      to: { [prop]: [move.rotationRad] },
      duration,
      delay: preDelay,
      easing: AnimationController.Easing.Elastic.Out(1, 0.8),
      onComplete: onFinish,
    });
  }
}
