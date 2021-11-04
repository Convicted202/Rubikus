import { Matrix3 } from 'three';
import { Axis } from '../const/constants';

const cosSin = (deg: number) => {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.trunc(Math.cos(rad));
  const sin = Math.trunc(Math.sin(rad));
  return { cos, sin };
};

const rotateX = (deg: number) => {
  const { cos, sin } = cosSin(deg);

  // prettier-ignore
  return new Matrix3().set(
      1, 0,   0,
      0, cos, -sin,
      0, sin, cos
  )
};

const rotateY = (deg: number) => {
  const { cos, sin } = cosSin(deg);

  // prettier-ignore
  return new Matrix3().set(
    cos,  0, sin,
    0,    1, 0,
    -sin, 0, cos
  )
};

const rotateZ = (deg: number) => {
  const { cos, sin } = cosSin(deg);

  // prettier-ignore
  return new Matrix3().set(
    cos, -sin, 0,
    sin, cos,  0,
    0,   0,    1
  )
};

export { rotateX, rotateY, rotateZ };
export const axisRotation = {
  [Axis.X]: rotateX,
  [Axis.Y]: rotateY,
  [Axis.Z]: rotateZ,
};
