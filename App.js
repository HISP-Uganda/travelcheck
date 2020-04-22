import React, { Component } from 'react';
import { Container, Header, Title, Content, Footer, Badge, FooterTab, Button, Left, Right, Body, Tabs, Tab, TabHeading, Icon} from 'native-base';

import {Text} from 'react-native';

import Scan from './contents/qrscan';
import Scans from './contents/scans';
import Options from './contents/options';
//import Icon from 'react-native-ionicons'

export default class App extends Component {
  render() {
    return (
      <Container with='100%'>
        <Header>
          <Left>
            <Button transparent>
              <Icon name="hand" size={36} style={{color: '#E3E9FE'}}/>
            </Button>
          </Left>
          <Body>
            <Title>TravelCheck</Title>
          </Body>
          <Right />
        </Header>
        <Tabs >
            <Tab heading={
                <TabHeading style={{backgroundColor: '#D4E6F1'}} >
                    <Icon name="qr-scanner" style={{color: '#212F3C', fontSize: 18}}/>
                    <Text style={{marginLeft: 5, textTransform: 'uppercase'}}>Scan pass</Text>
                </TabHeading>}  >
                <Scan />
            </Tab>
            <Tab heading={
                <TabHeading style={{backgroundColor: '#D4E6F1'}}>
                    <Icon name="book"  style={{color: '#212F3C',fontSize: 18}} />
                    <Text style={{marginLeft: 5, textTransform: 'uppercase'}}>All scans </Text>
                </TabHeading>} >
                <Scans />
            </Tab>
            <Tab heading={
                <TabHeading style={{backgroundColor: '#D4E6F1'}}>
                    <Icon name="settings" style={{color: '#212F3C', fontSize: 18}}/>
                    <Text style={{ marginLeft: 5, textTransform: 'uppercase'}}>Settings</Text></TabHeading>} >
                <Options />
            </Tab>
        </Tabs>
        <Footer style={{height: 30,padding: 2, color: '#FFFFFF', backgroundColor: '#EBF5FB'}}>
                  <Text style={{color: '#154360'}}>Designed by HISP Uganda</Text>
        </Footer>
      </Container>
    );
  }
}