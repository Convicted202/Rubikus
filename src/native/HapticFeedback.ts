import { NativeModules } from 'react-native';

const { HapticFeedback } = NativeModules;

export enum HapticFeedbackType {
  Light = 'impactLight',
  Medium = 'impactMedium',
  Heavy = 'impactHeavy',
  Rigid = 'rigid',
  Soft = 'soft',
}

export const withHaptic = (type: HapticFeedbackType) => (cb: () => any) => {
  HapticFeedback.notify(type);
  cb();
};
