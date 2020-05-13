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
          organisationUnits: 'OrganisationUnit[]',
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

   processMetadata = async()=>{
       let programs;

       let realm = await Realm.open({schema: [SecuritySchema, OrganisationUnitSchema, ProgramSchema]});
       const dhis2 = realm.objects('Security').filtered('current == true');

       if(!isEmpty(dhis2)){
            const user = dhis2[0].username;
            const pass = dhis2[0].password;
            const url = dhis2[0].url;
            const token = base64.encode(`${user}:${pass}`);
            console.log(token);

            const pgs = realm.objects('Program');

            if(isEmpty(pgs)){
                //Create programs in Android
                console.log("NO PROGRAMS");
                const program_endpoint = `${url}/api/programs.json?fields=id,name,organisationUnits[id,name]&paging=false`;
                console.log("Tryingto access "+program_endpoint);
                const response = await this.getDHIS2(program_endpoint,token);
                console.log(response);
                const dhis2_programs = response.programs;
                console.log("creating new programs")

                realm.write(() => {
                     dhis2_programs.forEach((program)=>{
                         const prog_orgunits =  program.organisationUnits;
                         let pg = realm.create('Program', {
                           id: `${program.id}`,
                           name: `${program.name}`,
                           organisationUnits: []
                         });
                         //Process all related orgUnits for the program
                         prog_orgunits.map((orgUnit) =>{
                            pg.organisationUnits.push({name: orgUnit.name, id: orgUnit.id});
                         });
                     });
                 });

                 //get and set State on programs now.
                 const local_programs = realm.objects('Program');
                 const pp = JSON.parse(JSON.stringify(local_programs));
                 this.setState({programs: pp});
                 console.log(pp);
                 programs = pp;
            }else{
                //JSON Parse and set state
                console.log("PROGRAMS FOUND");
                const pp = await JSON.parse(JSON.stringify(pgs));
                this.setState({programs: pp});
                programs = pp;
            }

       }else{
            this.setState({programs: false}); //No current DHIS2 settings. Requires adding
       }
       realm.close();

       return programs;
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
     await this.processMetadata();
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
    const {programs, program} = this.state;
//    const ou = this.state.orgUnits;
//    const pg = this.state.programs;
    console.log("ORGUNIT FOR SELECTED PROGRAM");
    console.log(JSON.parse(JSON.stringify(programs)));

//    this.setState({orgUnits: selectedOrgUnits});
    let orgUnits = {};
     if(!isEmpty(programs)){
         const myPrograms = Object.values(programs);
         myPrograms.forEach((prog)=>{
            if(this.state.program === prog.id){
               orgUnits = prog.organisationUnits;
            }
         })
     }

    return (
         <Content>
            <View style={{flex: 1, padding: 20}}>
                <Text style={styles.textTitle}>Configure DHIS2 Mapping</Text>

                {

                    (programs !== false) ?  <Form>
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
                                   {Object.values(programs).map((program) => {
                                       return <Picker.Item key={program.id} label={program.name} value={program.id}/>
                                   })}
                               </Picker>
                            </Item>
                            {
                                (!isEmpty(orgUnits))?  <Item stackedLabel>
                                     <Label>Organisation Unit</Label>
                                     <Picker
                                         selectedValue={this.state.organisation}
                                         style={{height: 50, width: '100%'}}
                                         onValueChange={
                                             (itemValue, itemIndex) => {
                                                 this.setState({organisation: itemValue});
                                             }}
                                          >
                                          <Picker.Item key={1} label={'--Select Organisation Unit --'} value={''}/>
                                         {
                                          Object.values(orgUnits).map((ou) => {
                                             return <Picker.Item key={ou.id} label={ou.name} value={ou.id}/>
                                         })

                                        }
                                     </Picker>
                                  </Item> : <Text>SELECT PROGRAM PROCEED</Text>
                            }


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