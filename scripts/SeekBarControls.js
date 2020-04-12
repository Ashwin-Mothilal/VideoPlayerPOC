import React, {Component} from 'react';
import {
  View,
  Text,
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {getFormattedCurrentTime} from './HelperFunctions';

const CONTAINER_PADDING = 30;
const THUMB_SIZE = 20;
const TRACK_HEIGHT = 2;
const TRACK_UPSCALE_HEIGHT = 5;
const THUMB_UPSCALE = 1.3;
const THUMB_SCALE = 1;
const ANIMATION_DURATION = 350;
const {width} = Dimensions.get('window');
const SEEKBAR_HEIGHT = 40;

class SeekBarControls extends Component {
  constructor(props) {
    super(props);
    this.translationX = new Animated.Value(-THUMB_SIZE / 2);
    this.thumbScale = new Animated.Value(THUMB_SCALE);
    this.progressScaleHeight = new Animated.Value(TRACK_HEIGHT);
    this.progressOpacity = new Animated.Value(0);
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.onStart,
      onMoveShouldSetPanResponder: this.onMove,
      onPanResponderGrant: this.onGrant,
      onPanResponderMove: this.onMoving,
      onPanResponderRelease: this.onRelease,
      onPanResponderTerminate: this.onRelease,
    });
    this.trackWidth = width - CONTAINER_PADDING * 2;
    this.translationXValue = 0;
    this.state = {
      isSeekerActive: false,
    };
  }

  render() {
    return (
      <View
        style={[
          SeekBarControlStyles.container,
          {paddingHorizontal: CONTAINER_PADDING},
        ]}>
        <View
          style={[SeekBarControlStyles.panContainer]}
          {...this.panResponder.panHandlers}>
          <Animated.View
            style={[
              SeekBarControlStyles.track,
              {
                height: this.progressScaleHeight,
              },
            ]}
            pointerEvents={'none'}
            onLayout={({nativeEvent}) =>
              (this.trackWidth = nativeEvent.layout.width)
            }
          />
          <Animated.View
            style={[
              {
                transform: [
                  {
                    translateX: Animated.add(this.translationX, -13),
                  },
                ],
                opacity: this.progressOpacity,
                height: THUMB_SIZE,
              },
              SeekBarControlStyles.progressPopup,
            ]}
            pointerEvents={'none'}>
            <Text style={SeekBarControlStyles.seekTextStyle}>
              {getFormattedCurrentTime(
                this.translationXValue,
                this.props.totalDuration,
              )}
            </Text>
          </Animated.View>
          <Animated.View
            style={[
              SeekBarControlStyles.seek,
              {
                height: THUMB_SIZE,
                width: THUMB_SIZE,
                transform: [
                  {
                    translateX: this.translationX,
                  },
                  {
                    scale: this.thumbScale,
                  },
                ],
              },
            ]}
            pointerEvents={'none'}
          />
          <Animated.View
            style={[
              SeekBarControlStyles.buffered,
              {
                width: this.maintainWidthTimeRatio(this.props.bufferedDuration),
                height: this.progressScaleHeight,
              },
            ]}
            pointerEvents={'none'}
          />
          <Animated.View
            style={[
              SeekBarControlStyles.fill,
              {
                width: this.maintainWidthTimeRatio(this.props.currentTime),
                height: this.progressScaleHeight,
              },
            ]}
            pointerEvents={'none'}
          />
        </View>
      </View>
    );
  }

  componentDidMount() {
    this.translationX.addListener(({value}) => {
      //this.translationXValue = value;
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.isSeekerActive) {
      if (this.props.currentTime !== prevProps.currentTime) {
        this.translationX.setValue(
          (this.props.currentTime / this.props.totalDuration) *
            this.trackWidth -
            THUMB_SIZE / 2,
        );
      }
    }
  }

  componentWillUnmount() {
    this.translationX.removeAllListeners();
  }

  onStart = (evt, gestureState) => {
    return true;
  };

  onMove = (evt, gestureState) => {
    return true;
  };

  onGrant = (evt, gestureState) => {
    this.translationXValue = this.updateSeekBarValue(gestureState);
    Animated.parallel([
      Animated.timing(this.thumbScale, {
        toValue: THUMB_UPSCALE,
        duration: ANIMATION_DURATION,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(this.progressOpacity, {
        toValue: 1,
        delay: 250,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.translationX, {
        toValue: gestureState.x0 - CONTAINER_PADDING - THUMB_SIZE / 2,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.progressScaleHeight, {
        toValue: TRACK_UPSCALE_HEIGHT,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
    this.props.onSeekBarSeeking();
    this.setState({
      isSeekerActive: true,
    });
  };

  onMoving = (evt, gestureState) => {
    if (
      gestureState.moveX - CONTAINER_PADDING - THUMB_SIZE / 2 > 0 &&
      gestureState.moveX + CONTAINER_PADDING + THUMB_SIZE / 2 < width
    ) {
      this.translationXValue = this.updateSeekBarValue(gestureState);
      this.translationX.setValue(
        gestureState.moveX - CONTAINER_PADDING - THUMB_SIZE / 2,
      );
    }
  };

  onRelease = (evt, gestureState) => {
    this.resetSeekThumb();
    const seekBarValue = this.updateSeekBarValue(gestureState);
    this.props.onSeekBarSeeked(seekBarValue);
    this.setState({
      isSeekerActive: false,
    });
  };

  resetSeekThumb = () => {
    Animated.parallel([
      Animated.timing(this.thumbScale, {
        toValue: THUMB_SCALE,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.progressOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.progressScaleHeight, {
        toValue: TRACK_HEIGHT,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  };

  maintainWidthTimeRatio = time => {
    if (this.props.totalDuration === 0) {
      return 0;
    }
    return (time / this.props.totalDuration) * this.trackWidth;
  };

  updateSeekBarValue = gestureState => {
    return (
      (((gestureState.moveX !== 0 ? gestureState.moveX : gestureState.x0) -
        CONTAINER_PADDING) /
        this.trackWidth) *
      this.props.totalDuration
    );
  };
}

const SeekBarControlStyles = StyleSheet.create({
  container: {
    height: SEEKBAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    width: '100%',
  },
  seek: {
    position: 'absolute',
    borderRadius: 15,
    backgroundColor: 'lightgreen',
    zIndex: 4,
  },
  panContainer: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    width: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    borderRadius: 2.5,
    zIndex: 1,
  },
  fill: {
    height: TRACK_HEIGHT,
    backgroundColor: 'lightgreen',
    position: 'absolute',
    zIndex: 3,
    borderWidth: 0,
    borderRadius: 2.5,
  },
  progressPopup: {
    position: 'absolute',
    top: -30,
    left: 0,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  buffered: {
    height: TRACK_HEIGHT,
    backgroundColor: 'darkgrey',
    position: 'absolute',
    zIndex: 2,
    borderWidth: 0,
    borderRadius: 2.5,
  },
  seekTextStyle: {
    color: 'black',
  },
});

export default SeekBarControls;
export {SEEKBAR_HEIGHT, CONTAINER_PADDING};
