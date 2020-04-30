import React, { Component } from 'react';
import {View, TouchableOpacity } from 'react-native';
import { Fab, Icon, Footer, FooterTab, Button, Text } from 'native-base';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import styles from '../../styles/styles';

const Tab = createMaterialBottomTabNavigator();

class ScanIdentityCard extends Component {
   constructor(props) {
       super(props)
       this.state = {
         active: false
       };
   }

  render() {
    const { navigation, route } = this.props;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>NEW ID SCAN</Text>
      </View>
    );
  }
}

export default ScanIdentityCard;