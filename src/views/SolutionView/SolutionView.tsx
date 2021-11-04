import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useEnvironmentContext } from '../../providers/EnvironmentProvider';
import { useGameViewContext } from '../../providers/ViewProvider';
import { useAnimation } from '../../hooks/useAnimation';

import { ThistlethwaiteSolver } from '../../algo/thistlethwaite';
import { BFS2x2Solver } from '../../algo/min2x2';

import { SolutionAnimation } from '../../controllers/SolutionController';
import { PlaybackControls } from './components/PlaybackControls';

import type { ScreenComponent } from '../../types';

export const SolutionView: ScreenComponent = () => {
  const environment = useEnvironmentContext();
  const gameContext = useGameViewContext();
  useAnimation();

  const solution = useRef<string>();
  const [animation, setAnimation] = useState<SolutionAnimation>();

  const solve = useCallback(() => {
    const size = gameContext.cube.size;
    const solverInputData = size === 2 ? gameContext.cube.getBFS2x2Input() : gameContext.cube.getThistlethwaiteInput();

    const solver = size === 2 ? new BFS2x2Solver() : new ThistlethwaiteSolver();
    const result = solver.solve(solverInputData);

    solution.current = result;
  }, [gameContext]);

  useEffect(() => {
    if (!environment || !environment.scene || !environment.camera || !gameContext.cube) {
      return;
    }

    if (solution.current) return;

    gameContext.cube.fixAssignedColors();

    solve();

    const anima = new SolutionAnimation(environment.scene, gameContext.cube, solution.current);
    setAnimation(anima);

    gameContext.setLoading(false);
  }, [environment, gameContext, solve]);

  return (
    <View style={styles.overlay}>
      <PlaybackControls animation={animation} />
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
    justifyContent: 'flex-end',
  },
});
