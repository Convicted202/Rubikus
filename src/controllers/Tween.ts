import TWEEN from '@tweenjs/tween.js';

export const ElasticIn = (a = 1, p = 0.5) => {
  return (t: number) => {
    return t === 0 || t === 1
      ? t
      : -a * Math.pow(2, 10 * (t - 1)) * Math.sin(((t - 1 - (p / (Math.PI * 2)) * Math.asin(1 / a)) * (Math.PI * 2)) / p);
  };
};

export const ElasticOut = (a = 1, p = 0.5) => {
  return (t: number) => {
    return 1 - ElasticIn(a, p)(1 - t);
  };
};

export const TWEENP = ({ autostart = true, target, to, duration, delay, easing, yoyo, onUpdate, onComplete }) => {
  let resolve = null;
  const promise = new Promise((_resolve) => (resolve = _resolve));

  const tween = new TWEEN.Tween(target)
    .to(to, duration ?? 1000)
    .easing(easing ?? TWEEN.Easing.Linear)
    .delay(delay ?? 0)
    .yoyo(yoyo)
    .repeat(yoyo ? Infinity : 0)
    .onUpdate((obj, elapsed) => {
      onUpdate?.(obj, elapsed);
    })
    .onComplete((obj) => {
      onComplete?.(obj);
      resolve?.();
    }) as any;

  if (autostart) {
    tween.start();
  }

  tween.finished = promise;

  return tween;

  //   return new Promise<void>((resolve) => {
  //     const tween = new TWEEN.Tween(target)
  //       .to(to, duration ?? 1000)
  //       .easing(easing ?? TWEEN.Easing.Linear)
  //       .delay(delay ?? 0)
  //       .yoyo(yoyo)
  //       .repeat(yoyo ? Infinity : 0)
  //       .onUpdate((obj, elapsed) => {
  //         onUpdate?.(obj, elapsed);
  //       })
  //       .onComplete((obj) => {
  //         onComplete?.(obj);
  //         resolve?.();
  //       })

  //   });
};

export default TWEEN;
