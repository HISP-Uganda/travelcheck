import React, { Component } from 'react';
import {Text, SafeAreaView, ScrollView} from 'react-native';
import MainStackNavigator from './AppNavigator';
import { SafeAreaProvider} from 'react-native-safe-area-context';

//import Scan from './contents/qrscan';
//import Scans from './contents/scans';
//import Options from './contents/options';
//import Icon from 'react-native-ionicons'

export default class App extends Component {
  render() {
    return (
        <MainStackNavigator />
    )
  }
}