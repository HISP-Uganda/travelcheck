import React, { Component, Fragment } from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import BarcodeMask from 'react-native-barcode-mask';
import { List, ListItem, Content, InputGroup, Input,Icon, Button } from 'native-base';

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

 class Scan extends Component {
     constructor(props) {
         super(props);
         this.state = {
             scan: false,
             ScanResult: false,
             result: null,
             realm: null,
         };
     }

     onSuccess = (e) => {
         const check = e.data.substring(0, 4);
         console.log('scanned data' + check);
         this.setState({
             result: e,
             scan: false,
             ScanResult: true
         })
         if (check === 'http') {
             Linking
                 .openURL(e.data)
                 .catch(err => console.error('An error occured', err));
         } else {
             this.setState({
                 result: e,
                 scan: false,
                 ScanResult: true
             })
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

     submitCheckRecord = async () => {

        const ScanSchema = {
             name: 'Scan',
             properties:
             {
               scan_date: {type: 'date', default: moment().format('YYYY-MM-DD')},
               scan_time: 'string',
               full_name: 'string',
               vehicle: 'string',
               phone_number: 'string',
               point_of_entry: 'string',
               poe_id: 'string',
               tei:'string',
               checkpoint: 'string',
               latitude: 'string',
               longitude: 'string',
               submitted: {type: 'bool', default: false}
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

        //Processing the data from QR Code
        const scanData = this.state.result;
        const thisScan = scanData.data.split("\n");
        const name = thisScan[0].split(":")[1].trim();
        const vehicle = thisScan[1].split(":")[1].trim();
        const phone = thisScan[2].split(":")[1].trim();
        const poe = thisScan[3].split(":")[1].trim();
        const poe_id = thisScan[4].split(":")[1].trim();
        const tei = thisScan[5].split(":")[1].trim();
        const checkPointName = "HISP Kasangati"

        console.log(checkPoint.latitude);

        let payload = {
          "program": "nBWFG3fYC8N",
          "trackedEntityInstance":`${tei}`,
          "programStage":"geweXwkKtFQ",
          "orgUnit": "a4gTh6i5VdH", //TODO: Change it dynamically
          "eventDate": `${checkDate}`,
          "status": "COMPLETED",
          "completedDate": `${checkDate}`,
          "storedBy": "Socaya",
          "coordinate": {
            "latitude": checkPoint.latitude,
            "longitude": checkPoint.longitude
          },
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

//        console.log(payload);
        //SAVE into Realm DB DATA:
//        console.log('REALM PATH', Realm.defaultPath);

        let realm;

        try{
            realm = await Realm.open({schema: [ScanSchema]});

            realm.write(() => {
              const newScan = realm.create('Scan', {
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

        this.setState({
            loading: true,
        })

        //TODO: Load from App settings the DHIS2 instance.
        const api_url = "https://ugandaeidsr.org/api/events";
        const username = "Socaya";
        const password = "Dhis@2020";
        const token = base64.encode(`${username}:${password}`);
        console.log(token);
        const response = await axios.post( api_url, payload,  {
            headers: {
             'Authorization': `Basic ${token}`
           }
        });

        console.log(response);
     }
     render() {
         const { scan, ScanResult, result } = this.state
         const desccription = 'With the outbreak of COVID-19 Virus, countries took tough measures to prevent its further spread. However, some activities like CARGO shipments through and into a country were allowed. Every crew member allowed in the country is given a TravelPass for verification at checkpoints using this app'
         return (
             <View style={styles.scrollViewStyle}>
                 <Fragment>
                     <StatusBar barStyle="dark-content" />
                     {!scan && !ScanResult &&
                         <View style={styles.cardView} >
                             <Text style={styles.textTitle}>Welcome To COVID-19 TravelCheck App!</Text>
                             <Text numberOfLines={8} style={styles.descText}>{desccription}</Text>

                             <TouchableOpacity onPress={this.activeQR} style={styles.buttonTouchable}>
                                 <Text style={styles.buttonTextStyle}>Scan TravelPass</Text>
                             </TouchableOpacity>
                         </View>
                     }

                     {ScanResult &&
                         <Fragment>
                             <View style={ScanResult ? styles.scanCardView : styles.cardView}>
                                 <Text style={styles.textTitle1}>TravelPass Details</Text>
                                 <Text>{result.data}</Text>
                                 <TouchableOpacity onPress={this.scanAgain} style={styles.buttonTouchable}>
                                     <Text style={styles.buttonTextStyle}>Repeat TravelPass Scan</Text>
                                 </TouchableOpacity>

                                  <TouchableOpacity onPress={this.submitCheckRecord} style={styles.buttonTouchableSuccess}>
                                    <Text style={styles.buttonTextStyle}>Submit TravelCheck</Text>
                                  </TouchableOpacity>
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