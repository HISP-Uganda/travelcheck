import React, { Component } from 'react';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text , Card, CardItem, Icon} from 'native-base';
import {View, RefreshControl,TouchableOpacity,ScrollView, Modal, FlatList } from 'react-native';
import moment from "moment";
import Realm from 'realm';
import styles from '../styles/styles';

export default class Scans extends Component {
    constructor(props) {
         super(props);
         this.state = {
             db: null,
             scans: {},
         };
     }



  async componentDidMount() {
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

     const db = await Realm.open({
       schema: [ScanSchema]
     });

//     const data = await db.objects('Scan');
     const data = db.objects('Scan');

     this.setState({scans: data})

     db.close();
   }

   componentWillUnmount() {
     // Close the realm if there is one open.
     const {db} = this.state;
     if (db !== null && !db.isClosed) {
       db.close();
     }
   }

  render() {
//    const scans = this.state.realm ? this.state.realm.objects('Scan') : false
    const checkscans = this.state.scans;
    console.log("ARRAY OBJECTS of Scans");
    console.log(Array.from(checkscans));

    const data = Array.from(checkscans);


    const scanKeys = Object.keys(checkscans);

    return (
        <Container>
            <Content>
                <List>
                      {
                          Object.keys(checkscans).map(function(key) {
                              return <ListItem
                                      key={key}
                                      avatar
                                      button={true}
                                      onLongPress={() => console.warn("event -> onLongPress")}
                                      onPress={() => console.warn("event -> onPress Event")}
                                      style={{marginLeft:0, paddingLeft:0, textColor: (checkscans[key].submitted === true)? "#1E8449": "#5D6D7E"}}
                                  >
                                       <Body>
                                         <Text>{checkscans[key].case_id + " - "+ checkscans[key].first_name+" "+ checkscans[key].last_name}</Text>
                                         <Text note>{checkscans[key].nationality +" ("+checkscans[key].dob +")"}</Text>
                                       </Body>
                                       <Right style={{alignItems: 'center'}}>
                                         <Text note>{checkscans[key].scan_time}</Text>
                                       </Right>
                                  </ListItem>
                              }
                          )
                      }
                  </List>
            </Content>
        </Container>
    );
  }
}