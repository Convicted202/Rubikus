/* global __scanBitmapColors */
import type { Frame } from 'react-native-vision-camera';

declare let _WORKLET: true | undefined;

export interface IScannedColor {
  red: number;
  green: number;
  blue: number;
  alpha: 1;
}

export interface IColorsScanResult {
  colors: IScannedColor[];
}

export function scanBitmapColors(frame: Frame, withArgs: any): IColorsScanResult {
  'worklet';

  if (!_WORKLET) throw new Error('scanBitmapColors must be called from a frame processor!');

  // @ts-expect-error because this function is dynamically injected by VisionCamera
  return __scanBitmapColors(frame, withArgs);
}
