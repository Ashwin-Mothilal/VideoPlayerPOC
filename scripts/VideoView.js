import React, {Component, createRef} from 'react';
import {Animated, StyleSheet, UIManager, View} from 'react-native';
import Video from 'react-native-video';
import SeekBarControls from './SeekBarControls';
import PlaybackControls from './PlaybackControls';
import DurationView from './DurationView';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

class VideoView extends Component {
  constructor(props) {
    super(props);
    this.videoPlayer = createRef();
    this.opacityAnimation = new Animated.Value(1);
    this.state = {
      paused: true,
      totalDuration: 0,
      currentTime: 0,
      bufferedDuration: 0,
      isBuffering: false,
    };
    this.opacityTimeout = null;
  }

  render() {
    return (
      <View style={[VideoStyles.container]}>
        <View style={VideoStyles.videoAndPlaybackContainer}>
          <Video
            source={{
              uri:
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            }}
            ref={this.videoPlayer}
            onBuffer={this.onBuffer}
            onError={this.onError}
            style={VideoStyles.video}
            paused={this.state.paused}
            onProgress={this.onProgress}
            onLoad={this.onLoad}
            onReadyForDisplay={() => {
              //Callback function that is called when the first video frame is ready for display. This is when the poster is removed.
            }}
            rate={1.0}
            selectedTextTrack={{
              type: 'disabled',
            }}
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 5000,
              bufferForPlaybackMs: 2500,
              bufferForPlaybackAfterRebufferMs: 5000,
            }}
          />
          <PlaybackControls
            onPressPlayPauseButton={this.onPressPlayPauseButton}
            paused={this.state.paused}
            opacityAnimation={this.opacityAnimation}
            onShowAllControls={this.onShowAllControls}
            currentTime={this.state.currentTime}
            bufferedDuration={this.state.bufferedDuration}
            opacityValue={this.opacityValue}
          />
        </View>
        <Animated.View
          style={[
            {
              opacity: this.opacityAnimation,
            },
            VideoStyles.durationAndSeekBarContainer,
          ]}>
          <DurationView
            totalDuration={this.state.totalDuration}
            currentTime={this.state.currentTime}
            bufferedDuration={this.state.bufferedDuration}
          />
          <SeekBarControls
            totalDuration={this.state.totalDuration}
            currentTime={this.state.currentTime}
            bufferedDuration={this.state.bufferedDuration}
            onSeekBarSeeked={this.onSeekBarSeeked}
            onSeekBarSeeking={this.onSeekBarSeeking}
          />
        </Animated.View>
      </View>
    );
  }

  componentDidMount() {
    this.opacityAnimation.addListener(({value}) => {
      this.opacityValue = value;
      //console.log('The opacity animation is ', value);
    });
  }

  onLoad = ({currentTime, duration}) => {
    this.setState({
      totalDuration: duration,
      currentTime: currentTime,
    });
  };

  onPressPlayPauseButton = () => {
    this.setState(
      prevState => {
        return {
          paused: !prevState.paused,
        };
      },
      () => {
        if (!this.state.paused) {
          Animated.timing(this.opacityAnimation, {
            toValue: 0,
            duration: 350,
            delay: 500,
            useNativeDriver: true,
          }).start();
        } else {
          this.setControlsTimeout();
        }
      },
    );
  };

  setControlsTimeout = () => {
    clearTimeout(this.opacityTimeout);
    this.opacityTimeout = setTimeout(() => {
      Animated.timing(this.opacityAnimation, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }, 2500);
  };

  onShowAllControls = () => {
    clearTimeout(this.opacityTimeout);
    Animated.timing(this.opacityAnimation, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
    this.setControlsTimeout();
  };

  onSeekBarSeeking = () => {
    clearTimeout(this.opacityTimeout);
  };

  onSeekBarSeeked = seekBarValue => {
    this.setState(
      {
        paused: true,
      },
      () => {
        this.videoPlayer?.current?.seek(seekBarValue);
        this.setState(
          {
            paused: false,
          },
          () => {
            this.setControlsTimeout();
          },
        );
      },
    );
  };

  onProgress = ({currentTime, playableDuration, seekableDuration}) => {
    console.log('The buffer duration is ', playableDuration);
    console.log('The current time is ', currentTime);
    console.log('The total duration is ', seekableDuration);
    /*LayoutAnimation.configureNext(
          {...LayoutAnimation.Presets.linear},
          () => {},
        );*/
    this.setState({
      currentTime: currentTime,
      bufferedDuration: playableDuration,
      totalDuration: seekableDuration,
    });
  };

  onError = () => {
    console.log('onError');
  };

  onBuffer = ({isBuffering}) => {
    this.setState({
      isBuffering,
    });
  };
}

const VideoStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
    zIndex: 1,
  },
  videoAndPlaybackContainer: {
    flex: 1,
  },
  durationAndSeekBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});

export default VideoView;
