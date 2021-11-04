import { ExtrudeGeometry, MeshLambertMaterial, Mesh, Vector3, DoubleSide, Color } from 'three';
import { Face, Settings, Colors } from '../const/constants';
import { Cubelet } from './Cubelet';
import { RoundedCurvesShape } from '../three/Geometry';
import { normalOffsetFromFace, normalVectorFromFace, disposeMaterialMaps } from '../utils/helpers';

export class Facelet {
  public normalVector: Vector3;
  public color: string;
  public sceneElement: Mesh<ExtrudeGeometry, MeshLambertMaterial>;

  public cubelet: Cubelet;

  constructor(face: Face, cubelet: Cubelet) {
    this.cubelet = cubelet;
    this.normalVector = normalVectorFromFace(face);
    this.createCubieFace(face);
  }

  private createCubieFace(face: Face) {
    const stickerGeometry = RoundedCurvesShape(
      Settings.STICKER_WIDTH,
      Settings.STICKER_WIDTH,
      Settings.STICKER_RADIUS,
      Settings.STICKET_DEPTH,
    );

    this.color = Colors.Empty;

    const material = new MeshLambertMaterial({
      color: new Color(this.color),
      side: DoubleSide,
      // polygonOffset: true,
      // polygonOffsetFactor: -1,
      // polygonOffsetUnits: -4,
    });

    const sticker = new Mesh(stickerGeometry, material);

    this.cubelet.sceneElement.attach(sticker);

    const offset = (normalOffsetFromFace(face) * Settings.CUBIE_WIDTH) / 2;

    if (face === Face.U || face === Face.D) {
      const sign = face === Face.U ? -1 : 1;
      sticker.rotateX((sign * Math.PI) / 2);
      sticker.position.set(0, offset, 0);
    }
    if (face === Face.L || face === Face.R) {
      const sign = face === Face.R ? -1 : 1;
      sticker.rotateY((-sign * Math.PI) / 2);
      sticker.position.set(offset, 0, 0);
    }
    if (face === Face.F || face === Face.B) {
      const sign = face === Face.F ? 0 : 1;
      sticker.rotateY(sign * Math.PI);
      sticker.position.set(0, 0, offset);
    }

    this.sceneElement = sticker;
  }

  setColor(color: string) {
    this.color = color;
    this.sceneElement.material.color.set(new Color(color));
    // this.sceneElement.geometry.colorsNeedUpdate = true;
    // this.sceneElement.geometry.elementsNeedUpdate = true;
  }

  dispose() {
    disposeMaterialMaps(this.sceneElement.material);
    this.sceneElement.material.dispose();
    this.sceneElement.geometry.dispose();
  }
}
