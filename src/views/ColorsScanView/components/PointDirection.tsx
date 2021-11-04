import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AnimationController } from '../../../controllers/AnimationController';

interface IPointDirection {
  direction: 'right' | 'down';
}

export const PointDirection = forwardRef<unknown, IPointDirection>(({ direction }, passedRef) => {
  const overlayRef = useRef<View>();

  const [opacity, setOpacity] = useState<number>(0);

  const timelineRef = useRef<Record<string, any>>();

  const word = direction === 'right' ? 'RIGHT ▷' : direction === 'down' ? 'DOWN ▽' : '';

  const createTimeline = () => {
    let target = { opacity: opacity };

    const fadeOut = AnimationController.animate({
      autostart: false,
      target: target,
      to: { opacity: 0 },
      easing: AnimationController.Easing.Quadratic.In,
      duration: 500,
      delay: 1000,
      onUpdate: () => setOpacity(target.opacity),
      onComplete: () => (timelineRef.current = null),
    });

    const timeline = AnimationController.animate({
      autostart: false,
      target: target,
      to: { opacity: 1 },
      easing: AnimationController.Easing.Quadratic.Out,
      duration: 1500,
      delay: 500,
      onUpdate: () => setOpacity(target.opacity),
    }).chain(fadeOut);

    timeline.finished = fadeOut.finished;

    return timeline;
  };

  useImperativeHandle(passedRef, () => ({
    trigger: () => {
      if (!timelineRef.current) {
        timelineRef.current = createTimeline();
      }

      timelineRef.current?.start();

      return timelineRef.current;
    },
  }));

  return (
    <View
      style={[
        styles.container,
        {
          opacity: opacity,
        },
      ]}
    >
      <View style={styles.notification} ref={(el) => (overlayRef.current = el)}>
        <Text style={styles.ml1}>{word}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  notification: {
    // fontFamily: '"Gemunu Libre", sans-serif',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    color: '#202020',
    margin: 5,
    width: 250,
    height: 250,
    backgroundColor: '#f7f7f7',
    borderRadius: 15,
    // boxShadow: '0px 3px 8px #aaa',
  },
  ml1: {
    fontWeight: '900',
    fontSize: 45,
  },
});
