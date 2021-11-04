// import { Color as ThreeColor } from 'three';

export enum Axis {
  X = 'x',
  Y = 'y',
  Z = 'z',
}

export enum Face {
  F = 'F',
  R = 'R',
  B = 'B',
  L = 'L',
  U = 'U',
  D = 'D',
}

export const AxisSortByFace = {
  [Face.F]: {
    axes: [Axis.X, Axis.Y],
    desc: [false, true],
  },
  [Face.R]: {
    axes: [Axis.Z, Axis.Y],
    desc: [true, true],
  },
  [Face.U]: {
    axes: [Axis.X, Axis.Z],
    desc: [false, false],
  },
  [Face.B]: {
    axes: [Axis.X, Axis.Y],
    desc: [true, true],
  },
  [Face.L]: {
    axes: [Axis.Z, Axis.Y],
    desc: [false, true],
  },
  [Face.D]: {
    axes: [Axis.X, Axis.Z],
    desc: [false, true],
  },
};

export enum CubicleType {
  Edge = 'Edge',
  Corner = 'Corner',
}

export enum Colors {
  White = '#eae2b7',
  Blue = '#023047',
  Red = '#d62828',
  Green = '#275d3b',
  Orange = '#d35400',
  Yellow = '#fcbf49',
  Empty = '#eaeaea',
}

export const StandardColors = {
  white: Colors.White,
  blue: Colors.Blue,
  red: Colors.Red,
  green: Colors.Green,
  orange: Colors.Orange,
  yellow: Colors.Yellow,
};

export const exampleLayout = [
  [Colors.Red, Colors.Blue, Colors.Green, Colors.Orange, Colors.White, Colors.Red, Colors.Blue, Colors.Green, Colors.Orange],
  [Colors.Red, Colors.White, Colors.White, Colors.Orange, Colors.Green, Colors.Red, Colors.Red, Colors.Yellow, Colors.Yellow],
  [Colors.Blue, Colors.White, Colors.White, Colors.Blue, Colors.Red, Colors.Green, Colors.Blue, Colors.Yellow, Colors.Yellow],
  [
    Colors.Orange,
    Colors.White,
    Colors.White,
    Colors.Red,
    Colors.Blue,
    Colors.Orange,
    Colors.Orange,
    Colors.Yellow,
    Colors.Yellow,
  ],
  [
    Colors.Green,
    Colors.White,
    Colors.White,
    Colors.Green,
    Colors.Orange,
    Colors.Blue,
    Colors.Green,
    Colors.Yellow,
    Colors.Yellow,
  ],
  [Colors.Red, Colors.Orange, Colors.Blue, Colors.Blue, Colors.Yellow, Colors.Green, Colors.Green, Colors.Red, Colors.Orange],
];

export const Settings = {
  CUBIE_GAP: 0.01,
  CUBIE_WIDTH: 0.5,
  CUBIE_RADIUS: 0.05,
  STICKER_WIDTH: 0.4,
  STICKER_RADIUS: 0.05,
  STICKET_DEPTH: 0.01,
  RADIUS_SMOOTHNESS: 10,
};
