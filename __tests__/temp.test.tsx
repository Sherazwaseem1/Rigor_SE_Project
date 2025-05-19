import React from 'react';
import renderer from 'react-test-renderer';
import Greeting from '../app/(tabs)/greetings';

describe('Greeting component', () => {
  it('renders correctly with given name', () => {
    const tree = renderer.create(<Greeting name="Nomaan" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});