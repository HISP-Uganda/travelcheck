import React, {Component} from 'react';
import {View} from 'react-native';
import {Text} from 'native-base';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';


class ScanBoardingPass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
  }

  render() {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>NEW Boarding Pass SCAN</Text>
      </View>
    );
  }
}

export default ScanBoardingPass;
