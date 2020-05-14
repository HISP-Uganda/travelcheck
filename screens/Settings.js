import React, {Component} from 'react';
import {View} from 'react-native';
import {Icon} from 'native-base';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import Mappings from './lists/Mappings';
import Security from './Security';
const Tab = createMaterialBottomTabNavigator();

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Tab.Navigator
          initialRouteName="Security"
          activeColor="#ffd700"
          inactiveColor="#3e2465"
          barStyle={{backgroundColor: '#FFFFFF', paddingBottom: 0}}>
          <Tab.Screen
            name="Security"
            component={Security}
            options={{
              tabBarLabel: 'Security & Access',
              tabBarIcon: () => <Icon name="lock" style={{fontSize: 20}} />,
            }}
          />
          <Tab.Screen
            name="Mappings"
            component={Mappings}
            options={{
              tabBarLabel: 'DHIS2 Metadata',
              tabBarIcon: () => (
                <FontAwesome5 name={'cog'} style={{fontSize: 20}} />
              ),
            }}
          />
        </Tab.Navigator>
      </View>
    );
  }
}

export default Settings;
