import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { PlaybackControl } from './PlaybackControl';
import { SolutionAnimation } from '../../../controllers/SolutionController';

const ButtonColors = {
  blue: '#06608e',
  red: '#ff3d3d',
  yellow: '#feff6f',
  brown: '#795548',
  orange: '#ff8203',
};

export const PlaybackControls = ({ animation }: { animation: SolutionAnimation }) => {
  const [running, setRunning] = useState<boolean>();
  const [moveIndex, setMoveIndex] = useState(0);

  const hasPrev = useMemo(() => moveIndex > 0, [moveIndex]);
  const hasNext = useMemo(() => moveIndex < animation?.movesLength, [animation, moveIndex]);

  const startAnimation = useCallback(() => {
    setRunning(true);
    animation?.start((index) => {
      setMoveIndex(index);
      if (index >= animation?.movesLength) {
        setRunning(false);
      }
    });
  }, [animation]);

  const stopAnimation = useCallback(() => {
    setRunning(false);
    animation?.stop();
  }, [animation]);

  const animateNext = useCallback(() => {
    if (!hasNext) {
      return;
    }
    setMoveIndex(moveIndex + 1);
    animation?.next();
  }, [animation, moveIndex, hasNext]);

  const animatePrev = useCallback(() => {
    if (!hasPrev) {
      return;
    }
    setMoveIndex(moveIndex - 1);
    animation?.back();
  }, [animation, moveIndex, hasPrev]);

  return (
    <View style={styles.overlay}>
      {running && hasNext ? (
        <PlaybackControl type="stop" color={ButtonColors.red} onClick={() => stopAnimation()} />
      ) : (
        <PlaybackControl type="play" inactive={!hasNext} color={ButtonColors.orange} onClick={() => startAnimation()} />
      )}
      <PlaybackControl type="next" inactive={!hasNext} color={ButtonColors.blue} onClick={() => animateNext()} />
      <PlaybackControl type="back" inactive={!hasPrev} color={ButtonColors.brown} onClick={() => animatePrev()} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 100,
  },
});
