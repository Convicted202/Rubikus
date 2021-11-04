import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimationController } from '../../../controllers/AnimationController';

const word = 'Rubikus';
const letters = word.split('');

export const SplashTitle = forwardRef((_, passedRef) => {
  const [letterPositions, setLetterPositions] = useState<Record<string, number>>({
    0: 55,
    1: 55,
    2: 55,
    3: 55,
    4: 55,
    5: 55,
    6: 55,
  });
  const [lineWidth, setLineWidth] = useState<number>(0);
  const [wordPosition, setWordPosition] = useState<number>(0);

  const timelineForwardRef = useRef<Record<string, any>>();
  const timelineBackwardRef = useRef<Record<string, any>>();

  const createForwardTimeline = () => {
    let p = { ...letterPositions, width: 0 };

    const lineTween = AnimationController.animate({
      autostart: false,
      target: p,
      to: { width: 220 },
      easing: AnimationController.Easing.Quadratic.Out,
      duration: 500,
      onUpdate: (obj) => {
        p = { ...p, ...obj };
        setLineWidth(p.width);
      },
    });

    let timeline = Object.keys(p).reduce((acc, el, i) => {
      const twn = AnimationController.animate({
        target: p,
        to: { [i]: 0 },
        easing: AnimationController.Easing.Elastic.Out(1, 0.8),
        delay: 150 * (i + 1),
        duration: 1000,
        onUpdate: (obj) => {
          p = { ...p, ...obj };
          setLetterPositions(p);
        },
      });

      acc = acc.chain(twn);

      return acc;
    }, lineTween);

    return timeline;
  };

  const createBackwardTimeline = () => {
    let t = { top: wordPosition };

    return AnimationController.animate({
      autostart: false,
      target: t,
      to: { top: -300 },
      easing: AnimationController.Easing.Quadratic.In,
      duration: 200,
      onUpdate: () => {
        setWordPosition(t.top);
      },
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
          transform: [{ translateY: wordPosition }],
        },
      ]}
    >
      <View style={styles.textWrapper}>
        <View style={styles.lettersGroup}>
          {letters.map((letter, i) => (
            <View style={[styles.letter, { transform: [{ translateY: letterPositions[i] }] }]} key={i}>
              <Text style={styles.letterText}>{letter}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.line, { width: lineWidth }]} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  textWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // fontFamily: "'Gemunu Libre', sans-serif",
    color: '#202020',
    overflow: 'hidden',
  },
  lettersGroup: { flexDirection: 'row' },
  letter: {
    padding: 3,
    paddingTop: 10,
    lineHeight: 10,
  },
  letterText: { fontWeight: 'bold', fontSize: 45 },
  line: {
    height: 5,
    backgroundColor: '#202020',
  },
});
