import React, { Component } from 'react';
import {Text} from 'react-native';
import MainStackNavigator from './AppNavigator'

//import Scan from './contents/qrscan';
//import Scans from './contents/scans';
//import Options from './contents/options';
//import Icon from 'react-native-ionicons'

export default class App extends Component {
  render() {
    return <MainStackNavigator />
  }
}