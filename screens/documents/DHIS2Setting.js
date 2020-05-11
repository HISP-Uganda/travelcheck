import React, { Component } from 'react';
import {TouchableOpacity, Switch, TextInput } from 'react-native';
import { Container, Content, Text, View, Form, Separator, Label, Input, Item, Button, ListItem, Body, Right, InputGroup, Icon} from 'native-base';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import styles from '../../styles/styles';
import moment from "moment";


class DHIS2Setting extends Component {
   constructor(props) {
       super(props)
       this.state = {
         active: false,
         name: "",
         description: "",
         current: true
       };
   }

    SecuritySchema = {
            name: 'Security',
            properties:
                {
                  instance: 'string',
                  description: 'string',
                  url: 'string',
                  username: 'string',
                  password: 'string',
                  date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
                  current: {type: 'bool', default: true},
             }
           };

    saveSecurity = async () =>{
           const {navigation} = this.props;

           const instance = this.state.instance;
           const description = this.state.description;
           const url = this.state.url;
           const current = this.state.current;
           const username = this.state.username;
           const password = this.state.password;
           const created = moment().format('YYYY-MM-DD');

           let realmsec;
           let newSetting = {};
           try{
               realmsec = await Realm.open({schema: [this.SecuritySchema]});

               const current_instance = realmsec.objects('Security').filtered('current == true');

               if(current_instance.length > 0){
               realmsec.write (
                       () => {
                           current_instance[0].current = false
                       }
                   )
               }
               realmsec.write(() => {
                 newSetting = realmsec.create('Security', {
                   instance: `${instance}`,
                   description: `${description}`,
                   url: `${url}`,
                   username: `${username}`,
                   password: `${password}`,
                   date_created: `${created}`,
                   current: current
                 });
               });
               realmsec.close();
               (newSetting) ? navigation.goBack(): null;
           }catch(e){
               console.log(e.message);
           }
         };

  render() {
    const { navigation, route } = this.props;
    return <Content>
           <View style={{flex: 1}}>
               <Text style={styles.textTitle}>Add new Scan point here</Text>
               <Form>
                   <Item stackedLabel>
                       <Label>DHIS2 Instance Name</Label>
                       <Input placeholder="Instance Name"  placeholderTextColor="#E0E1ED" onChangeText={(text) => {this.setState({instance: text}); }} value={this.state.instance}/>
                     </Item>
                     <Item stackedLabel>
                       <Label>DHIS2 Description</Label>
                       <Input placeholder="Description"  numberOfLines={2} multiline={true} placeholderTextColor="#E0E1ED" onChangeText={(text) => {this.setState({description: text}); }} value={this.state.description}/>
                     </Item>
                     <Item stackedLabel>
                       <Label>DHIS2 Base URL</Label>
                       <Input placeholder="https://instance.dhis2.org"  placeholderTextColor="#E0E1ED" onChangeText={(text) => {this.setState({url: text}); }} value={this.state.url}/>
                     </Item>
                     <Item stackedLabel>
                        <Label>Username</Label>
                        <InputGroup>
                           <Icon name='unlock' />
                        <Input placeholder="Username"  placeholderTextColor="#E0E1ED" onChangeText={(text) => {this.setState({username: text}); }} value={this.state.username}/>
                        </InputGroup>
                      </Item>
                      <Item stackedLabel>
                         <Label>Password</Label>
                        <InputGroup>
                           <Icon name='unlock' />
                           <Input placeholder="Password"  secureTextEntry={true} placeholderTextColor="#E0E1ED" onChangeText={(text) => {this.setState({password: text}); }} value={this.state.password}/>
                       </InputGroup>
                       </Item>
                     <ListItem noindent>
                         <Body  >
                           <Text style={{marginLeft: 0}}>Current Checkpoint</Text>
                         </Body>
                         <Right>
                               <Switch
                                     onValueChange = {this.toggleSwitch}
                                     value = {this.state.current}/>
                         </Right>
                       </ListItem>
               </Form>
           </View>
           <View style={{alignItems: 'center'}}>
               <TouchableOpacity onPress={this.saveSecurity} style={styles.buttonTouchable}>
                    <Text style={styles.buttonTextStyle}>Save Settings</Text>
               </TouchableOpacity>
           </View>
        </Content>
  }
}

export default DHIS2Setting;