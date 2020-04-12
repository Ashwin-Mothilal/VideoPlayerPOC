import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {CONTAINER_PADDING} from './SeekBarControls';
import {
  getFormattedCurrentTime,
  getFormattedTotalDuration,
} from './HelperFunctions';

class DurationView extends PureComponent {
  render() {
    return (
      <View style={[DurationViewStyles.container]} pointerEvents={'none'}>
        <Text style={DurationViewStyles.durationText}>
          {getFormattedCurrentTime(
            this.props.currentTime,
            this.props.totalDuration,
          )}
        </Text>
        <Text style={DurationViewStyles.durationText}>
          {getFormattedTotalDuration(this.props.totalDuration)}
        </Text>
      </View>
    );
  }
}

const DurationViewStyles = StyleSheet.create({
  container: {
    height: 50,
    width: '100%',
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: CONTAINER_PADDING,
  },
  durationText: {
    color: 'darkgrey',
  },
});

export default DurationView;
