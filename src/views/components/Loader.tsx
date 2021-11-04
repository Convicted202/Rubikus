import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0077b6',
  },
  square: {
    width: 30,
    height: 30,
    marginHorizontal: 5,
    marginVertical: 5,
    backgroundColor: '#fdfdfd',
  },
  groupRow: {
    flexDirection: 'row',
  },
});

interface IAnimatedPiece {
  value: Animated.Value;
  opacity: number[];
}

const AnimatedPiece: React.FC<IAnimatedPiece> = ({ value, opacity }) => (
  <Animated.View
    style={[
      styles.square,
      {
        opacity: value.interpolate({
          inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          outputRange: opacity,
        }),
      },
    ]}
  />
);

// 9, 1, 5, 3, 8, 4, 7, 6, 2
export const Loader = ({ shown }: { shown: boolean }) => {
  const animationValue = useRef(new Animated.Value(0)).current;

  const setTiming = useCallback((value, to, duration) => {
    return Animated.timing(value, {
      toValue: to,
      duration,
      useNativeDriver: false,
    });
  }, []);

  const animate = useCallback(() => {
    function inner() {
      return Animated.sequence([
        setTiming(animationValue, 0, 100),
        setTiming(animationValue, 1, 100),
        setTiming(animationValue, 2, 100),
        setTiming(animationValue, 3, 100),
        setTiming(animationValue, 4, 100),
        setTiming(animationValue, 5, 100),
        setTiming(animationValue, 6, 100),
        setTiming(animationValue, 7, 100),
        setTiming(animationValue, 8, 100),
      ]).start(() => {
        animationValue.setValue(0);
        inner();
      });
    }

    inner();
  }, []);

  useEffect(() => {
    // animationValue.addListener(({ value }) => console.log('ANIMATION VALUE: ', value));

    if (shown) {
      animate();
    } else {
      animationValue.stopAnimation();
    }

    // animate();

    // return () =>
  }, [shown]);

  return (
    <View style={[styles.container, { display: shown ? 'flex' : 'none' }]}>
      <View style={styles.groupRow}>
        <AnimatedPiece value={animationValue} opacity={[0, 0.5, 1, 1, 1, 0.5, 0, 0, 0]} />
        <AnimatedPiece value={animationValue} opacity={[1, 1, 1, 0.5, 0, 0, 0, 0, 0.5]} />
        <AnimatedPiece value={animationValue} opacity={[0, 0, 0, 0.5, 1, 1, 1, 0.5, 0]} />
      </View>
      <View style={styles.groupRow}>
        <AnimatedPiece value={animationValue} opacity={[0.5, 0, 0, 0, 0, 0.5, 1, 1, 1]} />
        <AnimatedPiece value={animationValue} opacity={[0, 0, 0.5, 1, 1, 1, 0.5, 0, 0]} />
        <AnimatedPiece value={animationValue} opacity={[1, 1, 0.5, 0, 0, 0, 0, 0.5, 1]} />
      </View>
      <View style={styles.groupRow}>
        <AnimatedPiece value={animationValue} opacity={[1, 0.5, 0, 0, 0, 0, 0.5, 1, 1]} />
        <AnimatedPiece value={animationValue} opacity={[0, 0, 0, 0, 0.5, 1, 1, 1, 0.5]} />
        <AnimatedPiece value={animationValue} opacity={[0.5, 1, 1, 1, 0.5, 0, 0, 0, 0]} />
      </View>
    </View>
  );
};
