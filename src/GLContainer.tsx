import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';

import { useEnvironment } from './three/Environment';

import { SplashView } from './views/SplashView/SplashView';
import { ModeSelectionView } from './views/ModeSelectionView/ModeSelectionView';
import { ColorsScanView } from './views/ColorsScanView/ColorsScanView';
import { SolutionView } from './views/SolutionView/SolutionView';

import { GameViewsProvider } from './providers/ViewProvider';
import { EnvironmentProvider } from './providers/EnvironmentProvider';

import { AnimationController } from './controllers/AnimationController';

export default function GLContainer() {
  const [gl, setGL] = useState<ExpoWebGLRenderingContext>();

  const environment = useEnvironment({ gl });

  useEffect(() => {
    if (!environment) return;

    render();
  }, [environment]);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    setGL(gl);
  };

  const render = useCallback(() => {
    requestAnimationFrame(render);

    environment.camera.lookAt(0, 0, 0);
    environment.renderer.render(environment.scene, environment.camera);

    AnimationController.updateAll();

    gl.endFrameEXP();
  }, [environment]);

  return (
    <View style={[styles.container]}>
      <GLView onContextCreate={onContextCreate} style={styles.glView} />
      <EnvironmentProvider environment={environment}>
        <GameViewsProvider>
          <SplashView />
          <ModeSelectionView />
          <ColorsScanView />
          <SolutionView />
        </GameViewsProvider>
      </EnvironmentProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  glView: {
    flex: 1,
  },
});
