import React, { Component } from 'react';
import {View } from 'react-native';
import { Fab, Icon, Footer, FooterTab, Button, Text } from 'native-base';
import { FloatingAction } from "react-native-floating-action";
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import Checkpoints from './Checkpoints';
//import AddCheckpoint from './AddCheckpoint';
import Passports from './Passports';
//import ScanPassport from './ScanPassport';
//import Checkpoints from './Checkpoints';

const Tab = createMaterialBottomTabNavigator();

class Settings extends Component {
   constructor(props) {
       super(props)
       this.state = {
         active: false
       };
   }

  render() {
    const actions = [
      {
        text: "Accessibility",
        icon: 'add',
        name: "bt_accessibility",
        position: 2
      }
    ]
    return (
      <View style={{ flex: 1}}>
        <Tab.Navigator
            initialRouteName="Checkpoints"
            activeColor="#ffd700"
            inactiveColor="#3e2465"
            barStyle={{ backgroundColor: '#FFFFFF', paddingBottom: 0}}>
              <Tab.Screen name="Checkpoints" component={Checkpoints}
                options={{
                  tabBarLabel: 'Checkpoints',
                  tabBarIcon: ({ color }) => (
                    <Icon name="pin" style={{fontSize: 20}} />
                  ),
                }}
              />
              <Tab.Screen name="Passports" component={Passports}
                options={{
                  tabBarLabel: 'Passports',
                  tabBarIcon: ({ color }) => (
                    <FontAwesome5 name={'passport'} style={{fontSize: 20}}/>
                  ),
                }}
              />

              <Tab.Screen name="Boarding Pass" component={Checkpoints}
                  options={{
                     tabBarLabel: 'Boarding Pass',
                     tabBarIcon: ({ color }) => (
                       <Icon name="airplane" style={{fontSize: 20}} />
                     ),
                   }}
              />
        </Tab.Navigator>
      </View>
    );
  }
}

export default Settings;