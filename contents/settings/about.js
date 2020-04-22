import React, { Component } from 'react';
import { Container, Content, Text , SafeAreaView, View,Card,CardItem, Left, Body, Button, Icon, Title} from 'native-base';

export default class About extends Component {
    render() {
        const { onChange } = this.props;
        return (
            <Content>
                <Card style={{flex: 0, height: '100%'}}>
                    <CardItem>
                      <Left>
                        <Body>
                          <Title style={{color: 'red'}}>COVID-19 TravelCheck App</Title>
                          <Text note>Version 1.0.0</Text>
                        </Body>
                      </Left>
                    </CardItem>
                    <CardItem>
                      <Text>
                            This app is developed in response to COVID-19 Pandemic. As countries implement total lockdowns, Cargo drivers are allowed to enter in and out of the country. Each crew member must be tracked during the travel time as they await Test results for COVID-19, MOH Siurveilance team will the know where they were last seen.
                        </Text>
                    </CardItem>
                    <CardItem>
                        <Text style={{color: 'red'}}>Developed by HISP Uganda</Text>
                    </CardItem>
                  </Card>
             </Content>
             )
         }
}