import React, { Component } from 'react';
import { Container, Content, Text, View, Form, Separator, Label, Input, Item} from 'native-base';

export default class Checkpoints extends Component {
    render() {
        return (
            <Content>
                <View style={{flex: 1}}>
                    <Form>
                         <Separator bordered>
                            <Text>Checkpoint Settings</Text>
                         </Separator>

                         <Item stackedLabel>
                            <Label>Checkpoint Name</Label>
                            <Input placeholder="Checkpoint Name"  placeholderTextColor="#E0E1ED" />
                          </Item>
                       </Form>
                </View>
             </Content>
        );
    }
}