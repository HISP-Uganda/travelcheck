import React, { Component, Fragment } from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import BarcodeMask from 'react-native-barcode-mask';
import { List, ListItem, Content, InputGroup, Input,Icon, Button, Card, CardItem, Body, Footer, FooterTab} from 'native-base';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';


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

     onSuccess = async (e) => {
         const check = e.data.substring(0, 4);
         console.log('scanned data' + check);
         this.setState({
             result: e,
             scan: false,
             ScanResult: true,
             loading: true,
         })
         const ScanSchema = {
                      name: 'Scan',
                      properties:
                      {
                        uuid: 'string',
                        scan_date: {type: 'date', default: moment().format('YYYY-MM-DD')},
                        scan_time: 'string',
                        case_id: 'string',
                        first_name: 'string',
                        last_name: 'string',
                        dob: 'string',
                        phone_number: 'string',
                        nationality: 'string',
                        latitude: 'string',
                        longitude: 'string'
                      }
                  };

                 const checkDate = moment().format('YYYY-MM-DD');
                 const checkTime = moment().format('HH:mm')
                 let scanLocation = {};
                 try{
                      scanLocation = await GetLocation.getCurrentPosition({
                           enableHighAccuracy: true,
                           timeout: 15000,
                     });

                 }catch(e){
                     console.log(e.message);
                 }
                 const passphrase = "COVID-19R35P0N5E-2020";
                 const bytes = AES.decrypt(this.state.result.data, passphrase);
                 const scanData = bytes.toString(Utf8);

                 const thisScan = scanData.split("\n");
                 console.log("THIS SCAN:: "+thisScan);

                 //THE ORDER MUST BE OBSERVED
                 const case_id = thisScan[0].split(":")[1].trim();
                 const first_name = thisScan[1].split(":")[1].trim();
                 const last_name = thisScan[2].split(":")[1].trim();
                 const dob = thisScan[3].split(":")[1].trim();
                 const phone_number = thisScan[4].split(":")[1].trim();
                 const nationality = thisScan[5].split(": ")[1].trim();

                 let realm;

                 try{
                     realm = await Realm.open({schema: [ScanSchema]});
                     realm.write(() => {
                       const newScan = realm.create('Scan', {
                         uuid: uuid.v4(),
                         scan_date: `${checkDate}`,
                         scan_time: `${checkTime}`,
                         case_id: `${case_id}`,
                         first_name: `${first_name}`,
                         last_name: `${last_name}`,
                         dob: `${dob}`,
                         phone_number: `${phone_number}`,
                         nationality: `${nationality}`,
                         latitude: `${scanLocation.latitude}`,
                         longitude: `${scanLocation.longitude}`
                       });
                     });
                     realm.close();
                 }catch(e){
                     console.log(e.message);
                 }

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

     render() {
         const { scan, ScanResult, result } = this.state
         const passphrase = "COVID-19R35P0N5E-2020";
//         const appCrypt = new SimpleCrypto(passphrase);
         const desccription = 'Rwanda is ramping up its testing for the coronavirus through periodic community testing and sampling in hospitals and clinics across the country. Rwanda’s mass testing seeks to fulfil the conditions set by the World Health Organisation for countries before lifting the coronavirus lockdown. '
         console.log("SCAN DATA: "+ (result==null)?result: result.data);

//         const decrypted = (result !== null)? appCrypt.decrypt(result.data) : result;

         const bytes = (result !== null)? AES.decrypt(result.data, passphrase): result;
         const decrypted = (bytes !== null)? bytes.toString(Utf8): "";

         console.log("DECRYPTED: "+ decrypted);
         //TODO: PROCESS THE DATA and FORMAT HERE before displaying on LINE 257

         const scanInfo = (decrypted !== null)?decrypted.split("\n"): null;
         const displayScan = (scanInfo !== null)? scanInfo[0]+"\n"+ scanInfo[1] +"\n"+ scanInfo[2] +"\n"+ scanInfo[3]+"\n"+ scanInfo[4]: null;
         return (
             <View style={styles.scrollViewStyle}>
                 <Fragment>
                     <StatusBar barStyle="dark-content" />
                     {!scan && !ScanResult &&
                         <Card style={{height: '100%'}}>
                            <CardItem>
                                <Text style={styles.textTitle}>Rwanda COVID-19 Result Scan</Text>
                            </CardItem>
                            <Body>
                                <Text numberOfLines={8} style={styles.descText}>{desccription}</Text>
                                <TouchableOpacity onPress={this.activeQR} style={styles.buttonTouchable}>
                                     <Text style={styles.buttonTextStyle}>Scan COVID-19 Result</Text>
                                </TouchableOpacity>
                            </Body>
                         </Card>
                     }

                     {ScanResult &&
                         <Fragment>
                            <Card style={{height: '100%'}}>
                                <CardItem style={{alignItems: 'center'}}>
                                    <Text style={styles.textTitle}>COVID-19 Result Vital Information!</Text>
                                </CardItem>
                                <Body>
                                    <Text style={{textTransform: 'uppercase'}}>{displayScan}</Text>
                                     <TouchableOpacity onPress={this.scanAgain} style={styles.buttonTouchable}>
                                         <Text style={styles.buttonTextStyle}>Repeat Result Scan</Text>
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
                             bottomContent={
                             <View>
                                 <TouchableOpacity style={styles.buttonTouchable} onPress={() => this.scanner.reactivate()}>
                                      <Text style={styles.buttonTextStyle}>Refresh Scanner</Text>
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