import React, { Component } from 'react';
import { View, Text,TouchableOpacity } from 'react-native';
import { Card, CardItem, Body,Left, Right, List, ListItem, Thumbnail, Button, Icon } from 'native-base';
import styles from '../styles/styles';
import NetInfo from "@react-native-community/netinfo";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import moment from 'moment';
import Realm from 'realm';
import base64 from 'react-native-base64';
import axios from 'axios';

const ScanSchema = {
   name: 'Scan',
   properties:
   {
     uuid: 'string',
     scan_date: {type: 'date', default: moment().format('YYYY-MM-DD')},
     scan_time: 'string',
     full_name: 'string',
     vehicle: 'string',
     phone_number: 'string',
     point_of_entry: 'string',
     org_unit: 'string',
     poe_id: 'string',
     dhis_url: 'string',
     program: 'string',
     program_stage: 'string',
     tei:'string',
     checkpoint: 'string',
     latitude: 'string',
     longitude: 'string',
     sex: {type: 'string',optional: true},
     nationality: {type: 'string',optional: true},
     dob: {type: 'date',optional: true},
     nin_passport: {type: 'string',optional: true},
     form_id: {type: 'string',optional: true},
     departure: {type: 'string',optional: true},
     destination: {type: 'string',optional: true},
     address:{type: 'string',optional: true},
     duration: {type: 'string',optional: true},
     nok_name: {type: 'string',optional: true},
     nok_contact: {type: 'string',optional: true},
     temperature: {type: 'string',optional: true},
     cleared: {type: 'bool', default: false},
     specimen_collected: {type: 'bool', default: false},
     specimen_type: {type: 'string',optional: true},
     isolated: {type: 'bool', default: false},
     investigation: {type: 'bool', default: false},
     quarantined: {type: 'bool', default: false},
     screener_name: {type: 'string', optional: true},
     submitted: {type: 'bool', default: false}
   }
};


class ScanDetails extends Component {
     constructor(props) {
             super(props);
             this.camera = null;
             this.barcodeCodes = [];
             this.state = {
                 connection_Status : null,
                 recorded: false,
                 offline_mode: true
             };
        }

    componentDidMount = async() => {
//        this.setState({recorded: false});
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            NetInfo.addEventListener(state => {
                 const connected = state.isConnected;
                 const offline_mode = (connected)?false:true;
                 this.setState({connection_Status: connected, offline_mode: offline_mode});
            });
        });
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    getDHIS2 = async(api_endpoint)=>{
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

           let realmsec;
           let username;
           let password;
           let url;
           try{
               realmsec = await Realm.open({schema: [SecuritySchema]});

               const current_instance = realmsec.objects('Security').filtered('current == true');

               if(current_instance.length > 0){
                   username = current_instance[0].username;
                   password = current_instance[0].password;
                   url = current_instance[0].url;
               }
               realmsec.close();
           }catch(e){
               console.log(e.message);
           }
           let api_url = `${url}/${api_endpoint}`;
            const token = base64.encode(`${username}:${password}`);

            const {data} = await axios.get( api_url, {
                headers: {
                 'Authorization': `Basic ${token}`
               }
            });
            return data;
       }

    postDHIS2 = async (payload, type) =>{
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

            let realmsec;
            let username;
            let password;
            let url;
            try{
                realmsec = await Realm.open({schema: [SecuritySchema]});

                const current_instance = realmsec.objects('Security').filtered('current == true');

                if(current_instance.length > 0){
                    username = current_instance[0].username;
                    password = current_instance[0].password;
                    url = current_instance[0].url;
                }
                realmsec.close();
            }catch(e){
                console.log(e.message);
            }
            let api_url;

            switch(type){
                case 'events':
                api_url = `${url}/api/events`;
                break;
                case 'tei':
                api_url = `${url}/api/trackedEntityInstances`;
                break;
                case 'enrollment':
                api_url = `${url}/api/enrollments`;
                break;
                default:
                api_url = `${url}/programs`;
                break;
            }

    //        const username = "Socaya";
    //        const password = "Dhis@2020";
            const token = base64.encode(`${username}:${password}`);
            const {data} = await axios.post( api_url, payload,  {
                headers: {
                 'Authorization': `Basic ${token}`
               }
            });

            return data;
        }

    resendTravelPass = async (filter) =>{
        const {offline_mode} = this.state;
        //Retrieve local record
        console.log("RECEIVED FILTER: "+filter);
        if(!offline_mode){
            console.log("Retrieving remote POE ID");
            const generated = await this.getDHIS2("api/trackedEntityAttributes/CLzIR1Ye97b/generate");
            const poe_id = generated.value;
            console.log("POE ID Recieved: "+poe_id);

            const realmU = await Realm.open({schema: [ScanSchema]});
            let scanned = await realmU.objects("Scan").filtered("poe_id==$0", filter);

            const convertBoolean2YesNo = (variable) => {
                return (variable === true)? "Yes": "No";
            }
            //Realm DB UPDATES. TODO: complete task below
            console.log(scanned);
            if(scanned.length > 0){
                const isolated = convertBoolean2YesNo(scanned[0].in_isolation);
                const investigated = convertBoolean2YesNo(scanned[0].further_investigation);
                const collected = convertBoolean2YesNo(scanned[0].specimen_collected);
                const cleared = convertBoolean2YesNo(scanned[0].cleared_to_travel);
                const quarantined_travellor = convertBoolean2YesNo(scanned[0].quarantined);

                const temperature_measured = (scanned[0].temperature > 0)? "Yes": "No";

                const tei_payload = {
                    "trackedEntityType": "KWN8FUfvO5G", //TODO. ADd as part of DHIS2 Metadata configuration and mapping
                    "orgUnit": `${scanned[0].org_unit}`,
                    "attributes":[
                         {
                             "attribute": "CLzIR1Ye97b", //POE_ID
                             "value": `${poe_id}`
                         },
                         {
                             "attribute": "PVXhTjVdB92", //Form ID
                             "value": `${scanned[0].form_id}`
                         },
                         {
                             "attribute": "sB1IHYu2xQT", //FullNames
                             "value": `${scanned[0].full_name}`
                         },
                         {
                             "attribute": "h6aZFN4DLcR", //Vehicle Reg. Num
                             "value": `${scanned[0].vehicle}`
                         },
                         {
                             "attribute": "E7u9XdW24SP", //Case Phone Contact
                             "value": `${scanned[0].phone_number}`
                         },
                         {
                             "attribute": "fik9qo8iHeo", // Names of Next of Kin
                             "value": `${scanned[0].nok_name}`
                         },{
                             "attribute": "j6sEr8EcULP", // Next of Kin contact
                             "value": `${scanned[0].nok_contact}`
                         },
                         {
                             "attribute": "UJiu0P8GvHt", //Date of arrival
                             "value": `${moment(scanned[0].scan_date).format("YYYY-MM-DDTHH:mm:ss")}`
                         },
                         {
                             "attribute": "cW0UPEANS5t", //country of departure
                             "value": `${scanned[0].departure}`
                         },
                         {
                             "attribute": "pxcXhmjJeMv", //country of Transit
                             "value": `${scanned[0].destination}`
                         },
                         {
                             "attribute": "ooK7aSiAaGq", //Address while in Uganda
                             "value": `${scanned[0].address}` //TODO: Add Address Field
                         },
                         {
                             "attribute": "eH7YTWgoHgo", //planned duration
                             "value": `${scanned[0].duration}`
                         },
                         {
                             "attribute": "QUrkIanwcHD", //Temperature Taken
                             "value": `${temperature_measured}`
                         },
                         {
                             "attribute": "NuRldDwq0AJ", //Specimen Taken
                             "value": `${collected}`
                         },
                         {
                             "attribute": "SI7jnNQpEQM", //Specimen Type
                             "value": `${scanned[0].specimen_type}`
                         },
                         {
                             "attribute": "QhDKRe2QDA7", //Temperature
                             "value": `${scanned[0].temperature}`
                         },
                         {
                             "attribute": "Ep6evsVocKY", //Isolated
                             "value": `${isolated}`
                         },
                         {
                             "attribute": "EZwIFcKvSes", //Referred for further investigation
                             "value": `${investigated}`
                         },
                         {
                             "attribute": "oVFYcqtwPY9", //quarantined
                             "value": `${quarantined_travellor}`
                         },
                         {
                             "attribute": "EWWNozu6TVd", //Cleared to travel
                             "value": `${cleared}`
                         },
                         {
                             "attribute": "oUqWGeHjj5C", //NIN/Passport
                             "value": `${scanned[0].nin_passport}`
                         },
                         {
                             "attribute": "XvETY1aTxuB", //Nationality
                             "value": `${scanned[0].nationality}` //TODO: Add Nationality ion QR
                         },
                         {
                             "attribute": "g4LJbkM0R24", //Age (years(
                             "value": `${scanned[0].dob}` //TODO: Add Age *Years ion QR
                         },{
                             "attribute": "TU0Jteb9H7F", //COVID Screeners names
                             "value": `${scanned[0].screener_name}` //TODO: Add Age *Years ion QR
                         },
                         {
                             "attribute": "FZzQbW8AWVd", //Sex
                             "value": `${scanned[0].sex}` //TODO: Add Age *Years ion QR
                         },
                         ,
                          {
                               "attribute": "jXf9YETPNaJ", //OLD POE ID
                               "value": `${scanned[0].poe_id}`
                          }
                    ],
                    "enrollments": [
                        {
                             "orgUnit": `${scanned[0].org_unit}`,
                             "program": `${scanned[0].program}`,
                             "enrollmentDate": `${moment(scanned[0].scan_date).format("YYYY-MM-DD")}`,
                             "incidentDate": `${moment(scanned[0].scan_date).format("YYYY-MM-DD")}`
                        }
                    ]
                }
                console.log("PAYLOAD BEFORE CALL")
                console.log(tei_payload);

                realmU.close();

                const response = await this.postDHIS2(tei_payload, 'tei');
                const httpStatusCode = response.httpStatusCode; //200
                const httpStatus = response.status; //OK
                const importStatus = response.response.status; //SUCCESS === true

                const recordSubmitted = (httpStatusCode === 200 && httpStatus === 'OK' && importStatus === 'SUCCESS')? true : false;
                this.setState({recorded: recordSubmitted});
                //Update the Scan record
                const realmUX = await Realm.open({schema: [ScanSchema]});
                let scannedN = await realmUX.objects("Scan").filtered("poe_id==$0", filter);
                const written = realmUX.write(() => {
                     scannedN[0].submitted = recordSubmitted;
                });
                realmUX.close();
            }
        }
    }

  render() {
    const { navigation, route } = this.props;

    const { scan_id } = route.params.params;
    const { details } = route.params.params;
    const {connection_Status, offline_mode} = this.state;
//    console.log();
    const scan_details = JSON.parse(details);
    console.log(scan_details);
    return (
      <View style={styles.scrollViewStyle}>

            <Card style={{height: '100%', backgroundColor: 'yellow', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}>
                <CardItem header bordered style={{backgroundColor: '#ffd700', height: '10%', alignItems: 'center'}}>
                  <Text style={styles.detailedTextTitle}>{scan_details.full_name}</Text>

                </CardItem>
                <CardItem bordered style={{height: '90%'}} >

                    <View style={{flex: 1}}>
                    <Body>
                        <View>
                             <Text style={{fontSize: 16, textAlign: 'left', margin: 2, color: (connection_Status === true)? '#28B463': '#D35400'}}>
                                 <FontAwesome5 name={'wifi'} style={{fontSize: 16, marginTop: 30, color: (connection_Status === true) ? '#ffd700': '#dddddd'}} light/>
                                  { (connection_Status === true) ? " You are Online.": " You are offline."}
                               </Text>
                          </View >
                        <View style={{flex: 1, marginTop: 10}}>
                            <Text style={styles.textHeader}>POINT OF ENTRY DETAILS</Text>
                            <Text>Point of Entry</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{scan_details.point_of_entry}</Text>
                            <Text>Point of Entry ID</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{scan_details.poe_id}</Text>
                            <Text>Vehicle Number:</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{scan_details.vehicle}</Text>
                            <Text>Phone Number:</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{scan_details.phone_number}</Text>
                        </View>
                        <View>
                            <Text style={styles.textHeader}>CHECKPOINT DETAILS</Text>
                            <Text>Checkpoint Name:</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{scan_details.checkpoint}</Text>
                            <Text>Coordinate: </Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{"("+scan_details.latitude+","+scan_details.longitude+")"}</Text>
                        </View>
                        <View >
                            <Text style={styles.textHeader}>SCAN DETAILS</Text>
                            <Text>Scan Date:</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{moment(scan_details.scan_date).format("dddd MMM Do YYYY")+", "+scan_details.scan_time}</Text>
                        </View>

                        <View >
                            <Text style={styles.textHeader}>DATA SUBMISSION</Text>
                            <Text>Submitted to remote Server:</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{(scan_details.submitted === true)? "Submitted": "Not Submitted"}</Text>
                            <View>
                                {
                                    (scan_details.submitted)? <TouchableOpacity
//                                        onPress={this.activeQR}
                                        style={styles.buttonTouchableDanger}>
                                            <Text style={styles.buttonTextStyle}>
                                                <Icon name="trash" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 10}}/>  Delete this scan
                                            </Text>
                                        </TouchableOpacity>:((connection_Status)?<TouchableOpacity style={styles.buttonTouchableSuccess} onPress={(scan_id)=>this.resendTravelPass(scan_details.poe_id)}>
                                                <Text style={styles.buttonSubmitTextStyle}>
                                                <Icon name="sync" style={{fontSize: 22, textAlignVertical: 'center', marginTop: 10, color: '#ffd700'}}/>  Submit TravelCheck</Text>
                                           </TouchableOpacity>:null)
                                }
                            </View>

                        </View>


                    </Body>
                    </View>


                </CardItem>
              </Card>
      </View>
    );
  }
}

export default ScanDetails;