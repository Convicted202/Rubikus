import { Vector3, Texture, Material } from 'three';
import { Axis, Face } from '../const/constants';

export const axisFromFace = (face: Face) => {
  if ([Face.F, Face.B].includes(face)) {
    return Axis.Z;
  }
  if ([Face.R, Face.L].includes(face)) {
    return Axis.X;
  }
  if ([Face.U, Face.D].includes(face)) {
    return Axis.Y;
  }
};

export const normalOffsetFromFace = (face: Face) => {
  return [Face.F, Face.R, Face.U].includes(face) ? 1 : -1;
};

export const normalVectorFromFace = (face: Face) => {
  const axis = axisFromFace(face);
  const normal = normalOffsetFromFace(face);

  const x = axis === Axis.X ? normal : 0;
  const y = axis === Axis.Y ? normal : 0;
  const z = axis === Axis.Z ? normal : 0;

  return new Vector3(x, y, z);
};

export const axisToVector = (axis: Axis) => {
  switch (axis) {
    case Axis.X:
      return new Vector3(1, 0, 0);
    case Axis.Y:
      return new Vector3(0, 1, 0);
    case Axis.Z:
      return new Vector3(0, 0, 1);
  }
};

export const getMaxCubeInset = (size: number) => {
  const evenSize = !(size % 2);

  return !evenSize ? (size - 1) / 2 : size / 2;
};

export const intersection = <T>(listA: T[], listB: T[]) => listA.filter((el) => listB.includes(el));

export const difference = <T>(listA: T[], listB: T[]) => listA.filter((el) => !listB.includes(el));

interface IMapContainer {
  map?: Texture | null;
  lightMap?: Texture | null;
  bumpMap?: Texture | null;
  normalMap?: Texture | null;
  specularMap?: Texture | null;
  envMap?: Texture | null;
  alphaMap?: Texture | null;
  aoMap?: Texture | null;
  displacementMap?: Texture | null;
  emissiveMap?: Texture | null;
  gradientMap?: Texture | null;
  metalnessMap?: Texture | null;
  roughnessMap?: Texture | null;
}

export function disposeMaterialMaps<T extends Material & IMapContainer>(material: T) {
  material.map?.dispose();
  material.lightMap?.dispose();
  material.bumpMap?.dispose();
  material.normalMap?.dispose();
  material.specularMap?.dispose();
  material.envMap?.dispose();
  material.alphaMap?.dispose();
  material.aoMap?.dispose();
  material.displacementMap?.dispose();
  material.emissiveMap?.dispose();
  material.gradientMap?.dispose();
  material.metalnessMap?.dispose();
  material.roughnessMap?.dispose();
}
