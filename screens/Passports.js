import React, { Component } from 'react';
import {View, TouchableOpacity } from 'react-native';
import { Fab, Icon, Footer, FooterTab, Button, Text } from 'native-base';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import styles from '../styles/styles';

const Tab = createMaterialBottomTabNavigator();

class Passports extends Component {
   constructor(props) {
       super(props)
       this.state = {
         active: false
       };
   }

  render() {
    const { navigation } = this.props;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>SCanned Passports GOES HERE</Text>

        <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ScanPassport',{screen: 'ScanPassport'})}
              style={styles.touchableOpacityStyle}>
              <Icon name="add" />
            </TouchableOpacity>
      </View>
    );
  }
}

export default Passports;