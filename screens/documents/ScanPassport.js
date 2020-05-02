import React, { Component } from 'react';
import {View, TouchableOpacity } from 'react-native';
import { Fab, Icon, Footer, FooterTab, Button, Text } from 'native-base';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import styles from '../../styles/styles';
import {RNCamera} from 'react-native-camera';

const Tab = createMaterialBottomTabNavigator();

class ScanPassport extends Component {
   constructor(props) {
       super(props)
       this.state = {
         active: false
       };
   }

   scanPassport = async () => {
       try {
         const data = await this.camera.takePictureAsync();
         console.log('Path to image: ' + data.uri);
       } catch (err) {
          console.log('err: ', err);
       }
     };

  render() {
    const { navigation, route } = this.props;
    return (
      <View style={styles.container}>
          <RNCamera
            ref={cam => {
              this.camera = cam;
            }}
            style={styles.preview}
          >
            <View style={styles.captureContainer}>
              <TouchableOpacity style={styles.capture} onPress={this.scanPassport}>
                <Icon name='camera'>camera</Icon>
                <Text>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </RNCamera>

          <View style={styles.space} />
        </View>
    );
  }
}

export default ScanPassport;