import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HapticFeedbackType, withHaptic } from '../../../native/HapticFeedback';

interface IPlaybackControl {
  type: 'play' | 'stop' | 'next' | 'back';
  onClick: (e?: any) => any;
  inactive?: boolean;
  color?: string;
}

export const PlaybackControl: React.FC<IPlaybackControl> = ({ type, onClick, inactive = false, color = '#f7f7f7' }) => {
  const iconName = useMemo(() => {
    switch (type) {
      case 'play':
        return 'play';
      case 'stop':
        return 'stop';
      case 'next':
        return 'step-forward';
      case 'back':
        return 'step-backward';
      default:
        break;
    }
  }, [type]);

  return (
    <Pressable
      style={[
        styles.wrapper,
        {
          backgroundColor: color,
          opacity: inactive ? 0.5 : 1,
        },
      ]}
      onPress={() => withHaptic(HapticFeedbackType.Heavy)(onClick)}
    >
      <Icon name={iconName} size={40} color="#ffffff" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: '#ffffff',
    // border: '2px solid #ffffff',
    // lineHeight: '1em',
    borderRadius: 10,
    // boxShadow: '0px 3px 8px #aaa',
    // fontSize: '1.5em',
  },
  // inactive: {
  //   opacity: 0.5,
  // },
});
