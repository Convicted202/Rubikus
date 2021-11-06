import React, { useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ErrorBoundary as CatchErrors } from 'react-error-boundary';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SolutionGenerationError, ColorParsingException } from '../../utils/errors';
import { Screen } from '../../const/screens';
import { useGameViewContext } from '../../providers/ViewProvider';
import { HapticFeedbackType, withHaptic } from '../../native/HapticFeedback';

interface IErrorFallback {
  error: Error;
  resetErrorBoundary: (e?: any) => void;
}

const ErrorFallback: React.FC<IErrorFallback> = ({ error, resetErrorBoundary }) => {
  let text;
  let subtext;

  if (error instanceof SolutionGenerationError) {
    text = 'Solution cannot be generated';
    subtext = 'Something went wrong';
  } else if (error instanceof ColorParsingException) {
    text = 'Could not parse the colors';
    subtext = 'Ensure that there is no glare on the cube';
  } else {
    text = 'Something went wrong';
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.iconWrap}>
        <MCIcon name="emoticon-dead-outline" size={85} color="#d62828" style={{ lineHeight: 100 }} />
      </View>
      <Text style={styles.text}>Uh-oh</Text>
      <Text style={styles.text}>{text}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={() => withHaptic(HapticFeedbackType.Heavy)(resetErrorBoundary)}>
        <Text style={styles.tryAgain}>Try again</Text>
        <FAIcon name="redo-alt" size={20}></FAIcon>
      </TouchableOpacity>
    </View>
  );
};

export const ErrorBoundary: React.FC = ({ children }) => {
  const gameContext = useGameViewContext();

  const resetLoading = useCallback(() => {
    gameContext.cube.dispose();
    gameContext.setLoading(false);
  }, []);

  return (
    <CatchErrors FallbackComponent={ErrorFallback} onReset={() => gameContext.navigate(Screen.Modes)} onError={resetLoading}>
      {children}
    </CatchErrors>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0077b6',
  },
  iconWrap: {
    marginBottom: 50,
    padding: 10,
  },
  uhOh: {
    fontSize: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    alignItems: 'center',
  },
  subtext: {
    fontSize: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  button: {
    marginTop: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tryAgain: {
    fontSize: 25,
    fontWeight: 'bold',
    marginRight: 10,
  },
});
