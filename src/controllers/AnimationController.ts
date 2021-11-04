import TWEEN from '@tweenjs/tween.js';
import { EasingFunction } from 'react-native';

const ElasticIn = (a = 1, p = 0.5) => {
  return (t: number) => {
    return t === 0 || t === 1
      ? t
      : -a * Math.pow(2, 10 * (t - 1)) * Math.sin(((t - 1 - (p / (Math.PI * 2)) * Math.asin(1 / a)) * (Math.PI * 2)) / p);
  };
};

const ElasticOut = (a = 1, p = 0.5) => {
  return (t: number) => {
    return 1 - ElasticIn(a, p)(1 - t);
  };
};

interface IAnimateProps {
  target: Record<string, any>;
  to: Record<string, any>;
  duration: number;
  delay?: number;
  autostart?: boolean;
  easing?: EasingFunction;
  yoyo?: boolean;
  onUpdate?: (updated: Record<string, any>, elapsed: number) => any;
  onComplete?: (updated: Record<string, any>) => any;
}

export class AnimationController {
  static get Easing() {
    return {
      ...TWEEN.Easing,
      Elastic: {
        In: ElasticIn,
        Out: ElasticOut,
      },
    };
  }

  static animate({
    autostart = true,
    target,
    to,
    duration,
    delay = 0,
    easing = this.Easing.Linear.None,
    yoyo = false,
    onUpdate,
    onComplete,
  }: IAnimateProps) {
    let resolve: (value: void) => void = null;
    const promise = new Promise((_resolve) => (resolve = _resolve));

    const tween = new TWEEN.Tween(target)
      .to(to, duration ?? 1000)
      .easing(easing)
      .delay(delay)
      .yoyo(yoyo)
      .repeat(yoyo ? Infinity : 0)
      .onUpdate((obj, elapsed) => {
        onUpdate?.(obj, elapsed);
      })
      .onComplete((obj) => {
        onComplete?.(obj);
        tween?.stop();
        resolve();
      }) as any;

    if (autostart) {
      tween.start();
    }

    tween.finished = promise;

    return tween;
  }

  static removeAll() {
    return TWEEN.removeAll();
  }

  static updateAll() {
    return TWEEN.update();
  }
}
