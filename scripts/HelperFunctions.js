import _ from 'lodash';

const getFormattedCurrentTime = (time = 0, totalDuration) => {
  const symbol = ''; //this.state.showRemainingTime ? '-' : '';
  time = Math.min(Math.max(time, 0), totalDuration);

  const formattedMinutes = _.padStart(Math.floor(time / 60).toFixed(0), 2, '0');
  const formattedSeconds = _.padStart(Math.floor(time % 60).toFixed(0), 2, '0');

  return `${symbol}${formattedMinutes}:${formattedSeconds}`;
};

const getFormattedTotalDuration = totalDuration => {
  const formattedMinutes = _.padStart(
    Math.floor(totalDuration / 60).toFixed(0),
    2,
    0,
  );
  const formattedSeconds = _.padStart(
    Math.floor(totalDuration % 60).toFixed(0),
    2,
    0,
  );

  return `${formattedMinutes}:${formattedSeconds}`;
};

export {getFormattedCurrentTime, getFormattedTotalDuration};
