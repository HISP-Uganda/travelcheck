import React, { Component } from 'react';
import {View, TouchableOpacity,Switch, Picker } from 'react-native';
import { Fab, Icon, Footer, FooterTab, Button, Text,Form,Label, Input, Item, ListItem, Body, Right ,Content} from 'native-base';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import {flatten, isEmpty} from 'lodash';
import styles from '../../styles/styles';
import moment from "moment";
import base64 from 'react-native-base64';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';

const SecuritySchema = {
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

const MappingSchema = {
    name: 'Mapping',
    properties:{
          organisation: 'string',
          program: 'string',
          date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
          current: {type: 'bool', default: true},
    }
}

const ProgramSchema = {
    name: 'Program',
    properties:{
          id: 'string',
          name: 'string',
          date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
          current: {type: 'bool', default: false},
    }
}


const OrganisationUnitSchema = {
    name: 'OrganisationUnit',
    properties:{
          id: 'string',
          name: 'string',
          date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
          current: {type: 'bool', default: true},
    }
}

class Metadata extends Component {
   constructor(props) {
       super(props)
       this.state = {
         active: false,
         orgUnits: {},
         programs: {},
         organisation: "",
         program: "",
         current: true
       }
   }

   getDHIS2 = async(api_endpoint, token )=>{
       const {data} = await axios.get( api_endpoint, {
           headers: {
            'Authorization': `Basic ${token}`
          }
       });

       return data;
   }

   processData = async () =>{
      let organisations;

      let realm = await Realm.open({schema: [SecuritySchema, OrganisationUnitSchema, ProgramSchema]});

      const dhis2 = realm.objects('Security').filtered('current == true');

      if(!isEmpty(dhis2)){
          console.log(dhis2);
          const user = dhis2[0].username;
          const pass = dhis2[0].password;
          const url = dhis2[0].url;

          const token = base64.encode(`${user}:${pass}`);
          const os = realm.objects('OrganisationUnit');

          const ouu = JSON.parse(JSON.stringify(os));
          console.log(Object.values(ouu));

          console.log("OU UP");


         if(isEmpty(os)){
             console.log("FOUND NO ORGANISATION UNIT LOCALLY");
             const endpoint = `${url}/api/me.json?fields=organisationUnits[id,name],programs`;
             console.log(endpoint);
             const response = await this.getDHIS2(endpoint,token);
             const orgUnits = response.organisationUnits;
             console.log("orgUNITS FOUND REMOTELY: "+orgUnits);
             realm.write(() => {
                 orgUnits.forEach((orgUnit)=>{
                     realm.create('OrganisationUnit', {
                       id: `${orgUnit.id}`,
                       name: `${orgUnit.name}`
                     });
                 });
             });
             const organisations = realm.objects('OrganisationUnit');
             const ouu = JSON.parse(JSON.stringify(organisations));
             this.setState({orgUnits: ouu});
             //PROGRAMS
             const pgs = response.programs;
             let localPrograms = realm.objects('Program');
             const lp = JSON.parse(JSON.stringify(localPrograms));
             if(!isEmpty(localPrograms)){
                this.setState({programs: lp});
             }else{
                 const p_endpoint = `${url}/api/programs.json?paging=false&fields=id,name&filter=id:in:[${pgs.join(",")}]`;
                 const p_response = await this.getDHIS2(p_endpoint,token);
                 const userPrograms = p_response.programs;

                 realm.write(() => {
                   userPrograms.forEach((program) => {
                        let p = realm.create('Program', {
                          id: `${program.id}`,
                          name: `${program.name}`
                        });
                     });
                  });

                 let localPrograms = realm.objects('Program');
                 const lp = JSON.parse(JSON.stringify(localPrograms));
                 this.setState({programs: lp});
             }
         }else{
             this.setState({orgUnits: ouu});

             let localPrograms = realm.objects('Program');
             if(!isEmpty(localPrograms)){
                 const lp = JSON.parse(JSON.stringify(localPrograms));
                 this.setState({programs: lp});
              }else{
                  const p_endpoint = `${url}/api/programs.json?paging=false&fields=id,name&filter=id:in:[${pgs.join(",")}]`;
                  const p_response = await this.getDHIS2(p_endpoint,token);
                  const userPrograms = p_response.programs;

                  realm.write(() => {
                    userPrograms.forEach((program) => {
                         realm.create('Program', program);
                      });
                   });

                  let localPrograms = realm.objects('Program');
                  const lp = JSON.parse(JSON.stringify(localPrograms));
                  this.setState({programs: lp});
              }
         }
       }

       realm.close();
   }

   getMappings = async()=>{
         let realm = await Realm.open({schema: [MappingSchema]});
         const mapping = realm.objects('Mapping').filtered('current == true');

//          if(!isEmpty(mapping)){
//
//          }else{
//
//          }
   }

  componentDidMount = async ()=>{
     await this.processData();
  }

  saveMapping = async () =>{
      const {navigation} = this.props;

      const organisation = this.state.organisation;
      const program = this.state.program;
      const current = true;

      let realmck;
      let mappings = {};
      try{
          realmck = await Realm.open({schema: [MappingSchema]});

          const current_mapping = realmck.objects('Mapping').filtered('current == true');

          if(current_mapping.length > 0){
          realmck.write (
                  () => {
                      current_mapping[0].current = false
                  }
              )
          }
          realmck.write(() => {
           const newMapping = realmck.create('Mapping', {
              organisation: `${organisation}`,
              program: `${program}`,
              current: current
            });
          });
          realmck.close();
    //              (newMapping) ? navigation.goBack(): null;
//       console.log(newMapping);
      }catch(e){
          console.log(e.message);
      }
    }

    toggleSwitch = (value) => {
        this.setState({current: value})
  }

  render() {
    const { navigation } = this.props;

    const ou = this.state.orgUnits;
    const pg = this.state.programs;

    console.log(this.state.organisation);

    return (
         <Content>
            <View style={{flex: 1, padding: 20}}>
                <Text style={styles.textTitle}>Configure DHIS2 Mapping</Text>

                {

                    (!isEmpty(ou))?  <Form>
                          <Item stackedLabel >
                           <Label>DHIS2 Organisation Units</Label>
                           <Picker
                               selectedValue={this.state.organisation}
                               style={{height: 50, width: '100%'}}
                               onValueChange={
                                   (itemValue, itemIndex) => {
                                       console.log(itemValue);
                                       this.setState({organisation: itemValue});
                                   }}
                                >
                                    <Picker.Item key={2} label={'--Select Orgnisation Unit--'} value={''}/>
                               {Object.values(ou).map((val) => {
                                   return <Picker.Item key={val.id} label={val.name} value={val.id}/>
                               })}
                           </Picker>
                          </Item>
                          <Item stackedLabel>
                             <Label>Program</Label>
                             <Picker
                                 selectedValue={this.state.program}
                                 style={{height: 50, width: '100%'}}
                                 onValueChange={
                                     (itemValue, itemIndex) => {
                                         this.setState({program: itemValue});
                                     }}
                                  >
                                  <Picker.Item key={1} label={'--Select Program --'} value={''}/>
                                 {Object.values(pg).map((program) => {
                                     return <Picker.Item key={program.id} label={program.name} value={program.id}/>
                                 })}
                             </Picker>
                          </Item>
                          <ListItem noindent>
                            <Body  >
                              <Text style={{marginLeft: 0}}>Current Mapping</Text>
                            </Body>
                            <Right>
                                  <Switch
                                        onValueChange = {this.toggleSwitch}
                                        value = {this.state.current}/>
                            </Right>
                          </ListItem>
                          <View style={{alignItems: 'center'}}>
                              <TouchableOpacity onPress={this.saveMapping} style={styles.buttonTouchable}>
                                   <Text style={styles.buttonTextStyle}>Save Mapping</Text>
                              </TouchableOpacity>
                          </View>
                    </Form>: <Text>NO RECORDS FOUND. CHECK DHIS2 Settings</Text>

                }
            </View>

         </Content>
    );
  }
}

export default Metadata;