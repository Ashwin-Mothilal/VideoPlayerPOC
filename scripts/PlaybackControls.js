import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import IconView from './IconView';

const {height} = Dimensions.get('window');

class PlaybackControls extends Component {
  constructor(props) {
    super(props);
    this.waitForDoubleTapTimer = null;
  }

  render() {
    console.log('The opacity animation is ', this.props.opacityValue);
    let toRender = (
      <IconView
        name={this.props.paused ? 'play' : 'pause'}
        color={'white'}
        size={30}
      />
    );
    if (this.props.bufferedDuration < this.props.currentTime) {
      toRender = (
        <View
          style={PlaybackControlStyles.bufferContainer}
          pointerEvents={'none'}>
          <IconView name={'spinner'} />
        </View>
      );
    }
    return (
      <Animated.View
        style={[
          PlaybackControlStyles.container,
          {
            opacity: this.props.opacityAnimation,
          },
        ]}>
        {/*disabled={this.props.opacityValue <= 0}*/}
        <TouchableOpacity
          onPress={() => {
            this.props.onPressPlayPauseButton();
          }}
          style={[PlaybackControlStyles.touchable]}>
          {toRender}
        </TouchableOpacity>
        <TouchableOpacity
          style={[PlaybackControlStyles.showControlsContainer]}
          onPress={this.onTapControls}>
          <View />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  onTapControls = event => {
    this.waitForDoubleTapTimer = setTimeout(() => {
      //double tap
      clearTimeout(this.waitForDoubleTapTimer);
    }, 350);
    this.props.onShowAllControls();
  };
}

const PlaybackControlStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  touchable: {
    height: 60,
    width: 60,
    //backgroundColor: chroma('#333').alpha(0.5),
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  showControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  bufferContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
});

export default PlaybackControls;
