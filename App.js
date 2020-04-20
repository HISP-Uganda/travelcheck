import React, { Component } from 'react';
import { Container, Header, Title, Content, Footer, Badge, FooterTab, Button, Left, Right, Body, Text, Tabs, Tab, TabHeading, Icon} from 'native-base';

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
        <Tabs>
            <Tab heading={ <TabHeading><Icon name="camera" size={20} style={{color: '#E3E9FE'}}/><Text>Scan pass</Text></TabHeading>} >
                <Scan />
            </Tab>
            <Tab heading={ <TabHeading><Icon name="list" size={24} style={{color: '#E3E9FE'}} />
                <Text>All scans </Text>
                </TabHeading>} >
                <Scans />
            </Tab>
            <Tab heading={ <TabHeading><Icon name="settings" size={20} style={{color: '#E3E9FE'}}/><Text>Options</Text></TabHeading>} >
                <Options />
            </Tab>
        </Tabs>
      </Container>
    );
  }
}