import React, { Component } from 'react';
import { Container, Content, Text , SafeAreaView, View,Card,CardItem} from 'native-base';

export default class About extends Component {
    render() {
        const { onChange } = this.props;
        return (
            <Content>
                <View style={{flex: 1}}>
                    <Card>
                        <CardItem>
                            <Text>
                                //Your text here
                                About the APP
                            </Text>
                        </CardItem>
                    </Card>
                </View>
             </Content>
             )
         }
}