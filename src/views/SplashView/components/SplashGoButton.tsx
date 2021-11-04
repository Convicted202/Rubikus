import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AnimationController } from '../../../controllers/AnimationController';

export const SplashGoButton = forwardRef((_, passedRef) => {
  const [opacity, setOpacity] = useState<number>(0);

  const timelineForwardRef = useRef<Record<string, any>>();
  const timelineBackwardRef = useRef<Record<string, any>>();

  const createForwardTimeline = () => {
    let target = { opacity: opacity };

    return AnimationController.animate({
      autostart: false,
      target: target,
      to: { opacity: 1 },
      easing: AnimationController.Easing.Quadratic.InOut,
      yoyo: true,
      duration: 800,
      onUpdate: () => setOpacity(target.opacity),
    });
  };

  const createBackwardTimeline = () => {
    let target = { opacity: opacity };

    return AnimationController.animate({
      autostart: false,
      target: target,
      to: { opacity: 0 },
      easing: AnimationController.Easing.Quadratic.Out,
      duration: 1000,
      onUpdate: () => setOpacity(target.opacity),
    });
  };

  useImperativeHandle(passedRef, () => ({
    trigger: () => {
      if (!timelineForwardRef.current) {
        timelineForwardRef.current = createForwardTimeline();
        timelineBackwardRef.current = null;
      }

      timelineForwardRef.current?.start();

      return timelineForwardRef.current;
    },
    triggerOut: () => {
      if (!timelineBackwardRef.current) {
        timelineBackwardRef.current = createBackwardTimeline();
        timelineForwardRef.current = null;
      }

      timelineBackwardRef.current?.start();

      return timelineBackwardRef.current;
    },
  }));

  return (
    <View
      style={[
        styles.overlay,
        {
          opacity,
        },
      ]}
    >
      <Text style={styles.text}>Tap anywhere to proceed</Text>
      <Text style={styles.text}>▶</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    // fontFamily: "'Gemunu Libre', sans-serif",
    paddingLeft: 10,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
