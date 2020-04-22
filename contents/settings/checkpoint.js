import React, { Component, useState} from 'react';
import { Container, Content, Text, View, Form, Separator, Label, Input, Item, Button, ListItem, Body, Right} from 'native-base';
import {TouchableOpacity, Switch} from 'react-native';
import styles from '../../styles/styles'
 import Realm from 'realm';
 import moment from "moment";

export default class NewPoint extends Component {
    constructor(props) {
             super(props);
             this.state = {
                 checkpoint: "",
                 currentCheckpoint: true
             };
         }

       CheckpointSchema = {
         name: 'Checkpoint',
         properties:
             {
               name: 'string',
               date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
               current: {type: 'bool', default: true}
          }
        };

      saveCheckpoint = async () =>{
        const checkpoint = this.state.checkpoint;
        const current = this.state.currentCheckpoint;
        const created = moment().format('YYYY-MM-DD');

        console.log("Checkpoint Submitted: "+ current);

        //Save in Local DB

        let realmck;
        try{
            realmck = await Realm.open({schema: [this.CheckpointSchema]});

            const current_checkpoint = realmck.objects('Checkpoint').filtered('current == true');
            console.log("TOTAL CURRENT: "+current_checkpoint.length);

            if(current_checkpoint.length > 0){
            realmck.write (
                    () => {
                        current_checkpoint[0].current = false
                    }
                )
            }
            //Disable current checkpoint first
            //ADD
            realmck.write(() => {
              const newScan = realmck.create('Checkpoint', {
                name: `${checkpoint}`,
                date_created: `${created}`,
                current: current
              });
            });
            realmck.close();
        }catch(e){
            console.log(e.message);
        }


      };

      toggleSwitch = (value) => {
            this.setState({currentCheckpoint: value})
      }
    render() {
        return (
            <Content>
                <View style={{flex: 1}}>
                    <Text style={styles.textTitle}>Add new Checkpoint here</Text>
                    <Form>

                         <Item stackedLabel>
                            <Label>Checkpoint Name</Label>
                            <Input placeholder="Checkpoint Name"  placeholderTextColor="#E0E1ED" onChangeText={(text) => {this.setState({checkpoint: text}); }} value={this.state.text}/>
                          </Item>

                          <ListItem noindent>
                              <Body  >
                                <Text style={{marginLeft: 0}}>Current Checkpoint</Text>
                              </Body>
                              <Right>
                                    <Switch
                                          onValueChange = {this.toggleSwitch}
                                          value = {this.state.currentCheckpoint}/>
                              </Right>
                            </ListItem>
                    </Form>
                </View>
                <View style={{alignItems: 'center'}}>
                    <TouchableOpacity onPress={this.saveCheckpoint} style={styles.buttonTouchable}>
                         <Text style={styles.buttonTextStyle}>Save Checkpoint</Text>
                    </TouchableOpacity>
                </View>
             </Content>
        );
    }
}