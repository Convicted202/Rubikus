import { Scene, Object3D, Camera } from 'three';
import { RubiksCube } from '../cube/Cube';
import { AnimationController } from './AnimationController';

const defaultHolderProps = {
  positionY: 5,
  positionX: 0,
  positionZ: 0,
  rotationX: Math.PI,
  rotationY: 0,
};

export class SplashScreen {
  public cube: RubiksCube;
  public scene: Scene;
  public camera: Camera;

  private holder: Object3D;
  private holderProps: Record<string, any>;

  private static _instance: SplashScreen;

  constructor(scene: Scene, camera: Camera, cube: RubiksCube) {
    if (!SplashScreen._instance) {
      this.scene = scene;
      this.camera = camera;
      this.holder = new Object3D();
      this.scene.add(this.holder);

      SplashScreen._instance = this;
    }

    SplashScreen._instance.cube = cube;
    SplashScreen._instance.prepareAnimations();

    return SplashScreen._instance;
  }

  prepareAnimations() {
    this.holder.rotation.set(0, 0, 0);
    this.holder.updateMatrixWorld();

    this.cube.setExampleColors();
    this.cube.cubelets?.forEach((cubelet) => {
      this.holder.attach(cubelet.sceneElement);
    });

    this.holder.position.y = 5;
    this.holder.rotation.x = Math.PI;

    this.holder.updateMatrixWorld();

    this.holderProps = { ...defaultHolderProps };

    this.camera.position.set(2.2, 2.2, 4.1);
  }

  finishAnimations() {
    this.holder.rotation.set(0, 0, 0);
    this.holder.position.set(0, 0, 0);
    this.holder.updateMatrixWorld();

    this.cube.resetColors();

    this.cube.cubelets?.forEach((cubelet) => {
      cubelet.sceneElement.removeFromParent();
    });
  }

  animateZoomOut() {
    return AnimationController.animate({
      target: this.camera.position,
      to: { x: 6.2, y: 3.5, z: 6.1 },
      duration: 1000,
      easing: AnimationController.Easing.Elastic.Out(1, 0.5),
    });
  }

  // animateZoomIn() {
  //   const { x: initX, y: initY, z: initZ } = this.camera.position;

  //   return anime({
  //     targets: this.camera.position,
  //     x: [initX, 6.2],
  //     y: [initY, 3.5],
  //     z: [initZ, 6.1],
  //     duration: 1000,
  //     easing: 'easeOutElastic(1, .5)',
  //   });
  // }

  animateDriveIn() {
    return AnimationController.animate({
      target: this.holderProps,
      to: { rotationX: 0, positionY: 0 },
      delay: 500,
      duration: 2000,
      easing: AnimationController.Easing.Elastic.Out(1, 0.8),
      onUpdate: () => {
        this.holder.rotation.x = this.holderProps.rotationX;
        this.holder.position.y = this.holderProps.positionY;
      },
    });
  }

  animateDriveOut() {
    return AnimationController.animate({
      target: this.holderProps,
      to: { positionX: 10, positionZ: -10 },
      duration: 1000,
      easing: AnimationController.Easing.Elastic.In(1, 0.8),
      onUpdate: () => {
        this.holder.position.x = this.holderProps.positionX;
        this.holder.position.z = this.holderProps.positionZ;
      },
    });
  }

  animateInfiniteYoyo() {
    return AnimationController.animate({
      target: this.holderProps,
      to: { positionY: 0.1 },
      duration: 1000,
      yoyo: true,
      easing: AnimationController.Easing.Quadratic.InOut,
      onUpdate: () => {
        this.holder.position.y = this.holderProps.positionY;
      },
    });
  }
}
