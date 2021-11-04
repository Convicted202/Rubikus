import React from 'react';

export interface IAnimateResult {
  finished?: Promise<void>;
}

export interface IAnimatableTriggers {
  trigger?(): IAnimateResult;
  triggerOut?(): IAnimateResult;
}

export interface ScreenProps {
  showLoadingOnLeave?: boolean;
}

export type ScreenComponent<T = {}> = React.FC<T & ScreenProps>;
