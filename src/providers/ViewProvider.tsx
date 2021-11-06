import React, { useState, useContext, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { RubiksCube } from '../cube/Cube';
import { Loader } from '../views/components/NativeLoader';
import { Screen } from '../const/screens';
import { ErrorBoundary } from '../views/ErrorBoundary/ErrorBoundary';
import { HapticFeedbackType, withHaptic } from '../native/HapticFeedback';

interface IGameViewState {
  view?: number;
  cube?: RubiksCube;
  setLoading?(show: boolean): void;
  setCubeData?(c: RubiksCube): void;
  navigate?(v: number): void;
}

const GameViewsContext = React.createContext<IGameViewState>({});

export const GameViewsProvider: React.FC = ({ children }) => {
  const [view, setView] = useState(0);
  const [cube, setCube] = useState();
  const [isLoading, setLoading] = useState<boolean>(false);

  const navigate = useCallback((v) => setView(v), [setView]);
  const setCubeData = useCallback((c) => setCube(c), [setCube]);

  const goBack = useCallback(() => {
    setLoading(true);

    const prevView = view === Screen.Solution ? Screen.Modes : view - 1;
    setTimeout(() => navigate(prevView), 0);
  }, [view, navigate, setLoading]);

  const ScreenView = React.Children.toArray(children)[view];

  return (
    <GameViewsContext.Provider value={{ view, cube, setCubeData, navigate, setLoading }}>
      <ErrorBoundary>{ScreenView ?? null}</ErrorBoundary>
      <Loader shown={isLoading} />
      {view !== 0 && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={() => withHaptic(HapticFeedbackType.Heavy)(goBack)}>
            <Icon name="arrow-left-circle" size={40} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Icon name="settings" size={40} color="black" />
          </TouchableOpacity>
        </View>
      )}
    </GameViewsContext.Provider>
  );
};

export const useGameViewContext = () => useContext(GameViewsContext);

const styles = StyleSheet.create({
  buttonsContainer: {
    flex: 1,
    position: 'absolute',
    flexDirection: 'row',
    height: 80,
    paddingBottom: 20,
    paddingHorizontal: 30,
    width: '100%',
    bottom: 0,
    justifyContent: 'space-between',
  },
  button: {
    alignItems: 'center',
    height: '100%',
    width: 50,
  },
});
