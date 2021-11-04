import React, { useRef, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SplashTitle } from './components/SplashTitle';
import { SplashGoButton } from './components/SplashGoButton';
import { SplashScreen } from '../../controllers/SplashController';
import { RubiksCube } from '../../cube/Cube';
import { Screen } from '../../const/screens';
import { useGameViewContext } from '../../providers/ViewProvider';
import { useEnvironmentContext } from '../../providers/EnvironmentProvider';
import { useAnimation } from '../../hooks/useAnimation';
import { HapticFeedbackType, withHaptic } from '../../native/HapticFeedback';

import type { IAnimatableTriggers, ScreenComponent } from '../../types';

let ExampleCube: RubiksCube = null;

export const SplashView: ScreenComponent = () => {
  const splashTitleRef = useRef<IAnimatableTriggers>();
  const splashGoRef = useRef<IAnimatableTriggers>();

  const animation = useRef<SplashScreen>();
  const animationProgress = useRef(false);
  const allowLeave = useRef(false);

  useAnimation();
  const context = useGameViewContext();

  const environment = useEnvironmentContext();
  let t;

  useEffect(() => {
    context.setLoading(true);

    if (!environment || !environment.scene || !environment.camera) {
      return;
    }

    if (!ExampleCube) {
      // This takes a shit load of time, and is also blocking other background animations
      // Average time is 4.5s for creation and first render of the cube
      t = new Date().getTime();

      ExampleCube = new RubiksCube(3);

      console.log('Rubiks init => ', new Date().getTime() - t);
      t = new Date().getTime();
    }

    animation.current = new SplashScreen(environment.scene, environment.camera, ExampleCube);

    const cubeAnimation = animation.current;

    context.setLoading(false);

    setTimeout(() => animateEnter(cubeAnimation), 200);
  }, [environment]);

  const animateEnter = useCallback((cubeAnimation: SplashScreen) => {
    if (animationProgress.current) {
      return;
    } else {
      animationProgress.current = true;
    }

    animation.current = cubeAnimation;

    return animation.current
      ?.animateDriveIn()
      .finished.then(() => {
        return animation.current.animateZoomOut().finished;
      })
      .then(() => {
        animation.current.animateInfiniteYoyo();
        splashGoRef.current.trigger();
        return splashTitleRef.current.trigger().finished;
      })
      .then(() => {
        allowLeave.current = true;
        animationProgress.current = false;
      });
  }, []);

  const animateLeave = useCallback(() => {
    if (animationProgress.current || !allowLeave.current) {
      return;
    } else {
      animationProgress.current = true;
    }

    return animation.current
      ?.animateDriveOut()
      .finished.then(() => {
        splashTitleRef.current.triggerOut();
        return splashGoRef.current.triggerOut().finished;
      })
      .then(() => {
        // AnimationController.removeAll();
        animation.current.finishAnimations();
        animationProgress.current = false;
        allowLeave.current = false;
        // rubiksCube.current.dispose();
        context.navigate(Screen.Modes);
      });
  }, [context]);

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.touchArea} onPress={() => withHaptic(HapticFeedbackType.Heavy)(() => animateLeave())}>
        <SplashTitle ref={splashTitleRef} />
        <View style={styles.spanner} />
        <SplashGoButton ref={splashGoRef} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
  },
  touchArea: {
    flex: 1,
  },
  spanner: {
    flex: 1,
  },
});
