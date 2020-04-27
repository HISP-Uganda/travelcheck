import React, { Component, Fragment } from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import BarcodeMask from 'react-native-barcode-mask';
import { List, ListItem, Content, InputGroup, Input,Icon, Button, Card, CardItem, Body, Footer, FooterTab} from 'native-base';

import styles from '../styles/styles'
import {
     TouchableOpacity,
     Text,
     StatusBar,
     Linking,
     View,Left, Right
 } from 'react-native';
import axios from 'axios';
import base64 from 'react-native-base64'
import moment from "moment";
import GetLocation from 'react-native-get-location'

 import {
     Header,
     Colors,
 } from 'react-native/Libraries/NewAppScreen';

 import Realm from 'realm';
// import SimpleCrypto from "simple-crypto-js";
 import NetInfo from "@react-native-community/netinfo";
 import uuid from 'react-native-uuid';
 import AES from 'crypto-js/aes';
 import Utf8 from 'crypto-js/enc-utf8';

 //ENcryption DETAILS
 //ALG - AES256CBC
 //Passphrase=COVID-19R35P0N5E-2020
 //salt=65902EAEC6D35935
 //key=F2ED72F3D2BF29F8394D2166E848C4F5F67B12F4CE6A8FF6
 //iv =31CDF5901EC571946482F27C768681A9

 class Scan extends Component {
     constructor(props) {
         super(props);
         this.state = {
             scan: false,
             ScanResult: false,
             result: null,
             realm: null,
             connection_Status : null,
         };
     }

     async componentDidMount() {
          const connection = await NetInfo.fetch();
          this.setState({connection_Status: connection});
     }

     onSuccess = (e) => {
         const check = e.data.substring(0, 4);
         console.log('scanned data' + check);
         this.setState({
             result: e,
             scan: false,
             ScanResult: true
         })
//         if (check === 'http') {
//             Linking
//                 .openURL(e.data)
//                 .catch(err => console.error('An error occured', err));
//         } else {
//             this.setState({
//                 result: e,
//                 scan: false,
//                 ScanResult: true
//             })
//         }

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

     getTEI = () =>{
        this.setState({
            loading: true,
        })
        //TODO: Load from App settings the DHIS2 instance.
        const api_url = "https://eidsr.health.go.ug/api/trackedEntityInstances.json?ouMode=ACCESSIBLE";
        const username = "Socaya";
        const password = "Dhis@2020";
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


     submitCheckRecord = async () => {

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
               poe_id: 'string',
               dhis_url: 'string',
               tei:'string',
               checkpoint: 'string',
               latitude: 'string',
               longitude: 'string',
               submitted: {type: 'bool', default: false}
             }
         };

         const CheckpointSchema = {
             name: 'Checkpoint',
             properties:
                 {
                   name: 'string',
                   date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
                   current: {type: 'bool', default: true}
              }
         };

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
        let bytes  = AES.decrypt(this.state.result.data, passphrase);
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

        let realm;
        let checkPointName;

        try{
            realm = await Realm.open({schema: [ScanSchema, CheckpointSchema]});

            current_checkpoint = realm.objects("Checkpoint").filtered('current==true');
            console.log("TOTAL ACTIVE CHECKPOINTS: "+current_checkpoint.length);
            console.log("ACTIVE CHECKPOINTS: "+current_checkpoint[0].name);
            checkPointName = (current_checkpoint.length > 0)? current_checkpoint[0].name: "Checkpoint Not Set";

            console.log("CheckPoint: "+ checkPointName);
        }catch(e){
            console.log(e.message);
        }

        let payload = {
                  "program": `${program}`,
                  "trackedEntityInstance":`${tei}`,
                  "programStage":`${programStage}`,
                  "orgUnit": `${orgUnit}`,
                  "eventDate": `${checkDate}`,
                  "status": "COMPLETED",
                  "completedDate": `${checkDate}`,
                  "storedBy": "Socaya",
                  "coordinate": {
                    "latitude": checkPoint.latitude,
                    "longitude": checkPoint.longitude
                  },
                  //TODO: Dynamically load DEs from COVID-19 PASS
                  "dataValues": [
                    {
                      "dataElement": "dD5ljdUgNHn",
                      "value": `${checkPointName}`
                    },
                    {
                      "dataElement": "Y3crbgZKSrx",
                      "value": `${checkTime}`
                    }
                  ]
                };


        this.setState({
            loading: true,
        })

        //TODO: Load from App settings the DHIS2 instance.
        const api_url = `${base_url}/api/events`;
        console.log("API URL: "+api_url);
        const username = "Socaya";
        const password = "Dhis@2020";
        const token = base64.encode(`${username}:${password}`);
        console.log(token);

        const status = this.state.connection_Status;

        const connected = status.isConnected;
        const internetReachable = status.isInternetReachable;
        let recordSubmitted  = false;

        //Skip data submission to DHIS2
        if(connected === true && internetReachable === true){
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

        }
        //Continue saving to Phone
        realm.write(() => {
          const newScan = realm.create('Scan', {
            uuid: uuid.v4(),
            scan_date: `${checkDate}`,
            scan_time: `${checkTime}`,
            full_name: `${name}`,
            vehicle: `${vehicle}`,
            phone_number: `${phone}`,
            point_of_entry: `${poe}`,
            poe_id: `${poe_id}`,
            dhis_url: `${base_url}`,
            tei:`${tei}`,
            checkpoint: `${checkPointName}`,
            latitude: `${checkPoint.latitude}`,
            longitude: `${checkPoint.longitude}`,
            submitted: recordSubmitted,
          });
        });
//
//        const scans = realm.objects('Scan');
//        console.log("TOTAL SCANS: "+ scans.length);
        realm.close();
     }
     render() {
         const { scan, ScanResult, result } = this.state;
         const passphrase = "COVID-19R35P0N5E-2020";
         const desccription = 'With the outbreak of COVID-19 Virus, countries took tough measures to prevent its further spread. However, some activities like CARGO shipments through and into a country were allowed. Every crew member allowed in the country is given a TravelPass for verification at checkpoints using this app'
         console.log("SCAN DATA: "+ (result==null)?result: result.data);

         const bytes  = (result !== null)? AES.decrypt(this.state.result.data, passphrase): result;
         const decrypted = (bytes !== null)? bytes.toString(Utf8): null;

         console.log("DECRYPTED DATA : "+decrypted);

         const scanInfo = (decrypted !== null)?decrypted.split("\n"): null;
         const displayScan = (scanInfo !== null)? scanInfo[0]+"\n"+ scanInfo[1] +"\n"+ scanInfo[2] +"\n"+ scanInfo[3]+"\n"+ scanInfo[4]: null;

         return (
             <View style={styles.scrollViewStyle}>
                 <Fragment>
                     <StatusBar barStyle="dark-content" />
                     {!scan && !ScanResult &&
                         <Card style={{height: '100%'}}>
                            <CardItem>
                                <Text style={styles.textTitle}>Welcome To COVID-19 TravelCheck App!</Text>
                            </CardItem>
                            <Body>
                                <Text numberOfLines={8} style={styles.descText}>{desccription}</Text>
                                <TouchableOpacity onPress={this.activeQR} style={styles.buttonTouchable}>
                                     <Text style={styles.buttonTextStyle}>Scan TravelPass</Text>
                                </TouchableOpacity>
                            </Body>
                         </Card>
                     }

                     {ScanResult &&
                         <Fragment>

                            <Card style={{height: '100%', flex: 1}}>

                                <Body>
                                    <CardItem>
                                        <Text style={styles.textTitle}>TravelPass Details!</Text>
                                    </CardItem>
                                    <Text style={{textTransform: 'uppercase'}}>{displayScan}</Text>
                                     <TouchableOpacity onPress={this.scanAgain} style={styles.buttonTouchable}>
                                         <Text style={styles.buttonTextStyle}>Repeat TravelPass Scan</Text>
                                     </TouchableOpacity>
                                      <Text style={{fontSize: 20, textAlign: 'center', margin: 10, color: (this.state.connection_Status.isConnected === true && this.state.connection_Status.isInternetReachable === true)? '#28B463': '#D35400'}}>
                                            { (this.state.connection_Status.isConnected === true && this.state.connection_Status.isInternetReachable === true) ? "You are Online. Data will be submitted online": "You are offline. Your data will be stored on the Phone."
} </Text>
                                      <TouchableOpacity onPress={this.submitCheckRecord} style={styles.buttonTouchableSuccess}>
                                        <Text style={styles.buttonTextStyle}>{(this.state.connection_Status.isConnected === true && this.state.connection_Status.isInternetReachable === true)? 'Submit TravelCheck': 'Save TravelCheck on Phone'}</Text>
                                      </TouchableOpacity>
                                </Body>
                             </Card>
                         </Fragment>
                     }


                     {scan &&
                         <QRCodeScanner
                             reactivate={true}
                             showMarker={true}
                             ref={(node) => { this.scanner = node }}
                             onRead={this.onSuccess}
                             showMarker={true}
                             fadeIn={false}
                             bottomContent={
                             <View>
                                 <TouchableOpacity style={styles.buttonTouchable} onPress={() => this.scanner.reactivate()}>
                                      <Text style={styles.buttonTextStyle}>OK. Got it!</Text>
                                  </TouchableOpacity>
                             </View>
                             }
                         />
                     }
                 </Fragment>
             </View>

         );
     }
 }



 export default Scan;