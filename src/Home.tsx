import React from 'react';
import { View, StyleSheet } from 'react-native';

import GLContainer from './GLContainer';

export default function Home() {
  return (
    <View style={styles.container}>
      <GLContainer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
