import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Icon, Footer, Text, Root} from 'native-base';

//Screens Available
import Home from './screens/Home';
import Scans from './screens/Scans';
import Details from './screens/Details';
import Settings from './screens/Settings';
import AddCheckpoint from './screens/AddCheckpoint';
import CheckpointDetails from './screens/Checkpoint';
import SecurityDetails from './screens/details/SecurityDetails';
import DHIS2Setting from './screens/documents/DHIS2Setting';
import Metadata from './screens/forms/Metadata';
import ScanIdentityCard from './screens/documents/ScanIdentityCard';
import ScanBoardingPass from './screens/documents/ScanBoardingPass';
import Checkpoints from './screens/Checkpoints';
import Mappings from './screens/lists/Mappings';
import Security from './screens/Security';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

const getHeaderTitle = (route) => {
  const routeName = route.state
    ? route.state.routes[route.state.index].name
    : route.params?.screen || 'Home';

  switch (routeName) {
    case 'Home':
      return 'Home';
    case 'Scans':
      return 'Scanned TravelPasses';
    case 'Stops':
      return 'All Scan points (Stops)';
    case 'DHIS2':
      return 'DHIS2 Settings';
  }
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: '#101010',
        style: {
          backgroundColor: '#ffd700',
        },
      }}
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          let iconName;
          if (route.name == 'Home') {
            iconName = 'qr-scanner';
          } else if (route.name == 'Scans') {
            iconName = 'ios-person';
          } else if (route.name == 'Settings') {
            iconName = 'ios-settings';
          }
          return <Icon name={iconName} color={color} size={size} />;
        },
      })}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Scans" component={Scans} />
      <Tab.Screen name="Stops" component={Checkpoints} />
      <Tab.Screen name="DHIS2" component={Settings} />
    </Tab.Navigator>
  );
};

const MainStackNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          gestureEnabled: true,
          headerStyle: {
            backgroundColor: '#101010',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTintColor: '#ffd700',
          headerBackTitleVisible: false,
        }}
        headerMode="float">
        <Stack.Screen
          name="Home"
          component={MainTabNavigator}
          options={({route}) => ({
            headerTitle: getHeaderTitle(route),
          })}
        />
        <Stack.Screen
          name="Details"
          component={Details}
          options={({route}) => ({
            title: route.params.params.scan_id,
          })}
        />
        <Stack.Screen
          name="CheckpointDetails"
          component={CheckpointDetails}
          options={({route}) => ({
            title: 'Checkpoint Details',
          })}
        />
        <Stack.Screen
          name="SecurityDetails"
          component={SecurityDetails}
          options={({route}) => ({
            title: 'DHIS2 Security Details',
          })}
        />
        <Stack.Screen
          name="DHIS2"
          component={Settings}
          options={{title: 'DHIS2 Settingss'}}
        />
        <Stack.Screen
          name="AddCheckpoint"
          component={AddCheckpoint}
          options={({route}) => ({
            title: 'Add Checkpoint',
          })}
        />

        <Stack.Screen
          name="DHIS2Setting"
          component={DHIS2Setting}
          options={({route}) => ({
            title: 'New DHIS2 Settings',
          })}
        />
        <Stack.Screen
          name="Metadata"
          component={Metadata}
          options={({route}) => ({
            title: 'DHIS2 Metadata Settings',
          })}
        />

        <Stack.Screen
          name="Mappings"
          component={Mappings}
          options={({route}) => ({
            title: 'DHIS2 Mappings',
          })}
        />

        <Stack.Screen
          name="ScanIdentityCard"
          component={ScanIdentityCard}
          options={({route}) => ({
            title: 'Scan Identity Card',
          })}
        />
        <Stack.Screen
          name="ScanBoardingPass"
          component={ScanBoardingPass}
          options={({route}) => ({
            title: 'Scan Boardingpass',
          })}
        />
        <Stack.Screen
          name="Security"
          component={Security}
          options={({route}) => ({
            title: 'DHIS2 Access and Security',
          })}
        />
      </Stack.Navigator>
      <Footer
        style={{height: 30, backgroundColor: '#ffd700', alignItems: 'center'}}>
        <Text>Designed by HISP Uganda</Text>
      </Footer>
    </NavigationContainer>
  );
};

export default () => (
  <Root>
    <MainStackNavigator />
  </Root>
);
