import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {Icon} from 'native-base';

//Screens Available
import Home from './screens/Home';
import Scans from './screens/Scans';
import ScanDetails from './screens/ScanDetails';
import Details from './screens/Details';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

const getHeaderTitle = (route) => {
  const routeName = route.state
    ? route.state.routes[route.state.index].name
    : route.params?.screen || 'Home'

  switch (routeName) {
    case 'Home':
      return 'Home'
    case 'Scans':
      return 'Scanned TravelPasses'
    case 'ScanDetails':
      return 'Scan Details'
  }
}

const MainTabNavigator = () => {
    return (
      <Tab.Navigator
        tabBarOptions={{
          activeTintColor: '#101010',
          style: {
            backgroundColor: '#ffd700'
          }
        }}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName
            if (route.name == 'Home') {
              iconName = 'qr-scanner'
            } else if (route.name == 'Scans') {
              iconName = 'ios-person'
            }
            else if (route.name == 'ScanDetails') {
              iconName = 'ios-add'
            }
            return <Icon name={iconName} color={color} size={size} />
          }
        })}>
        <Tab.Screen name='Home' component={Home} />
        <Tab.Screen name='Scans' component={Scans} />
        <Tab.Screen name='ScanDetails' component={ScanDetails} />
      </Tab.Navigator>
    )
}


const MainStackNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName='Home'
        screenOptions={{
          gestureEnabled: true,
          headerStyle: {
            backgroundColor: '#101010'
          },
          headerTitleStyle: {
            fontWeight: 'bold'
          },
          headerTintColor: '#ffd700',
          headerBackTitleVisible: false
        }}
        headerMode='float'>
        <Stack.Screen
          name='Home'
          component={MainTabNavigator}
          options={({ route }) => ({
            headerTitle: getHeaderTitle(route)
          })}
        />
        <Stack.Screen
          name='Details'
          component={Details}
          options={({ route }) => ({
            title: route.params.params.scan_id
          })}
        />
        <Stack.Screen
          name='ScanDetails'
          component={ScanDetails}
          options={{ title: 'ScanDetails' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default MainStackNavigator