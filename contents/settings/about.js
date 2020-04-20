import React, { Component } from 'react';
import { Container, Content, Text , SafeAreaView, View,Card,CardItem, Left, Body, Button, Icon, Title} from 'native-base';

export default class About extends Component {
    render() {
        const { onChange } = this.props;
        return (
            <Content>
                <Title>COVID-19 TravelCheck App</Title>
                <Card style={{flex: 0, padding: 20}}>
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
                            This app is developed in response to COVID-19 Pandemic. As countries implements total lockdowns, Cargo drivers are allowed to enter in and out of the country. Each crew member has to be tracked and at anypoint, MOH has to know the position they were last seen.
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