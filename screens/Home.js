import React, { Component, Fragment } from 'react';
import { Button, View, Text, TouchableOpacity,StatusBar,Linking,Left, Right, FlatList,SafeAreaView,ScrollView } from 'react-native';
import { List, ListItem, Content, InputGroup, Input,Icon, Card, CardItem, Body, Footer, FooterTab, Toast} from 'native-base';

import QRCodeScanner from 'react-native-qrcode-scanner';
import axios from 'axios';
import base64 from 'react-native-base64'
import moment from "moment";
import GetLocation from 'react-native-get-location';
import styles from '../styles/styles';
import Realm from 'realm';
import NetInfo from "@react-native-community/netinfo";
import uuid from 'react-native-uuid';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Col, Row, Grid } from "react-native-easy-grid";

//import { SafeAreaView} from 'react-native-safe-area-context';

//let realm;

class Home extends Component {
    constructor(props) {
         super(props);
         this.state = {
             scan: false,
             ScanResult: false,
             result: null,
             connection_Status : null,
             decryptedData : null,
             recentScan: null,
             checkpoint_exists: null,
             checkpoint: null,
             recorded: null,
             showStatus: null
         };

//         this.setCheckpointStates();

    }



    componentDidMount() {
        const CheckpointSchema = {
           name: 'Checkpoint',
           properties:
               {
                 name: 'string',
                 date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
                 current: {type: 'bool', default: true}
            }
       };
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
              Realm.open({
                schema: [CheckpointSchema]
              }).then(realmDBL => {
                const current_checkpoint = realmDBL.objects("Checkpoint").filtered('current==true');
                const ck_exists = (current_checkpoint.length > 0)? true: false;
                this.setState({checkpoint_exists: ck_exists});
                (ck_exists) ? this.setState({checkpoint: JSON.stringify(current_checkpoint)}): null;
                this.setState({db: realmDBL});
                realmDBL.close();
              });

              NetInfo.addEventListener(state => {
                this.setState({connection_Status: state.isConnected});
              });
        });
      }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onSuccess = async (e) => {
           const check = e.data.substring(0, 4);
           this.setState({
               result: e,
               scan: false,
               ScanResult: true,
               scanExists: false
           })

           let myscan;

            const checkDate = moment().format('YYYY-MM-DD');
            const checkTime = moment().format('HH:mm')
            let checkPoint = {};
            try{
                 checkPoint = await GetLocation.getCurrentPosition({
                      enableHighAccuracy: true,
                      timeout: 15000,
                });

            }catch(e){
                console.log(e.message);
            }
            const passphrase = "COVID-19R35P0N5E-2020";
            let bytes  = await AES.decrypt(this.state.result.data, passphrase);
            const scanData = bytes.toString(Utf8);
            const thisScan = scanData.split("\n");

            //THE ORDER MUST BE OBSERVED
            const name = thisScan[0].split(":")[1].trim();
            const vehicle = thisScan[1].split(":")[1].trim();
            const phone = thisScan[2].split(":")[1].trim();
            const poe = thisScan[3].split(":")[1].trim();
            const poe_id = thisScan[4].split(":")[1].trim();
            const base_url = thisScan[5].split(": ")[1].trim();
            const tei = thisScan[6].split(":")[1].trim();
            const program = thisScan[7].split(":")[1].trim();
            const programStage = thisScan[8].split(":")[1].trim();
            const orgUnit = thisScan[9].split(":")[1].trim();

            let current_checkpoint = {};
            const ckpt = JSON.parse(this.state.checkpoint);
            const checkPointName = (ckpt !== undefined) ? ckpt[0].name : "Checkpoint Unavailable";
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
                 submitted: {type: 'bool', default: false}
               }
           };

            const realm = await Realm.open({schema: [ScanSchema]});
            let existScan = await realm.objects("Scan").filtered("poe_id==$0", poe_id);
            if(existScan.length > 0){
                //Update the Scan record
                const written = realm.write(() => {
                  existScan[0].poe_id = poe_id;
                  existScan[0].scan_date = checkDate;
                  existScan[0].scan_time = checkTime;
                  existScan[0].full_name = name;
                  existScan[0].vehicle = vehicle;
                  existScan[0].phone_number = phone;
                  existScan[0].point_of_entry = poe;
                  existScan[0].org_unit = orgUnit;
                  existScan[0].dhis_url = base_url;
                  existScan[0].program = program;
                  existScan[0].program_stage = programStage;
                  existScan[0].tei = tei;
                  existScan[0].checkpoint = `${checkPointName}`;
                  existScan[0].latitude = `${checkPoint.latitude}`;
                  existScan[0].longitude = `${checkPoint.longitude}`;
                });
                this.setState({scanExists: true});
                myscan = JSON.stringify(existScan);

            }else{
                //Continue saving to Phone
                let scanned;
                realm.write(() => {
                    scanned = realm.create('Scan', {
                    uuid: uuid.v4(),
                    scan_date: `${checkDate}`,
                    scan_time: `${checkTime}`,
                    full_name: `${name}`,
                    vehicle: `${vehicle}`,
                    phone_number: `${phone}`,
                    point_of_entry: `${poe}`,
                    org_unit: `${orgUnit}`,
                    poe_id: `${poe_id}`,
                    dhis_url: `${base_url}`,
                    program: `${program}`,
                    program_stage:`${programStage}`,
                    tei:`${tei}`,
                    checkpoint: `${checkPointName}`,
                    latitude: `${checkPoint.latitude}`,
                    longitude: `${checkPoint.longitude}`,
                    submitted: false,
                  });
                  this.setState({scanExists: false});
                  myscan = JSON.stringify(scanned);
                });
            }

            this.setState({
                decryptedData: scanData,
                recentScan: JSON.parse(myscan)
            })

            realm.close();
       }

    activeQR = () => {
           this.setState({
               scan: true
           })
    }
    scanAgain = () => {
           this.setState({
               scan: true,
               ScanResult: false
           })
    }

    submitCheckRecord = async () => {
        const {recentScan, scanExists, connection_Status} = await this.state;
        const { navigation} = this.props;
        let payload;
        let api_url;

        if(scanExists){
            payload = {
                  "program": `${recentScan[0].program}`,
                  "trackedEntityInstance":`${recentScan[0].tei}`,
                  "programStage":`${recentScan[0].program_stage}`,
                  "orgUnit": `${recentScan[0].org_unit}`,
                  "eventDate": `${recentScan[0].scan_date}`,
                  "status": "COMPLETED",
                  "completedDate": `${recentScan[0].scan_date}`,
                  "storedBy": "Socaya",
                  "coordinate": {
                    "latitude": `${recentScan[0].latitude}`,
                    "longitude": `${recentScan[0].longitude}`
                  },
                  //TODO: Dynamically load DEs from COVID-19 PASS
                  "dataValues": [
                    {
        //              "dataElement": "dD5ljdUgNHn", //ugandaeidsr.org
                      "dataElement": "hcdSE7aTbQT", //eidsr.health.go.ug
                      "value": `${recentScan[0].checkpoint}`
                    },
                    {
        //              "dataElement": "Y3crbgZKSrx", //ugandaeidsr.org
                      "dataElement": "aN2fgA52IrU", //eidsr.health.go.ug
                      "value": `${recentScan[0].scan_time}`
                    }
                  ]
                }
                api_url = `${recentScan[0].dhis_url}/api/events`;
        }else{
         payload = {
           "program": `${recentScan.program}`,
           "trackedEntityInstance":`${recentScan.tei}`,
           "programStage":`${recentScan.program_stage}`,
           "orgUnit": `${recentScan.org_unit}`,
           "eventDate": `${recentScan.scan_date}`,
           "status": "COMPLETED",
           "completedDate": `${recentScan.scan_date}`,
           "storedBy": "Socaya",
           "coordinate": {
             "latitude": `${recentScan.latitude}`,
             "longitude": `${recentScan.longitude}`
           },
           //TODO: Dynamically load DEs from COVID-19 PASS
           "dataValues": [
             {
 //              "dataElement": "dD5ljdUgNHn", //ugandaeidsr.org
               "dataElement": "hcdSE7aTbQT", //eidsr.health.go.ug
               "value": `${recentScan.checkpoint}`
             },
             {
 //              "dataElement": "Y3crbgZKSrx", //ugandaeidsr.org
               "dataElement": "aN2fgA52IrU", //eidsr.health.go.ug
               "value": `${recentScan.scan_time}`
             }
           ]
         }

         api_url = `${recentScan.dhis_url}/api/events`;
       }

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
             submitted: {type: 'bool', default: false}
           }
       };

        this.setState({
            loading: true,
        })

        //TODO: Load from App settings the DHIS2 instance.
        const username = "Socaya";
        const password = "Dhis@2020";
        const token = base64.encode(`${username}:${password}`);

        const status = this.state.connection_Status;
        let recordSubmitted  = false;
        //Skip data submission to DHIS2 if not connected
        if(connection_Status === true){
            const response = await axios.post( api_url, payload,  {
                headers: {
                 'Authorization': `Basic ${token}`
               }
            });

            const apiResponse = response;
            const httpStatusCode = apiResponse.data.httpStatusCode; //200
            const httpStatus = apiResponse.data.status; //OK
            const importStatus = apiResponse.data.response.status; //SUCCESS === true

            recordSubmitted = (httpStatusCode === 200 && httpStatus === 'OK' && importStatus === 'SUCCESS')? true : false;

            this.setState({recorded: recordSubmitted});
            (this.state.recorded != null ) ? this.setState({showStatus: true}): this.setState({showStatus: false});

            //Update REALM DB and delete the records, TODO: Add option to autodelete if successful submission
            const realmX = await Realm.open({schema: [ScanSchema]});
            let updateScan = await realmX.objects("Scan").filtered("poe_id==$0", (scanExists === true)?recentScan[0].poe_id:recentScan.poe_id);
            if(updateScan.length > 0){
                //Update the Scan record
                realmX.write(() => {
                  updateScan[0].submitted = recordSubmitted;
                });
            }
            realmX.close();
        }
     }

    render() {
     const { scan, ScanResult, result, decryptedData, checkpoint_exists, scanExists, connection_Status, recorded, showStatus } = this.state;
     const desccription = 'With the outbreak of COVID-19 Virus, countries took tough measures to prevent its further spread. However, some activities like CARGO shipments through and into a country were allowed. Every crew member allowed in the country is given a TravelPass for verification at checkpoints using this app';
     const { navigation} = this.props;
     const scanInfo = (decryptedData !== null)?decryptedData.split("\n"): null;
     const displayScan = (scanInfo !== null)? scanInfo[0]+"\n"+ scanInfo[1] +"\n"+ scanInfo[2] +"\n"+ scanInfo[3]+"\n"+ scanInfo[4]: null;

     return (

            <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center' }} horizontal={false} alwaysBounceVertical={'true'} >
             <ScrollView style={{marginHorizontal: 0}}>
             <Fragment>
                 {!scan && !ScanResult &&
                     <View style={{ flex: 1, alignItems: 'center', height: '100%',textAlignVertical: 'top'}}>
                        <Text style={styles.textTitle}>Welcome To COVID-19 TravelCheck App!</Text>
                        <Text numberOfLines={8} style={styles.descText}>{desccription}</Text>
                        <View style={{ flex: 1, alignItems: 'center', marginTop: 1 }}>
                              {
                                (checkpoint_exists === true)?
                                    <TouchableOpacity onPress={this.activeQR} style={styles.buttonTouchable}>
                                         <Text style={styles.buttonTextStyle}><Icon name="qr-scanner" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 10}}/>  Scan TravelPass</Text>
                                    </TouchableOpacity> :
                                    <TouchableOpacity onPress={() => navigation.navigate('AddCheckpoint',{screen: 'AddCheckpoint'})} style={styles.buttonTouchable}>
                                           <Text style={styles.buttonTextStyle}>
                                                <Icon name="pin" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 10}}/>  Add Checkpoint
                                           </Text>
                                    </TouchableOpacity>
                              }
                        </View>
                        <Text style={{marginTop: 30}}>Scan other documents</Text>
                        <Grid style={{padding: 10}}>
                            <Col>
                                <TouchableOpacity onPress={() => navigation.navigate('ScanPassport',{screen: 'ScanPassport'})}>
                                       <Card>
                                           <CardItem>
                                             <Body style={{alignItems: 'center'}}>
                                               <FontAwesome5 name={'passport'} style={{fontSize: 20}}/>
                                             </Body>
                                           </CardItem>
                                           <CardItem footer style={{textAlign: 'center', backgroundColor: '#ccc'}}>
                                             <Text>Passport</Text>
                                           </CardItem>
                                        </Card>
                                </TouchableOpacity>
                            </Col>
                            <Col>
                                <TouchableOpacity onPress={() => navigation.navigate('ScanIdentityCard',{screen: 'ScanIdentityCard'})}>
                                <Card>
                                     <CardItem style={{alignItems: 'center'}}>
                                       <Body style={{alignItems: 'center'}}>
                                         <FontAwesome5 name={'id-card'} style={{fontSize: 20}} light/>
                                       </Body>
                                     </CardItem>
                                     <CardItem footer style={{alignItems: 'center', backgroundColor: '#ccc'}}>
                                       <Text style={{alignItems: 'center'}}>ID Card</Text>
                                     </CardItem>
                                  </Card>
                                 </TouchableOpacity>
                            </Col>
                            <Col>
                                <TouchableOpacity onPress={() => navigation.navigate('ScanBoardingPass',{screen: 'ScanBoardingPass'})}>
                                <Card>
                                       <CardItem >
                                         <Body style={{alignItems: 'center'}}>
                                           <FontAwesome5 name={'plane'} style={{fontSize: 20}} light/>
                                         </Body>
                                       </CardItem>
                                        <CardItem footer style={{textAlign: 'center', backgroundColor: '#ccc'}}>
                                          <Text>Flights</Text>
                                        </CardItem>
                                  </Card>
                                 </TouchableOpacity>
                            </Col>
                        </Grid>
                 </View>
                 }
                 {ScanResult &&
                     <Fragment>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                             <Text style={styles.textTitle}>TravelPass Details!</Text>
                             <Text style={{textTransform: 'uppercase'}}>{displayScan}</Text>
                             <TouchableOpacity onPress={this.scanAgain} style={styles.buttonTouchable}>
                                 <Text style={styles.buttonTextStyle}>Repeat TravelPass Scan</Text>
                             </TouchableOpacity>
                              <FontAwesome5 name={'wifi'} style={{fontSize: 30, marginTop: 30, color: (connection_Status === true) ? '#ffd700': '#dddddd'}} light/>
                              <Text style={{fontSize: 20, textAlign: 'center', margin: 10, color: (connection_Status === true)? '#28B463': '#D35400'}}>
                                    { (connection_Status === true) ? "You are Online.": "You are offline."}
                              </Text>
                              <View style={{ flex: 1, alignItems: 'center' }}>
                              {
                                (connection_Status === true)?
                                <View>
                                    <TouchableOpacity onPress={this.submitCheckRecord} style={styles.buttonTouchableSuccess} disabled={(recorded === true )? true: false}>
                                        <Text style={styles.buttonSubmitTextStyle}><Icon name="sync" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 10, color: '#ffd700'}}/> Submit TravelCheck</Text>
                                    </TouchableOpacity>
                                    <Text>{recorded}</Text>
                                </View>
                                : <View>
                                      <Text>The scan record is saved on the phone.</Text>
                                </View>
                              }
                              </View>
                              <View style={{ flex: 1, alignItems: 'center' }}>
                                    {
                                    (showStatus === true)?<View>
                                          <Text>{(recorded === true )? "Submitted Successfully": "Scan not submitted."}</Text>
                                    </View>:<Text></Text>
                                  }
                              </View>
                         </View>
                     </Fragment>
                         }
                         {scan &&
                             <QRCodeScanner
                                 reactivate={true}
                                 showMarker={true}
                                 ref={(node) => { this.scanner = node }}
                                 onRead={this.onSuccess}
                                 showMarker={true}
                                 markerStyle={{borderColor: 'yellow'}}
                                 topViewStyle={{display: 'none'}}
                                 containerStyle={{height: '100%'}}
//                                 bottomViewStyle={{display: 'none'}}
                                 fadeIn={false}
                                 bottomContent={
                                 <View style={{marginTop: 60}}>
                                     <TouchableOpacity style={styles.buttonTouchable} onPress={() => this.scanner.reactivate()}>
                                          <Text style={styles.buttonTextStyle}>Refresh Scanner</Text>
                                      </TouchableOpacity>
                                 </View>
                                 }
                             />
                         }
                     </Fragment>
                     </ScrollView>
                     </SafeAreaView>


             );
         }

}

export default Home;