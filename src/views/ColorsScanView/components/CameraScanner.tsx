import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Linking, Text } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import Reanimated, { runOnJS, useAnimatedProps, useSharedValue } from 'react-native-reanimated';

import { scanBitmapColors } from '../../../frameprocessors/BitmapColorProcessor';
import { processWorkletBounds, processWorkletColors } from '../../../frameprocessors/process';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({ zoom: true });

interface ICameraScanner {
  onColorsScanned: (colors: any[]) => any;
  animationRef: React.RefObject<any>;
  cubeScanSize?: number;
}

export const CameraScanner: React.FC<ICameraScanner> = ({ onColorsScanned, animationRef, cubeScanSize }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    Camera.requestCameraPermission().then((status) => {
      if (status === 'authorized') {
        setHasPermission(true);
      } else {
        Linking.openSettings();
        setHasPermission(hasPermission);
      }
    });
  }, [hasPermission]);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      try {
        if (animationRef.current?.inProgress) {
          return;
        }

        const result = scanBitmapColors(frame, cubeScanSize);

        runOnJS(processWorkletColors)(result.colors, setColors);
      } catch (err) {
        console.error(`Frameprocessor failed: ${err}`);
      }
    },
    [cubeScanSize],
  );

  useEffect(() => {
    onColorsScanned(colors);
  }, [colors]);

  const devices = useCameraDevices();
  const backCamera = devices.back;
  const device = backCamera;

  //   // zoom
  const zoom = useSharedValue(0);

  const animatedProps = useAnimatedProps(() => {
    return { zoom: zoom.value };
  }, [zoom]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.textStyle}>No permission</Text>
      </View>
    );
  }

  if (!backCamera) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ReanimatedCamera
        style={styles.container}
        device={device}
        isActive={true}
        animatedProps={animatedProps}
        frameProcessorFps={5}
        frameProcessor={frameProcessor}
        fps={30}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textStyle: {
    justifyContent: 'center',
  },
});
