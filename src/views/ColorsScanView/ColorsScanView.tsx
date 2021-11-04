import React, { useRef, useState, useEffect } from 'react';
import { View } from 'react-native';
import { ColorAnimation } from '../../controllers/ColorScanController';
import { PointDirection } from './components/PointDirection';
import { Face } from '../../const/constants';
import { Screen } from '../../const/screens';
import { useEnvironmentContext } from '../../providers/EnvironmentProvider';
import { useGameViewContext } from '../../providers/ViewProvider';
import { useAnimation } from '../../hooks/useAnimation';

import { CameraScanner } from './components/CameraScanner';
import { ColorConversion } from '../../algo/ciede2000';

import type { IAnimatableTriggers, ScreenComponent } from '../../types';

const probesNum = 5;

export const ColorsScanView: ScreenComponent = () => {
  const pointRightRef = useRef<IAnimatableTriggers>();
  const pointDownRef = useRef<IAnimatableTriggers>();
  const processedColorsCountRef = useRef<number>(0);

  const [colors, setColors] = useState([]);

  useAnimation();
  const environment = useEnvironmentContext();
  const gameContext = useGameViewContext();

  const animation = useRef<ColorAnimation>();

  useEffect(() => {
    gameContext.setLoading(false);

    return () => gameContext.setLoading(true);
  }, []);

  useEffect(() => {
    if (!environment || !environment.scene || !environment.camera || !gameContext.cube || processedColorsCountRef.current > 0) {
      return;
    }

    environment.camera.position.set(2.2, 1.8, 5.1);

    environment.resizeTo(2);

    gameContext.cube.resetColors();
    gameContext.cube.addToScene(environment.scene);

    animation.current = new ColorAnimation(environment.scene, gameContext.cube, [pointDownRef, pointRightRef]);

    return () => {
      environment.resizeTo(1);
      animation.current = null;
    };
  }, [environment, gameContext]);

  useEffect(() => {
    console.log('COLORS LENGTH AMOUNT: ', colors?.length);

    if (!animation.current || animation.current?.inProgress || processedColorsCountRef.current >= 6) {
      return;
    }

    console.log('COLORS WILL BE APPLIED NOW');

    const cubeSize = gameContext.cube.size;

    if (gameContext.cube && colors?.length === cubeSize * cubeSize) {
      processedColorsCountRef.current = processedColorsCountRef.current + 1;

      const faceColors = colors.map((color) => {
        return ColorConversion.rgb2hex(...(color as [number, number, number]));
      });

      gameContext.cube.setColorsForFace(Face.F, faceColors);
      animation.current?.createAnimation(() => {
        gameContext.setLoading(true);

        gameContext.cube.hasVolatileColors = true;

        setTimeout(() => {
          gameContext.navigate(Screen.Solution);
        });
      });
    }
  }, [gameContext, colors]);

  return (
    <View style={{ flex: 1 }}>
      <CameraScanner onColorsScanned={setColors} animationRef={animation} cubeScanSize={gameContext.cube.size} />
      <PointDirection direction="down" ref={pointDownRef} />
      <PointDirection direction="right" ref={pointRightRef} />
    </View>
  );
};

// const setFaceletBounds = useCallback(
//   (b) => {
//     const rW = Dimensions.get('window').width / 1080;
//     const rH = Dimensions.get('window').width / 1080;

//     const w = PixelRatio.getPixelSizeForLayoutSize(Dimensions.get('screen').width);
//     const h = PixelRatio.getPixelSizeForLayoutSize(Dimensions.get('screen').height);

//     console.log('DIMS: ', rW * 1080, rH * 1080);
//     console.log('PXLRATIO: ', w, h);

//     const blocks = b.map((bound) => {
//       const left = bound[0][0] * rW;
//       const top = bound[0][1] * rH - (rH * Dimensions.get('window').height) / 3;
//       const right = bound[3][0] * rW;
//       const bottom = bound[3][1] * rH - (rH * Dimensions.get('window').height) / 3;

//       const width = right - left;
//       const height = bottom - top;

//       return {
//         left,
//         top,
//         width,
//         height,
//       };
//     });

//     // setBounds(blocks);
//   },
//   [setBounds],
// );
