import React, {memo} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

const IconView = memo(props => {
  return (
    <Icon
      name={props.name}
      size={props.size ?? 30}
      color={props.color ?? '#900'}
      {...props}
    />
  );
});

export default IconView;
