import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  name: string;
};

const Greeting: React.FC<Props> = ({ name }) => {
  return (
    <View>
      <Text>Hello, {name}!</Text>
    </View>
  );
};

export default Greeting;