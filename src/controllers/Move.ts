import { Axis, Face } from '../const/constants';
import { axisFromFace, axisToVector, normalOffsetFromFace, getMaxCubeInset } from '../utils/helpers';
import { FaceParsingException } from '../utils/errors';

export interface IMoveDescriptor {
  axis: Axis;
  times: number;
  rotationDeg: number;
  direction: number;
}

export class CubeMoveDescriptor implements IMoveDescriptor {
  public axis: Axis;
  public times: number;

  private inverse: boolean;

  constructor(axis: Axis, inverse: boolean = false, times: number = 1) {
    this.axis = axis;
    this.inverse = inverse;
    this.times = times;
  }

  get direction() {
    return this.inverse ? -1 : 1;
  }

  get rotationDeg() {
    return this.direction * this.times * 90;
  }

  get rotationRad() {
    return (this.direction * (this.times * Math.PI)) / 2;
  }

  get sliceIndex(): number {
    return null;
  }

  clone() {
    return new CubeMoveDescriptor(this.axis, this.inverse, this.times);
  }
}

export class SliceMoveDescriptor implements IMoveDescriptor {
  public axis: Axis;
  public times: number;
  public face: Face;
  public inset: number;

  private inverse: boolean;
  private normal: number;

  constructor(face: Face, inverse: boolean, times: number, inset: number, private maxInset: number) {
    this.axis = axisFromFace(face);
    this.normal = normalOffsetFromFace(face);
    this.inset = inset;
    this.inverse = inverse;
    this.times = times;
    this.face = face;
  }

  get direction() {
    return this.inverse ? -1 : 1;
  }

  get rotationDeg() {
    return this.direction * this.normal * this.times * 90;
  }

  get rotationRad() {
    return (this.direction * this.normal * (this.times * Math.PI)) / 2;
  }

  get axisVector() {
    return axisToVector(this.axis);
  }

  get sliceIndex() {
    return this.normal * this.maxInset - this.inset;
  }

  generateInverse() {
    return new SliceMoveDescriptor(this.face, !this.inverse, this.times, this.inset, this.maxInset);
  }
}

export class SliceMoveParser {
  public moves: SliceMoveDescriptor[];
  public invertMoves: SliceMoveDescriptor[];

  constructor(public movesNotation: string, size = 3) {
    this.movesNotation = movesNotation;
    this.moves = this.parseMovesFromNotation(movesNotation, size);
    this.invertMoves = this.moves.map((m) => m.generateInverse());
  }

  private parseMovesFromNotation(movesNotation: string, size: number) {
    const rotationTimesRegex = /\((\d+)\)/;
    const inverseRegex = /'/;
    const insetNumberRegex = /\d+/;
    const faceRegex = /[a-zA-Z]+/;

    const notationMoves = movesNotation.split(' ').filter((n) => !!n);

    return notationMoves.map((notation) => {
      const inverseTest = inverseRegex.test(notation);
      const timesExec = rotationTimesRegex.exec(notation);
      const insetExec = insetNumberRegex.exec(notation.replace(rotationTimesRegex, ''));
      const faceExec = faceRegex.exec(notation);

      // TODO: this should be inverted in entire app
      const inverse = !inverseTest;
      const times = Number(timesExec?.[1] ?? 1);
      const inset = Number(insetExec ?? 0);
      const face = faceExec?.[0] as Face;

      const maxInset = getMaxCubeInset(size);

      if (!face || !Object.keys(Face).includes(face))
        throw new FaceParsingException('Invalid notation. At least one face was not detected');

      if (inset >= maxInset) {
        throw new FaceParsingException(`Invalid notation. Inset cannot be evaluated for ${notation}`);
      }

      return new SliceMoveDescriptor(face, inverse, times, inset, maxInset);
    });
  }
}
