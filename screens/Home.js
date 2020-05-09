import React, { Component, Fragment } from 'react';
import { Text, TouchableOpacity,StatusBar,Linking,Left, FlatList,SafeAreaView,ScrollView ,Switch,Picker} from 'react-native';
import { List,
         ListItem,
         Content,
         Container,
         Form,
         Item,
         Label,
         InputGroup,
         Input,Icon,
         Card,
         CardItem,
         Body,
         Footer,
         FooterTab,
         Button,
         CheckBox,
         View,
         Right,
         Toast
       } from 'native-base';

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

import DateTimePicker from '@react-native-community/datetimepicker';
import { RNCamera } from 'react-native-camera';
import Select from 'react-select'
import RNCountry from "react-native-countries";
import NumericInput from 'react-native-numeric-input'
//let realm;

class Home extends Component {
    constructor(props) {
         super(props);
         this.camera = null;
         this.barcodeCodes = [];
         this.state = {
             showToast: false,
             scan: false,
             ScanResult: false,
             result: null,
             connection_Status : null,
             decryptedData : null,
             recentScan: null,
             checkpoint_exists: null,
             checkpoint: null,
             recorded: null,
             showStatus: null,
             scan_point: null,
             date_picker_visible: false,
             current_date: new Date(),
             selected_date: new Date(),
             oral_swab: false,
             nasal_swab: false,
             blood: false,
             camera: {
                type: RNCamera.Constants.Type.back,
             	flashMode: RNCamera.Constants.FlashMode.auto,
             },
             form_id:"",
             temperature: 37,
             quarantined: false,
             further_investigation: false,
             in_isolation: false,
             specimen_collected: false,
             cleared_to_travel: false,
             departureCode: 'KE',
             destinationCode: 'UG',
             departure_country: "",
             destination_country: "",
             address_in_uganda: "",
             planned_duration: null

         };

//         this.setCheckpointStates();

    }


    componentDidMount() {
        const CheckpointSchema = {
           name: 'Checkpoint',
           properties:
               {
                 name: 'string',
                 scan_point: 'string',
                 date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
                 current: {type: 'bool', default: true},
            }
        };

        let countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
        countryNamesWithCodes.sort((a, b) => a.name.localeCompare(b.name));
        this.setState({
            countryNameListWithCode: countryNamesWithCodes
        })

        this._unsubscribe = this.props.navigation.addListener('focus', () => {
              Realm.open({
                schema: [CheckpointSchema]
              }).then(realmDBL => {
                const current_checkpoint = realmDBL.objects("Checkpoint").filtered('current==true');
                const ck_exists = (current_checkpoint.length > 0)? true: false;
                console.log("Scan Point: "+JSON.stringify(current_checkpoint));
                const scan_point = (current_checkpoint.length > 0)? current_checkpoint[0].scan_point: null;
                this.setState({scan_point: scan_point});
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
           console.log(current_instance);

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

        console.log("API URL HERE: "+api_url);
        const token = base64.encode(`${username}:${password}`);

        const {data} = await axios.get( api_url, {
            headers: {
             'Authorization': `Basic ${token}`
           }
        });

//        console.log(response);
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
            console.log(current_instance);

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
        console.log("API URL HERE: "+api_url);
        const token = base64.encode(`${username}:${password}`);

        const response = await axios.post( api_url, payload,  {
            headers: {
             'Authorization': `Basic ${token}`
           }
        });

        const apiResponse = response;
        const httpStatusCode = apiResponse.data.httpStatusCode; //200
        const httpStatus = apiResponse.data.status; //OK
        const importStatus = apiResponse.data.response.status; //SUCCESS === true

        const recordSubmitted = (httpStatusCode === 200 && httpStatus === 'OK' && importStatus === 'SUCCESS')? true : false;

        console.log("record Submitted: "+recordSubmitted);

        //TODO: process some response
        return apiResponse;
    }

    renderFilter = ({value, onChange, onClose}) => (
      <CustomFilterComponent
         value={value}
         onChange={onChange}
         onClose={onClose}
       />
    )
    //Creates a new TEI record in DHIS2
    submitClearance = async ()=>{
        const {temperature,form_id,recentScan, scanExists, quarantined, recorded, further_investigation,in_isolation,specimen_collected,cleared_to_travel,departure_country,destination_country,planned_duration,address_in_uganda} = this.state;

        const generated = await this.getDHIS2("/api/trackedEntityAttributes/CLzIR1Ye97b/generate");
        console.log(generated);

        const scan = (scanExists === true)? recentScan[0]: recentScan;

        const poe_id = generated.value;

        const convertBoolean2YesNo = (variable) => {
            return (variable === true)? "Yes": "No";
        }

        const isolated = convertBoolean2YesNo(in_isolation);
        const investigated = convertBoolean2YesNo(further_investigation);
        const collected = convertBoolean2YesNo(specimen_collected);
        const cleared = convertBoolean2YesNo(cleared_to_travel);
        const quarantined_travellor = convertBoolean2YesNo(quarantined);

        const temperature_measured = (temperature > 0)? "Yes": "No";



        const tei_payload = {
            "trackedEntityType": "KWN8FUfvO5G", //TODO. ADd as part of DHIS2 Metadata configuration and mapping
            "trackedEntity": `${scan.tei}`,
            "orgUnit": `${scan.org_unit}`,
            "attributes":[
                 {
                     "attribute": "CLzIR1Ye97b", //POE_ID
                     "value": `${poe_id}`
                 },
                 {
                     "attribute": "PVXhTjVdB92", //Form ID
                     "value": `${form_id}`
                 },
                 {
                     "attribute": "sB1IHYu2xQT", //FullNames
                     "value": `${scan.full_name}`
                 },
                 {
                     "attribute": "h6aZFN4DLcR", //Vehicle Reg. Num
                     "value": `${scan.vehicle}`
                 },
                 {
                     "attribute": "E7u9XdW24SP", //Case Phone Contact or Next of Kin contact
                     "value": `${scan.phone_number}`
                 },
                 {
                     "attribute": "UJiu0P8GvHt", //Date of arrival
                     "value": `${moment().format()}`
                 },
                 {
                     "attribute": "cW0UPEANS5t", //country of departure
                     "value": `${departure_country}`
                 },
                 {
                     "attribute": "pxcXhmjJeMv", //country of Transit
                     "value": `${destination_country}`
                 },
                 {
                     "attribute": "ooK7aSiAaGq", //Address while in Uganda
                     "value": `${address_in_uganda}` //TODO: Add Address Field
                 },
                 {
                     "attribute": "eH7YTWgoHgo", //planned duration
                     "value": `${planned_duration}`
                 },
                 {
                     "attribute": "QUrkIanwcHD", //Temperature Taken
                     "value": `${temperature_measured}`
                 },
                 {
                     "attribute": "QhDKRe2QDA7", //Temperature
                     "value": `${temperature}`
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
                     "value": `${scan.nin_passport}` //TODO. Add Passport on QRCode
                 },
                 {
                     "attribute": "XvETY1aTxuB", //Nationality
                     "value": `${scan.nationality}` //TODO: Add Nationality ion QR
                 },
                 {
                     "attribute": "g4LJbkM0R24", //Age (years(
                     "value": `${scan.dob}` //TODO: Add Age *Years ion QR
                 },
                 {
                     "attribute": "FZzQbW8AWVd", //Sex
                     "value": `${scan.sex}` //TODO: Add Age *Years ion QR
                 }
            ],
            "enrollments": [
                {
                     "orgUnit": `${scan.org_unit}`,
                     "program": `${scan.program}`,
                     "enrollmentDate": `${moment(scan.scan_date).format("YYYY-MM-DD")}`,
                     "incidentDate": `${moment(scan.scan_date).format("YYYY-MM-DD")}`
                }
            ]
        }

        console.log(tei_payload);

        const response = await this.postDHIS2(tei_payload, 'tei');
        const apiResponse = response;
        const httpStatusCode = apiResponse.data.httpStatusCode; //200
        const httpStatus = apiResponse.data.status; //OK
        const importStatus = apiResponse.data.response.status; //SUCCESS === true

        const recordSubmitted = (httpStatusCode === 200 && httpStatus === 'OK' && importStatus === 'SUCCESS')? true : false;
        this.setState({recorded: recordSubmitted});

        (this.state.recorded != null ) ? this.setState({showStatus: true}): this.setState({showStatus: false});

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
            const nationality = thisScan[10].split(":")[1].trim();
            const dob = thisScan[11].split(":")[1].trim();
            const sex = thisScan[12].split(":")[1].trim();
            const nin_passport = thisScan[13].split(":")[1].trim();

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
                 sex: 'string',
                 nationality: 'string',
                 dob: 'date',
                 nin_passport: 'string',
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
                  existScan[0].sex = sex;
                  existScan[0].nationality = nationality;
                  existScan[0].dob = dob;
                  existScan[0].nin_passport = nin_passport;
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
                    sex:`${sex}`,
                    nationality:`${nationality}`,
                    dob:`${dob}`,
                    nin_passport:`${nin_passport}`,
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
             sex: 'string',
             nationality: 'string',
             dob: 'date',
             nin_passport: 'string',
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

    renderForm = (scan_point) => {
        const { scan, ScanResult, result, decryptedData, checkpoint_exists, scanExists, connection_Status, recorded, showStatus,countries, current_date, nasal_swab, oral_swab, blood, departure_country, destination_country } = this.state;
        const scanInfo = (decryptedData !== null)?decryptedData.split("\n"): null;
        const displayScan = (scanInfo !== null)? scanInfo[0]+"\n"+ scanInfo[1] +"\n"+ scanInfo[2] +"\n"+ scanInfo[3]+"\n"+ scanInfo[4]: null;


        const { navigation} = this.props;

        const showDatePicker = () => {
            this.setState({date_picker_visible: true});
        };

        const toggleIsolation = (value) => {
            this.setState({in_isolation: value})
        }

        const toggleClearance = (value) => {
                    this.setState({cleared_to_travel: value})
                }

        const toggleQuarantine = (value) => {
            this.setState({quarantined: value})
        }

        const toggleInvestigation = (value) => {
            this.setState({further_investigation: value})
        }

        const toggleSpecimenTaken = (value) => {
                    this.setState({specimen_collected: value})
                }


        const hideDatePicker = () => {
            this.setState({date_picker_visible: false});
        };

        const handleConfirm = (date) => {

            this.setState({selected_date: date})
            console.warn("New DATE Selected: "+ this.state.selected_date);
            hideDatePicker();
        };

        switch(scan_point){
           case 'arrival':
               return <Content>
                    <View style={{flex: 1}}>
                       <Text style={{fontSize: 16, textAlign: 'left', margin: 2, color: (connection_Status === true)? '#28B463': '#D35400'}}>
                           <FontAwesome5 name={'wifi'} style={{fontSize: 16, marginTop: 30, color: (connection_Status === true) ? '#ffd700': '#dddddd'}} light/>
                            { (connection_Status === true) ? " You are Online.": " You are offline."}
                         </Text>
                    </View>
                   <View style={{
                        flexDirection: "column",
                        padding: 10,
                        width: '100%',
                        backgroundColor: "#ccc" }}>
                       <Text style={styles.scanTextTitle}>TravelPass Details!</Text>
                       <Text style={{textTransform: 'uppercase'}}>{displayScan}</Text>
                   </View>
                   <View style={{
                      flexDirection: "column",
                      padding: 10,
                      width: '100%' }}>
                       <Text style={styles.scanTextTitle}>Arrival: Required information!</Text>
                       <Form >
                           <Item stackedLabel style={{marginLeft: 0 }}>
                               <Label>Body Temperature on arrival {'\u00b0'}C: </Label>
                               <Input placeholder="Body Temperature" keyboardType = 'number-pad'  placeholderTextColor="#E0E1ED" onChangeText={(text) => {this.setState({checkpoint: text}); }} value={this.state.text}/>
                           </Item>
                       </Form>
                   </View>
                   <View style={{ flex: 1, alignItems: 'center' }}>
                     {
                       (connection_Status === true)?
                       <View>
                           <TouchableOpacity onPress={this.submitCheckRecord} style={styles.buttonTouchableSuccess} disabled={(recorded === true )? true: false}>
                               <Text style={styles.buttonSubmitTextStyle}><Icon name="paper-plane" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 10, color: '#ffd700'}}/> Submit TravelCheck</Text>
                           </TouchableOpacity>
                           <Text>{recorded}</Text>
                       </View>
                       : <View>
                             <Text>The scan record is saved on the phone.</Text>
                       </View>
                     }
                     </View>

               </Content>;
               break;
               case 'laboratory':
                   return <Content>
                        <View style={{flex: 1}}>
                           <Text style={{fontSize: 16, textAlign: 'left', margin: 2, color: (connection_Status === true)? '#28B463': '#D35400'}}>
                               <FontAwesome5 name={'wifi'} style={{fontSize: 16, marginTop: 30, color: (connection_Status === true) ? '#ffd700': '#dddddd'}} light/>
                                { (connection_Status === true) ? " You are Online.": " You are offline."}
                             </Text>
                        </View>
                         <View style={{
                              flexDirection: "column",
                              padding: 10,
                              width: '100%',
                              backgroundColor: "#ccc" }}>
                             <Text style={styles.scanTextTitle}>TravelPass Details!</Text>
                             <Text style={{textTransform: 'uppercase'}}>{displayScan}</Text>
                         </View>
                         <View style={{
                            flexDirection: "column",
                            padding: 10,
                            width: '100%' }}>
                             <Text style={styles.scanTextTitle}>Laboratory: Required information!</Text>
                             <Form >
                                <Text style={{marginTop: 10}}>Specimen Collected</Text>
                                 <ListItem onPress={() => this.setState({ oral_swab: !this.state.oral_swab })}>
                                     <CheckBox checked={this.state.oral_swab} color="#ffd700"/>
                                     <Body style={{marginLeft: 10}}>
                                       <Text>Oropharyngeal Swab</Text>
                                     </Body>
                                   </ListItem>
                                   <ListItem onPress={() => this.setState({ nasal_swab: !this.state.nasal_swab })}>
                                     <CheckBox checked={this.state.nasal_swab} color="#ffd700" />
                                     <Body style={{marginLeft: 10}}>
                                       <Text>Nasopharyngeal Swab</Text>
                                     </Body>
                                   </ListItem>
                                   <ListItem onPress={() => this.setState({ blood: !this.state.blood })}>
                                     <CheckBox checked={this.state.blood} color="#ffd700"/>
                                     <Body style={{marginLeft: 10}}>
                                       <Text>Blood</Text>
                                     </Body>
                                   </ListItem>

                                   <TouchableOpacity style={styles.buttonTouchableSuccess} onPress={() => navigation.navigate('DHIS2Setting',{screen: 'DHIS2Setting'})}>
                                        <Text style={styles.buttonSubmitTextStyle}><Icon name="barcode" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 10, color: '#ffd700'}}/> Scan Specimen ID</Text>
                                    </TouchableOpacity>
                                   <Item stackedLabel style={{marginLeft: 20 }}>
                                       <Input placeholder='Specimen ID' placeholderTextColor={'#ccc'}/>
                                   </Item>
                             </Form>
                         </View>
                         <View style={{ flex: 1, alignItems: 'center' }}>
                           {
                             (connection_Status === true)?
                             <View>
                                 <TouchableOpacity onPress={this.submitCheckRecord} style={styles.buttonTouchableSuccess} disabled={(recorded === true )? true: false}>
                                     <Text style={styles.buttonSubmitTextStyle}><Icon name="paper-plane" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 10, color: '#ffd700'}}/> Submit TravelCheck</Text>
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
                     </Content>;
                   break;
               case 'clearance':
                    return <Content>
                        <View style={{flex: 1}}>
                           <Text style={{fontSize: 16, textAlign: 'left', margin: 2, color: (connection_Status === true)? '#28B463': '#D35400'}}>
                               <FontAwesome5 name={'wifi'} style={{fontSize: 16, marginTop: 30, color: (connection_Status === true) ? '#ffd700': '#dddddd'}} light/>
                                { (connection_Status === true) ? " You are Online.": " You are offline."}
                             </Text>
                        </View>
                      <View style={{
                           flexDirection: "column",
                           padding: 10,
                           width: '100%',
                           backgroundColor: "#ccc" }}>
                          <Text style={styles.scanTextTitle}>TravelPass Details!</Text>
                          <Text style={{textTransform: 'uppercase'}}>{displayScan}</Text>
                      </View>
                      <View style={{
                         flexDirection: "column",
                         padding: 10,
                         width: '100%' }}>
                          <Text style={styles.scanTextTitle}>Travel Clearance: Required information!</Text>
                          <Form >
                              <ListItem noindent>
                                <Body  >
                                  <Text style={{marginLeft: 0}}>In Isolation</Text>
                                </Body>
                                <Right>
                                      <Switch
                                            onValueChange = {toggleIsolation}
                                            value = {this.state.in_isolation} />
                                </Right>
                              </ListItem>
                              <ListItem noindent>
                                    <Body  >
                                      <Text style={{marginLeft: 0}}>Referred for further investigation</Text>
                                    </Body>
                                    <Right>
                                          <Switch
                                                onValueChange = {toggleInvestigation}
                                                value = {this.state.further_investigation}/>
                                    </Right>
                                  </ListItem>

                                  <ListItem noindent>
                                    <Body  >
                                      <Text style={{marginLeft: 0}}>Under Quarantine</Text>
                                    </Body>
                                    <Right>
                                          <Switch
                                                onValueChange = {toggleQuarantine}
                                                value = {this.state.quarantined}/>
                                    </Right>
                                  </ListItem>
                          </Form>
                      </View>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        {
                          (connection_Status === true)?
                          <View>
                              <TouchableOpacity onPress={this.submitCheckRecord} style={styles.buttonTouchableSuccess} disabled={(recorded === true )? true: false}>
                                  <Text style={styles.buttonSubmitTextStyle}><Icon name="paper-plane" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 10, color: '#ffd700'}}/> Submit TravelCheck</Text>
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
                  </Content>;
                  break;
                  case 'checkpoint':
                  case 'exit':
                    return <Content>
                       <View style={{flex: 1}}>
                           <Text style={{fontSize: 16, textAlign: 'left', margin: 2, color: (connection_Status === true)? '#28B463': '#D35400'}}>
                               <FontAwesome5 name={'wifi'} style={{fontSize: 16, marginTop: 30, color: (connection_Status === true) ? '#ffd700': '#dddddd'}} light/>
                                { (connection_Status === true) ? " You are Online.": " You are offline."}
                             </Text>
                        </View>
                      <View style={{
                           flexDirection: "column",
                           padding: 10,
                           width: '100%',
                           backgroundColor: "#ccc" }}>
                          <Text style={styles.scanTextTitle}>TravelPass Details!</Text>
                          <Text style={{textTransform: 'uppercase'}}>{displayScan}</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                          {
                            (connection_Status === true)?
                            <View>
                                <TouchableOpacity onPress={this.submitCheckRecord} style={styles.buttonTouchableSuccess} disabled={(recorded === true )? true: false}>
                                    <Text style={styles.buttonSubmitTextStyle}><Icon name="paper-plane" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 10, color: '#ffd700'}}/> Submit TravelCheck</Text>
                                </TouchableOpacity>
                                <Text>{recorded}</Text>
                            </View>
                            : <View>

                                  <Text style={{marginTop: 20, color: 'orange', fontWeight: 'bold'}}><Icon name="information-circle" style={{fontSize: 20, textAlignVertical: 'center', marginTop: 22, color: '#ffd700'}}/> The scan record is saved on the phone.</Text>
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

                    </Content>
                    break;
               default:
                   return <Content>
                             <View style={{flex: 1}}>
                                 <Text style={{fontSize: 16, textAlign: 'left', margin: 2, color: (connection_Status === true)? '#28B463': '#D35400'}}>
                                     <FontAwesome5 name={'wifi'} style={{fontSize: 16, marginTop: 30, color: (connection_Status === true) ? '#ffd700': '#dddddd'}} light/>
                                      { (connection_Status === true) ? " You are Online.": " You are offline."}
                                   </Text>
                              </View>
                            <View style={{
                                 flexDirection: "column",
                                 padding: 10,
                                 width: '100%',
                                 backgroundColor: "#ccc" }}>
                                <Text style={styles.scanTextTitle}>TravelPass Details!</Text>
                                <Text style={{textTransform: 'uppercase'}}>{displayScan}</Text>
                            </View>
                            <View style={{
                                 flexDirection: "column",
                                 padding: 10,
                                 width: '100%' }}>
                                  <Text style={styles.scanTextTitle}>Required information!</Text>
                                  <Form >
                                        <Item stackedLabel style={{marginLeft: 0 }}>
                                             <Label>Form ID </Label>
                                             <Input placeholder="Enter Form ID"  placeholderTextColor="#E0E1ED" onChangeText={(text) => {this.setState({form_id: text}); }} value={this.state.form_id}/>
                                        </Item>
                                        <Item stackedLabel style={{marginLeft: 0 }}>
                                            <Label>Country of Departure </Label>
                                            <Picker
                                                selectedValue={this.state.departureCode}
                                                style={{eight: 50, width: '100%'}}
                                                onValueChange={
                                                    (itemValue, itemIndex) => {
                                                        this.setState({departure_country: itemValue});
                                                        this.setState({departureCode: itemValue});
                                                    }}
                                                 >
                                                {this.state.countryNameListWithCode.map((val) => {
                                                    return <Picker.Item key={'country-item-' + val.code} label={val.name} value={val.code}/>
                                                })}
                                            </Picker>
                                        </Item>
                                        <Item stackedLabel style={{marginLeft: 0 }}>
                                         <Label>Country of Destination </Label>
                                         <Picker
                                             selectedValue={this.state.destinationCode}
                                             style={{eight: 50, width: '100%'}}
                                             onValueChange={
                                                 (itemValue, itemIndex) => {
                                                     this.setState({destination_country: itemValue});
                                                     this.setState({destinationCode: itemValue});
                                                 }}
                                              >
                                             {this.state.countryNameListWithCode.map((val) => {
                                                 return <Picker.Item key={'country-item-' + val.code} label={val.name} value={val.code}/>
                                             })}
                                         </Picker>
                                        </Item>
                                         <Item stackedLabel style={{marginLeft: 0 }}>
                                             <Label>Address in Uganda </Label>
                                             <Input placeholder="Address in Uganda"  placeholderTextColor="#E0E1ED" onChangeText={(text) => {this.setState({address_in_uganda: text}); }} value={this.state.address_in_uganda}/>
                                        </Item>
                                        <Item stackedLabel style={{marginLeft: 0 }}>
                                             <Label>Duration of Stay </Label>
                                             <Input placeholder="Duration of stay in Uganda"  placeholderTextColor="#E0E1ED" onChangeText={(text) => {this.setState({planned_duration: text}); }} value={this.state.planned_duration}/>
                                        </Item>
                                        <Item stackedLabel style={{marginLeft: 0, paddingBottom: 10 }}>
                                           <Label style={{marginBottom: 10}}>Temperature {'\u00b0'}C: </Label>
                                           <NumericInput
                                               value={this.state.value}
                                               onChange={value => this.setState({temperature: value})}
                                               totalWidth={240}
                                               totalHeight={36}
                                               iconSize={16}
                                               editable={true}
                                               step={0.1}
                                               valueType='real'
                                               rounded
                                               textColor='#010101'
                                               iconStyle={{ color: '#010101' }}
                                               containerStyle={{flex: 1}}
                                               rightButtonBackgroundColor='#ffd700'
                                               leftButtonBackgroundColor='#ffd700'/>
                                        </Item>
                                       <ListItem noindent style={{marginLeft: 0}}>
                                           <Body  >
                                             <Text style={{marginLeft: 0}}>Specimen collected</Text>
                                           </Body>
                                           <Right>
                                                 <Switch
                                                       onValueChange = {toggleSpecimenTaken}
                                                       value = {this.state.specimen_collected} />
                                           </Right>
                                         </ListItem>
                                      <ListItem noindent style={{marginLeft: 0}}>
                                        <Body  >
                                          <Text style={{marginLeft: 0}}>Need for Isolation</Text>
                                        </Body>
                                        <Right>
                                              <Switch
                                                    onValueChange = {toggleIsolation}
                                                    value = {this.state.in_isolation} />
                                        </Right>
                                      </ListItem>
                                      <ListItem noindent style={{marginLeft: 0}}>
                                            <Body  >
                                              <Text style={{marginLeft: 0}}>Referred for further investigation</Text>
                                            </Body>
                                            <Right>
                                                  <Switch
                                                        onValueChange = {toggleInvestigation}
                                                        value = {this.state.further_investigation}/>
                                            </Right>
                                          </ListItem>

                                          <ListItem noindent style={{marginLeft: 0}}>
                                            <Body  >
                                              <Text style={{marginLeft: 0}}>Under Quarantine</Text>
                                            </Body>
                                            <Right>
                                                  <Switch
                                                        onValueChange = {toggleQuarantine}
                                                        value = {this.state.quarantined}/>
                                            </Right>
                                          </ListItem>

                                          <ListItem noindent style={{marginLeft: 0}}>
                                              <Body  >
                                                <Text style={{marginLeft: 0}}>Cleared to travel</Text>
                                              </Body>
                                              <Right>
                                                    <Switch
                                                          onValueChange = {toggleClearance}
                                                          value = {this.state.cleared_to_travel}/>
                                              </Right>
                                            </ListItem>

                                  </Form>
                              </View>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                {
                                  (connection_Status === true)?
                                  <View>
                                      <TouchableOpacity onPress={this.submitClearance} style={styles.buttonTouchableSuccess} disabled={(recorded === true )? true: false}>
                                          <Text style={styles.buttonSubmitTextStyle}><Icon name="paper-plane" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 10, color: '#ffd700'}}/> Submit TravelCheck</Text>
                                      </TouchableOpacity>
                                      <Text>{recorded}</Text>
                                  </View>
                                  : <View>

                                        <Text style={{marginTop: 20, color: 'orange', fontWeight: 'bold'}}><Icon name="information-circle" style={{fontSize: 20, textAlignVertical: 'center', marginTop: 22, color: '#ffd700'}}/> The scan record is saved on the phone.</Text>
                                  </View>
                                }
                                </View>
                          </Content>;
                   break;

       }

    };

    render = () => {
     const { scan, ScanResult, result, decryptedData, checkpoint_exists, scanExists, connection_Status, recorded, showStatus, scan_point, current_date,departure_country } = this.state;
     const desccription = 'With the outbreak of COVID-19 Virus, countries took tough measures to prevent its further spread. However, some activities like CARGO shipments through and into a country were allowed. Every crew member allowed in the country is given a TravelPass for verification at checkpoints using this app';
     const { navigation} = this.props;
     return (

            <SafeAreaView style={{ flex: 1, justifyContent: 'space-between',}} horizontal={false} alwaysBounceVertical={'true'} >
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
                 </View>
                 }
                 {ScanResult &&
                     <Fragment>
                        {this.renderForm(scan_point)}

                        <TouchableOpacity
                          activeOpacity={0.7}
                          position={'topLeft'}
                          onPress={this.scanAgain}
                          style={styles.touchableOpacityTopStyle}>
                          <Icon name="qr-scanner" />
                        </TouchableOpacity>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                             {
                             (showStatus === true)? <View>
                                {
                                    (recorded === true )? Toast.show({
                                        text: "Successfully Saved!",
                                        buttonText: "Okay",
                                        type: "success",
                                        duration: 5000
                                      }) : Toast.show({
                                              text: "Not Saved record remotely!",
                                              buttonText: "Okay",
                                              type: "danger",
                                              duration: 5000
                                      })
                                }
                             </View>: <View></View>
                           }
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