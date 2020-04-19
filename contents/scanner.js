import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  TouchableOpacity,
  Linking
} from 'react-native';

import { Container, Header, Content, Accordion, Card, CardItem, Text } from "native-base";

import QRCodeScanner from 'react-native-qrcode-scanner';
import BarcodeMask from 'react-native-barcode-mask';

const dataArray = [
  { title: "First Element", content: "Lorem ipsum dolor sit amet" },
  { title: "Second Element", content: "Lorem ipsum dolor sit amet" },
  { title: "Third Element", content: "Lorem ipsum dolor sit amet" }
];
export default class QRScan extends Component {
onSuccess = e => {
    Linking.openURL(e.data).catch(err =>
      console.error('An error occured', err)
    );
  };
  render() {
    const styles = StyleSheet.create({
        centerText: {
          flex: 1,
          fontSize: 18,
          padding: 32,
          color: '#777'
        },
        textBold: {
          fontWeight: '500',
          color: '#000'
        },
        buttonText: {
          fontSize: 21,
          color: 'rgb(0,122,255)'
        },
        buttonTouchable: {
          padding: 16
        }
      }
    );

    return (
      <Container style={{alignItems: 'center', display: 'flex'}}>
        <Content style={{padding: 20}}>
            <QRCodeScanner
              reactivate={true}
              reactivateTimeout={3000}
              ref={(node) => { this.scanner = node }}
              fadeIn={false}
              containerStyle={{alignItems: 'center', padding: 10, marginBottom: 40, backgrounColor: 'yellow'}}
              cameraProps={{ ratio:'1:1' }}
              onRead={this.onSuccess}
              showMarker={true}
              customMarker={
                <BarcodeMask
                    edgeColor={'#009FDA'}
                    animatedLineColor={'#009FDA'}
                    lineAnimationDuration={2000}
                />
              }
              bottomContent={
                  <View>
                      <TouchableOpacity style={styles.buttonTouchable} onPress={() => this.scanner.reactivate()}>
                          <Text style={styles.buttonTextStyle}>OK. Got it!</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.buttonTouchable} onPress={() => this.setState({ scan: false })}>
                          <Text style={styles.buttonTextStyle}>Stop Scan</Text>
                      </TouchableOpacity>
                  </View>
              }
            />
        </Content>
      </Container>
    );
  }
}