import { MeshLambertMaterial, ExtrudeBufferGeometry, Mesh, Vector3 } from 'three';
import { Axis, Face, Settings } from '../const/constants';
import { RoundedBox } from '../three/Geometry';
import { normalVectorFromFace, disposeMaterialMaps } from '../utils/helpers';
import { Facelet } from './Facelet';
import { axisRotation } from '../utils/rotations';

export class Cubelet {
  public facelets: Facelet[];
  public sceneElement: Mesh<ExtrudeBufferGeometry, MeshLambertMaterial>;
  public position: Vector3;
  public axisIndex: Vector3;

  constructor(
    position: Record<'x' | 'y' | 'z', number>,
    axisIndex: Record<'xIdx' | 'yIdx' | 'zIdx', number>,
    maxAxisOffset: number,
  ) {
    this.facelets = [];
    this.position = new Vector3(position.x, position.y, position.z);
    this.axisIndex = new Vector3(axisIndex.xIdx, axisIndex.yIdx, axisIndex.zIdx);
    this.createCubelet(maxAxisOffset);
  }

  private createCubelet(maxAxisOffset: number) {
    const cubieGeometry = RoundedBox(
      Settings.CUBIE_WIDTH,
      Settings.CUBIE_WIDTH,
      Settings.CUBIE_WIDTH,
      Settings.CUBIE_RADIUS,
      Settings.RADIUS_SMOOTHNESS,
    );

    const material = new MeshLambertMaterial({
      color: 0x0a0a0a, //new Color('0xbdbdbd'),
    });
    const cubie = new Mesh(cubieGeometry, material);
    cubie.castShadow = true;
    cubie.position.set(this.position.x, this.position.y, this.position.z);

    this.sceneElement = cubie;

    if (this.axisIndex.x === maxAxisOffset) {
      this.facelets.push(new Facelet(Face.R, this));
    }
    if (this.axisIndex.x === -maxAxisOffset) {
      this.facelets.push(new Facelet(Face.L, this));
    }

    if (this.axisIndex.y === maxAxisOffset) {
      this.facelets.push(new Facelet(Face.U, this));
    }
    if (this.axisIndex.y === -maxAxisOffset) {
      this.facelets.push(new Facelet(Face.D, this));
    }

    if (this.axisIndex.z === maxAxisOffset) {
      this.facelets.push(new Facelet(Face.F, this));
    }
    if (this.axisIndex.z === -maxAxisOffset) {
      this.facelets.push(new Facelet(Face.B, this));
    }
  }

  moveAxisNormal(axis: Axis, degrees: number) {
    const axisVector = this.axisIndex;

    const rotation = axisRotation[axis](degrees);

    this.axisIndex = axisVector.applyMatrix3(rotation);

    this.facelets.forEach((facelet) => {
      facelet.normalVector = facelet.normalVector.applyMatrix3(rotation);
    });
  }

  getFaceletOnFace(face: Face) {
    const normal = normalVectorFromFace(face);

    return this.facelets.filter((facelet) => facelet.normalVector.equals(normal))[0];
  }

  dispose() {
    return this.sceneElement.traverse((node) => {
      if (node instanceof Mesh) {
        if (node.geometry) {
          node.geometry.dispose();
        }

        if (node.material) {
          disposeMaterialMaps(node.material);
          node.material.dispose();
        }
      }
    });
  }
}
