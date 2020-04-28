import React, { Component } from 'react';
import {View, TouchableOpacity,StyleSheet } from 'react-native';
import { Fab, Icon, Footer, FooterTab, Button, Text } from 'native-base';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import styles from '../styles/styles';

import GetLocation from 'react-native-get-location';
import MapboxGL from "@react-native-mapbox-gl/maps";

MapboxGL.setAccessToken("pk.eyJ1Ijoic3RlcGhvY2F5IiwiYSI6ImNpdGltcjhwZTAwMXQ0MnBkcGQ4NW9kZXQifQ.EYXiKJYgCVr3tGihsRhmjg");

class Routes extends Component {
   constructor(props) {
       super(props)
       this.state = {
         active: false,
         location: {},
       };
   }

   componentDidMount= async () => {
       MapboxGL.setTelemetryEnabled(true);
//       MapboxGL.setConnected(true);
        let checkPoint = {};
         try{
              checkPoint = await GetLocation.getCurrentPosition({
                   enableHighAccuracy: true,
                   timeout: 15000,
             });
         }catch(e){
             console.log(e.message);
         }
         this.setState({location: checkPoint});
//         console.log(checkPoint);
     }

  render() {

    const styles = StyleSheet.create({
      page: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5FCFF"
      },
      container: {
        height: '100%',
        width: '100%',
        backgroundColor: "tomato"
      },
      map: {
        flex: 1
      }
    });
    const { navigation } = this.props;
    console.log(this.state.location)

    return (
      <View style={styles.page}>
      <View style={styles.container}>
        <MapboxGL.MapView
            style={styles.map}
            showUserLocation={true}
            logoEnabled={false}
            zoomLevel={6}
            attributionEnabled={false}
            compassEnabled={true}
            surfaceView={true}

        >
            <MapboxGL.Camera
                zoomLevel={5.5}
                centerCoordinate={[this.state.location.latitude,this.state.location.longitude]}
                followUserMode={"normal"}
                followUserLocation={true}
            />
            <MapboxGL.UserLocation />
        </MapboxGL.MapView>
      </View>
    </View>
    );
  }
}

export default Routes;