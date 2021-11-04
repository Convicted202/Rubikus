import { Scene } from 'three';
import { Face, Axis, AxisSortByFace, Colors, Settings, exampleLayout, StandardColors } from '../const/constants';
import { Cubelet } from './Cubelet';
import { Facelet } from './Facelet';
import { SolvedStateCubicles } from '../algo/thistlethwaite';
import { axisFromFace, normalOffsetFromFace, normalVectorFromFace, difference, getMaxCubeInset } from '../utils/helpers';
import { ColorResolver } from '../algo/colorResolver';

interface ICubeletPositions {
  position: [number, number, number];
  axisIndex: [number, number, number];
}

export class RubiksCube {
  public cubelets?: Cubelet[] | null;
  public hasVolatileColors = false;
  public size: number;

  constructor(size: number) {
    this.size = size;

    const positions = this.generateCubeletPositions();
    this.cubelets = this.createCubelets(positions);
  }

  get evenlySized() {
    return !(this.size % 2);
  }

  // max offset/inset from the center excluding cubelete in the (0, 0, 0) position
  get maxAxisOffset() {
    return getMaxCubeInset(this.size);
  }

  addToScene(scene: Scene) {
    if (!this.cubelets) {
      throw Error('Cubelets has not initialized');
    }

    this.cubelets.forEach((cubelet) => scene.add(cubelet.sceneElement));
  }

  private generateCubeletPositions(): ICubeletPositions[] {
    return Array.from({ length: this.size }).flatMap((_, x) =>
      Array.from({ length: this.size }).flatMap((_, y) =>
        Array.from({ length: this.size }).map((_, z) => {
          const centerOffset = (this.size - 1) / 2;

          const xOff = x - this.maxAxisOffset;
          const yOff = y - this.maxAxisOffset;
          const zOff = z - this.maxAxisOffset;

          const xIdx = this.evenlySized && xOff >= 0 ? xOff + 1 : xOff;
          const yIdx = this.evenlySized && yOff >= 0 ? yOff + 1 : yOff;
          const zIdx = this.evenlySized && zOff >= 0 ? zOff + 1 : zOff;

          return {
            position: [x - centerOffset, y - centerOffset, z - centerOffset],
            axisIndex: [xIdx, yIdx, zIdx],
          };
        }),
      ),
    );
  }

  private createCubelets(positions: ICubeletPositions[]) {
    const cubeletBoundSize = Settings.CUBIE_WIDTH + Settings.CUBIE_GAP;

    return positions
      .map(({ position: [xOff, yOff, zOff], axisIndex: [xIdx, yIdx, zIdx] }) => {
        // check on invisible inner cubelets
        if (![Math.abs(xIdx), Math.abs(yIdx), Math.abs(zIdx)].includes(this.maxAxisOffset)) {
          return null;
        }

        const [x, y, z] = [xOff * cubeletBoundSize, yOff * cubeletBoundSize, zOff * cubeletBoundSize];

        const cubelet = new Cubelet({ x, y, z }, { xIdx, yIdx, zIdx }, this.maxAxisOffset);

        return cubelet;
      })
      .filter(Boolean) as Cubelet[];
  }

  getCubeletsByAxisSlice(axis: Axis, sliceIndex: number, cubeletsSubSet?: Cubelet[] | null) {
    const cubelets = cubeletsSubSet || this.cubelets || [];

    return cubelets.filter((cubelet) => {
      return cubelet.axisIndex[axis] === sliceIndex;
    });
  }

  getOutermostCubeletsForFace(face: Face) {
    const axis = axisFromFace(face);
    const normalOffset = normalOffsetFromFace(face);

    const outerSliceIndex = normalOffset * this.maxAxisOffset;

    return this.getCubeletsByAxisSlice(axis, outerSliceIndex);
  }

  // faces of length 3 is corner, of length 2 is edge
  getCubeletByCubicleNotation(faces: Face[]) {
    if (faces.length < 2) {
      throw Error('Wrong cubicle notation');
    }

    let cubelets = this.cubelets || [];

    // essentially looping with getOutermostCubeletsForFace functionality
    faces.forEach((face) => {
      const axis = axisFromFace(face);
      const normalOffset = normalOffsetFromFace(face);

      const sliceIndex = normalOffset * this.maxAxisOffset;

      cubelets = this.getCubeletsByAxisSlice(axis, sliceIndex, cubelets).filter(
        (cubelet) => cubelet.facelets.length === faces.length,
      );
    });

    return cubelets[0];
  }

  private getFaceletsForFace(face: Face) {
    const normal = normalVectorFromFace(face);

    return this.getOutermostCubeletsForFace(face)
      .flatMap((cubelet) => cubelet.facelets.filter((cubeletFace) => cubeletFace.normalVector.equals(normal)))
      .sort((a, b) => {
        const { axes, desc } = AxisSortByFace[face];
        const d0 = desc[0] ? -1 : 1;
        const d1 = desc[1] ? -1 : 1;

        return (
          d1 * (a.cubelet.axisIndex[axes[1]] - b.cubelet.axisIndex[axes[1]]) ||
          d0 * (a.cubelet.axisIndex[axes[0]] - b.cubelet.axisIndex[axes[0]])
        );
      });
  }

  getBFS2x2Input() {
    const allColors = this.getDistinctColors();

    const faceOrder = [Face.U, Face.L, Face.F, Face.R, Face.B, Face.D];
    const FULCubelet = this.getCubeletByCubicleNotation([Face.F, Face.U, Face.L]);

    const fColor = FULCubelet.getFaceletOnFace(Face.F).color;
    const uColor = FULCubelet.getFaceletOnFace(Face.U).color;
    const lColor = FULCubelet.getFaceletOnFace(Face.L).color;

    const rMatch = [fColor, uColor];
    const dMatch = [fColor, lColor];

    const rColor = this.cubelets!.map((cubelet) => {
      const colors = cubelet.facelets.map((f) => f.color);
      const diff = difference(colors, rMatch);

      if (diff.length > 1 || diff[0] === lColor) {
        return null;
      }

      return diff[0];
    }).filter(Boolean)[0];

    const dColor = this.cubelets!.map((cubelet) => {
      const colors = cubelet.facelets.map((f) => f.color);
      const diff = difference(colors, dMatch);

      if (diff.length > 1 || diff[0] === uColor) {
        return null;
      }

      return diff[0];
    }).filter(Boolean)[0];

    const bColor = difference(allColors, [fColor, uColor, lColor, rColor, dColor])[0];

    const colorMap = new Map()
      .set(fColor, Face.F)
      .set(uColor, Face.U)
      .set(lColor, Face.L)
      .set(rColor, Face.R)
      .set(dColor, Face.D)
      .set(bColor, Face.B);

    const faceletsMap = faceOrder.reduce<Map<Face, Facelet[]>>((map, face) => {
      const sortedFacelets = this.getFaceletsForFace(face);

      map.set(face, sortedFacelets);

      return map;
    }, new Map<Face, Facelet[]>());

    const getFirstTwo = (arr?: Facelet[]) => arr?.slice(0, 2);
    const getLastTwo = (arr?: Facelet[]) => arr?.slice(2, 4);

    const scramble = [
      faceletsMap.get(Face.U),
      getFirstTwo(faceletsMap.get(Face.L)),
      getFirstTwo(faceletsMap.get(Face.F)),
      getFirstTwo(faceletsMap.get(Face.R)),
      getFirstTwo(faceletsMap.get(Face.B)),
      getLastTwo(faceletsMap.get(Face.L)),
      getLastTwo(faceletsMap.get(Face.F)),
      getLastTwo(faceletsMap.get(Face.R)),
      getLastTwo(faceletsMap.get(Face.B)),
      faceletsMap.get(Face.D),
    ].flatMap((fg) => fg!.map((f) => colorMap.get(f.color)));

    console.log(scramble);

    return scramble;
  }

  getThistlethwaiteInput() {
    const faces = [Face.U, Face.F, Face.R, Face.L, Face.D, Face.B];
    const centralNetIndex = Math.round((this.size * this.size) / 2) - 1;

    const centralColors = faces.reduce<Map<string, Face>>((map, face) => {
      const sortedFacelets = this.getFaceletsForFace(face);
      const color = sortedFacelets[centralNetIndex]?.color;

      map.set(color, face);

      return map;
    }, new Map<string, Face>());

    const scrambledStateCubicles = SolvedStateCubicles.map((cubicle) => {
      const faces = cubicle.split('') as Face[];
      const cubelet = this.getCubeletByCubicleNotation(faces);

      return faces
        .map((face) => {
          const facelet = cubelet.getFaceletOnFace(face);
          return centralColors.get(facelet.color);
        })
        .join('');
    });

    console.log(scrambledStateCubicles);

    return scrambledStateCubicles;
  }

  private getDistinctColors() {
    const allColors = this.cubelets.flatMap((cubelet) => cubelet.facelets.map((facelet) => facelet.color));

    return [...new Set(allColors)];
  }

  setColorsForFace(face: Face, colors: string[]) {
    this.getFaceletsForFace(face).forEach((facelet, index) => facelet.setColor(colors[index]));
  }

  setColorsForFaceInternal(face: Face, colors: string[]) {
    this.getFaceletsForFace(face).forEach((facelet, index) => facelet.setColor(colors[index]));
  }

  setExampleColors() {
    [Face.U, Face.F, Face.R, Face.L, Face.D, Face.B].forEach((f, i) => this.setColorsForFaceInternal(f, exampleLayout[i]));
  }

  resetColors() {
    [Face.U, Face.F, Face.R, Face.L, Face.D, Face.B].forEach((f, i) =>
      this.setColorsForFaceInternal(f, Array(9).fill(Colors.Empty)),
    );
  }

  fixAssignedColors() {
    if (!this.hasVolatileColors) {
      return;
    }

    const facelets = this.cubelets.flatMap((cubelet) => cubelet.facelets.map((facelet) => facelet));
    const faceletColors = facelets.map((f) => f.color);

    console.log('FACELET COLORS, ', faceletColors);

    const colorMap = ColorResolver.mapColorsToStandardSchema(faceletColors);

    facelets.forEach((facelet) => {
      const oldColor = facelet.color;
      const newColor = StandardColors[colorMap[oldColor]];

      facelet.setColor(newColor);
    });

    this.hasVolatileColors = false;
  }

  dispose() {
    if (!this.cubelets) {
      return;
    }

    this.cubelets.forEach((cubelet) => {
      cubelet.sceneElement.parent.remove(cubelet.sceneElement);
      cubelet.dispose();
    });
    this.cubelets = null;
  }
}
