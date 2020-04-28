import React, { Component, Fragment } from 'react';
import { Button, View, Text, TouchableOpacity,StatusBar,Linking,Left, Right, FlatList } from 'react-native';
import { List, ListItem, Content, InputGroup, Input,Icon, Card, CardItem, Body, Footer, FooterTab} from 'native-base';

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

let realm;

class Home extends Component {
    constructor(props) {
             super(props);
             this.state = {
                 scan: false,
                 ScanResult: false,
                 result: null,
                 realm: null,
                 connection_Status : null,
                 decryptedData : null,
                 recentScan: null,
             };
         }

      componentDidMount = async () => {
           const connection = await NetInfo.fetch();
           this.setState({connection_Status: connection});
      }

      onSuccess = async (e) => {
               const check = e.data.substring(0, 4);
               this.setState({
                   result: e,
                   scan: false,
                   ScanResult: true
               })

               //Store scanned information into the Local DB
               const CheckpointSchema = {
                    name: 'Checkpoint',
                    properties:
                        {
                          name: 'string',
                          date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
                          current: {type: 'bool', default: true}
                     }
                };

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


                let checkPointName;

                try{
                    realm = await Realm.open({schema: [ScanSchema, CheckpointSchema]});

                    current_checkpoint = realm.objects("Checkpoint").filtered('current==true');
                    checkPointName = (current_checkpoint.length > 0)? current_checkpoint[0].name: "Checkpoint Unavailable";
                    const existScan = await realm.objects("Scan").filtered("poe_id==$0", poe_id);

                    console.log("Record Found. "+existScan);
                    if(existScan.length > 0){
                        //Update the Scan record
                        console.log("Record Found. Updating");
                        realm.write(() => {
                          existScan.poe_id = poe_id;
                          existScan.scan_date = checkDate;
                          existScan.scan_time = checkTime;
                          existScan.full_name = name;
                          existScan.vehicle = vehicle;
                          existScan.phone_number = phone;
                          existScan.point_of_entry = poe;
                          existScan.dhis_url = base_url;
                          existScan.tei = tei;
                          existScan.checkpoint = checkPointName;
                          existScan.latitude = checkPoint.latitude;
                          existScan.longitude = checkPoint.longitude;
                        });

                        this.setState({
                            recentScan: existScan
                          });
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
                            poe_id: `${poe_id}`,
                            dhis_url: `${base_url}`,
                            tei:`${tei}`,
                            checkpoint: `${checkPointName}`,
                            latitude: `${checkPoint.latitude}`,
                            longitude: `${checkPoint.longitude}`,
                            submitted: false,
                          });

                          this.setState({
                            recentScan: scanned
                          });
                        });
                    }
                    realm.close();
                }catch(e){
                    console.log(e.message);
                }

                this.setState({
                    decryptedData: scanData
                })
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
        const {recentScan} = this.state;
        console.log(recentScan);

        //TODO: Load from Realm DB
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
//        console.log(token);

        const status = this.state.connection_Status;

        const connected = status.isConnected;
        const internetReachable = status.isInternetReachable;
        let recordSubmitted  = false;

        //Skip data submission to DHIS2
        connected = false;
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

            //Update REALM DB and delete the records

        }

        realm.close();
     }

    render() {
     const { scan, ScanResult, result, decryptedData } = this.state;
     const desccription = 'With the outbreak of COVID-19 Virus, countries took tough measures to prevent its further spread. However, some activities like CARGO shipments through and into a country were allowed. Every crew member allowed in the country is given a TravelPass for verification at checkpoints using this app';
//     console.log(decryptedData);

     const scanInfo = (decryptedData !== null)?decryptedData.split("\n"): null;
     const displayScan = (scanInfo !== null)? scanInfo[0]+"\n"+ scanInfo[1] +"\n"+ scanInfo[2] +"\n"+ scanInfo[3]+"\n"+ scanInfo[4]: null;
     const options = [
       {type: "travelpass",displayName: "TravelPass"},
       {type: "passport", displayName: "Passport"},
       {type: "boardingpass", displayName: "Boarding Pass"},
       {type: "airticket", displayName: "Air Ticket"},
       {type: "nationalid", displayName: "National ID"},
       {type: "drivingpermit", displayName: "Driving Permit"},
     ];
//     console.log(options);
     return (
         <View style={styles.scrollViewStyle}>
             <Fragment>
                 {!scan && !ScanResult &&
                     <View style={{ flex: 1, alignItems: 'center', height: '100%', paddingTop: 40,textAlignVertical: 'top'}}>
                        <Text style={styles.textTitle}>Welcome To COVID-19 TravelCheck App!</Text>
                        <Text numberOfLines={8} style={styles.descText}>{desccription}</Text>
                            <TouchableOpacity onPress={this.activeQR} style={styles.buttonTouchable}>
                                 <Text style={styles.buttonTextStyle}><Icon name="qr-scanner" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 30}}/>  Scan TravelPass</Text>
                            </TouchableOpacity>
                            <Text style={styles.textTitle}>Scan other documents</Text>
                            <Grid style={{padding: 20}}>
                                <Col>
                                    <Card>
                                        <CardItem>
                                          <Body style={{alignItems: 'center'}}>
                                            <FontAwesome5 name={'passport'} style={{fontSize: 30}}/>
                                          </Body>
                                        </CardItem>
                                        <CardItem footer style={{textAlign: 'center', backgroundColor: '#ccc'}}>
                                          <Text>Passport</Text>
                                        </CardItem>
                                     </Card>

                                </Col>
                                <Col>
                                    <Card>
                                         <CardItem style={{alignItems: 'center'}}>
                                           <Body style={{alignItems: 'center'}}>
                                             <FontAwesome5 name={'id-card'} style={{fontSize: 30}} light/>
                                           </Body>
                                         </CardItem>
                                         <CardItem footer style={{alignItems: 'center', backgroundColor: '#ccc'}}>
                                           <Text style={{alignItems: 'center'}}>ID Card</Text>
                                         </CardItem>
                                      </Card>
                                </Col>
                                <Col>
                                    <Card>
                                           <CardItem >
                                             <Body style={{alignItems: 'center'}}>
                                               <FontAwesome5 name={'plane'} style={{fontSize: 30}} light/>
                                             </Body>
                                           </CardItem>
                                            <CardItem footer style={{textAlign: 'center', backgroundColor: '#ccc'}}>
                                              <Text>Flights</Text>
                                            </CardItem>
                                      </Card>
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
                              <FontAwesome5 name={'wifi'} style={{fontSize: 30, marginTop: 30, color: (this.state.connection_Status.isConnected === true && this.state.connection_Status.isInternetReachable === true)? '#ffd700': '#dddddd'}} light/>
                              <Text style={{fontSize: 20, textAlign: 'center', margin: 10, color: (this.state.connection_Status.isConnected === true && this.state.connection_Status.isInternetReachable === true)? '#28B463': '#D35400'}}>
                                    { (this.state.connection_Status.isConnected === true && this.state.connection_Status.isInternetReachable === true) ? "You are Online.": "You are offline."}
                              </Text>
                              <View style={{ flex: 1, alignItems: 'center' }}>
                              {
                                (this.state.connection_Status.isConnected === true && this.state.connection_Status.isInternetReachable === true)?<TouchableOpacity onPress={this.submitCheckRecord} style={styles.buttonTouchableSuccess}>
                                                                        <Text style={styles.buttonTextStyle}>Submit TravelCheck</Text>
                                                                    </TouchableOpacity> : <Text>The scan record is saved on the phone.</Text>
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

export default Home;