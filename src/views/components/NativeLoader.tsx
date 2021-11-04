import React from 'react';
import { StyleSheet, View } from 'react-native';
import Spinner from 'react-native-spinkit';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0077b6',
  },
});

export const Loader = ({ shown }: { shown: boolean }) => {
  return (
    <View style={[styles.container, { display: shown ? 'flex' : 'none' }]}>
      <Spinner isVisible={shown} size={100} type="9CubeGrid" color="#ffffff" />
    </View>
  );
};
