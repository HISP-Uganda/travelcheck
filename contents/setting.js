import React, { Component } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label, Picker, Text, Separator, View, ListItem, Left, Right, Button, Body, Switch, Fab, Icon, Footer, FooterTab } from 'native-base';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import Modal from 'react-native-modal';

const styles = StyleSheet.create({
              container: {
                flex: 1,
              },
            });
export default class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
          isModalVisible: false,
          icon: "eye-off",
          password: true
        };
      }

      DHIS2Schema = {
          name: 'DHIS2Setting',
          properties:
              {
                dhis2_url: 'string',
                username: 'string',
                password: 'string',
                active: {type: 'bool', default: false}
           }
         };

      toggleModal = () => {
          this.setState({isModalVisible: !this.state.isModalVisible});
        };
      //This program saves DHIS2 settinsg into Realm DB first, Reads settings and uses it to load data from DB for next Steps

      saveDHIS2 = async ()=>{

        let realm;

        try{
            realm = await Realm.open({schema: [this.DHIS2Schema]});

            realm.write(() => {
              const dhis2 = realm.create('DHIS2Setting', {
                scan_date: `${checkDate}`,
                scan_time: `${checkTime}`,
                full_name: `${name}`,
                vehicle: `${vehicle}`,
                phone_number: `${phone}`,
                point_of_entry: `${poe}`,
                poe_id: `${poe_id}`,
                tei:`${tei}`,
                checkpoint: `${checkPointName}`,
                latitude: `${checkPoint.latitude}`,
                longitude: `${checkPoint.longitude}`,
                submitted: false,
              });
            });
//            const scans = realm.objects('Scan');
//            console.log("TOTAL SCANS: "+ scans.length);
            realm.close();
        }catch(e){
            console.log(e.message);
        }

      }


      loadPrograms = (url, username, password) =>{
          this.setState({
              loading: true,
          })
          //TODO: Load from App settings the DHIS2 instance.
          const api_url = `${url}/api/programs.json?fields=id,name,programStages[id,name]`;
          const token = base64.encode(`${username}:${password}`);
          console.log(token);
          axios.get( api_url, {headers: {
                                   'Authorization': `Basic ${token}`
                                 }}).then(response => {
                  console.log('getting data from axios', response.data);
                  setTimeout(() => {
                      this.setState({
                          loading: false,
                          axiosData: response.data
                      })
                  }, 2000)
              })
              .catch(error => {
                  console.log(error);
          });
       }

      ProgramStageSchema = {
         name: 'ProgramStage',
         properties:
             {
               id: 'string',
               name: 'string',
               autosync: {type: 'bool', default: true}
          }
       };

       ProgramSchema = {
            name: 'Program',
            properties:
                {
                  id: 'string',
                  name: 'string',
                  programStages: 'ProgramStage[]',
                  autosync: {type: 'bool', default: true}
             }
          };

       DataSchema = {
             name: 'Data',
            properties:
                {
                  program: 'string',
                  programStage: 'string',

             }
       }


  render() {
    const { onChange } = this.props;
    return (
        <SafeAreaView style={styles.container}>
            <Content>
                <View style={{flex: 1}}>
                    <ProgressSteps>
                            <ProgressStep label="DHIS2" onNext={()=>null}>
                                <View>
                                    <Form>
                                        <Separator bordered>
                                           <Text>DHIS2 Settings</Text>
                                        </Separator>
                                         <Item stackedLabel>
                                           <Label>DHIS2 Instance URL</Label>
                                           <Input placeholder="https://your-dhis2.instance"  placeholderTextColor="#E0E1ED"/>
                                         </Item>
                                         <Item stackedLabel>
                                           <Label>Username</Label>
                                           <Input placeholder="DHIS2 Username"  placeholderTextColor="#E0E1ED" />
                                         </Item>
                                         <Item stackedLabel>
                                           <Label>Password</Label>
                                           <Input placeholder="DHIS2 Password"  secureTextEntry={true}  placeholderTextColor="#E0E1ED"/>
                                         </Item>
                                         <Item stackedLabel>
                                           <Label>Active DHIS2 Instance</Label>
                                           <Switch value={false} />
                                         </Item>
                                       </Form>
                                </View>
                            </ProgressStep>
                            <ProgressStep label="Data">
                                <View>
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
                            </ProgressStep>
                            <ProgressStep label="Checkpoints">
                                <View>
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
                            </ProgressStep>
                        </ProgressSteps>
                     </View>
            </Content>
            <Footer >
                <FooterTab style={{backgroundColor: 'yellow'}}>
                    <Button>
                        <Text>Security</Text>
                        <Icon name='ios-lock' />
                    </Button>
                    <Button active>
                       <Text>Checkpoint</Text>
                        <Icon name='ios-compass' />
                    </Button>
                    <Button>
                        <Text>About</Text>
                        <Icon name='ios-information-circle' />
                    </Button>
                </FooterTab>
            </Footer>
        </SafeAreaView>
    );
  }
}