import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useGameViewContext } from '../../providers/ViewProvider';
import { RubiksCube } from '../../cube/Cube';
import { Screen } from '../../const/screens';
// import { AnimationController } from '../../controllers/AnimationController';
import { useAnimation } from '../../hooks/useAnimation';
import { HapticFeedbackType, withHaptic } from '../../native/HapticFeedback';

import type { ScreenComponent } from '../../types';

export const ModeSelectionView: ScreenComponent = () => {
  const [wrapOpacity, setWrapOpacity] = useState(0);
  const [lineWidth, setLineWidth] = useState(0);

  const AnimationController = useAnimation();
  const context = useGameViewContext();

  useEffect(() => {
    context.setLoading(false);
    context.cube?.dispose();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {
    let o = { opacity: wrapOpacity, width: lineWidth };

    const lineTween = AnimationController.animate({
      autostart: false,
      target: o,
      to: { width: 250 },
      easing: AnimationController.Easing.Quadratic.Out,
      duration: 500,
      onUpdate: () => {
        setLineWidth(o.width);
      },
    });

    return AnimationController.animate({
      target: o,
      to: { opacity: 1 },
      easing: AnimationController.Easing.Quadratic.Out,
      duration: 1000,
      onUpdate: () => {
        setWrapOpacity(o.opacity);
      },
    }).chain(lineTween);
  }, []);

  const leaveScreen = useCallback(
    (cubeSize) => {
      let o = { opacity: 1 };

      return AnimationController.animate({
        target: o,
        to: { opacity: 0 },
        easing: AnimationController.Easing.Quadratic.Out,
        duration: 500,
        onUpdate: () => {
          setWrapOpacity(o.opacity);
        },
        onComplete: () => {
          context.setLoading(true);

          setTimeout(() => {
            const rubiksCube = new RubiksCube(cubeSize);
            context.setLoading(false);
            context.setCubeData(rubiksCube);
            context.navigate(Screen.CubeScan);
          });
        },
      });
    },
    [context],
  );

  return (
    <View style={[styles.container, { opacity: wrapOpacity }]}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>CHOOSE MODE</Text>
        <View style={[styles.line, { width: lineWidth }]} />
      </View>
      <TouchableOpacity style={styles.button} onPress={() => withHaptic(HapticFeedbackType.Heavy)(() => leaveScreen(2))}>
        <Text style={styles.modeTitle}>2 x 2 x 2</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => withHaptic(HapticFeedbackType.Heavy)(() => leaveScreen(3))}>
        <Text style={styles.modeTitle}>3 x 3 x 3</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    // fontFamily: '"Gemunu Libre", sans-serif',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    // color: '#f39c12', //'#202020',
    margin: 20,
    width: 150,
    height: 100,
    borderRadius: 8,
    borderBottomWidth: 10,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    backgroundColor: '#f1c40f',
    borderColor: '#f39c12',
    // backgroundColor: '#f7f7f7',
    // borderColor: '#f7f7f7',
    // boxShadow: '0px 3px 8px #aaa, inset 0px 2px 3px #fff',
  },
  titleWrap: {
    width: 250,
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    // fontFamily: '"Gemunu Libre", sans-serif',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#040020',
  },
  line: {
    width: 0,
    height: 3,
    marginBottom: 15,
    backgroundColor: '#040020',
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a76d11',
  },
});
