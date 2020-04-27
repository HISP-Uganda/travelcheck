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

     ScanSchema = {
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

  async componentDidMount() {
     const db = await Realm.open({
       schema: [this.ScanSchema]
     });

//     const data = await db.objects('Scan');
     const data = db.objects('Scan');
     console.log(data);

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
                                         <Text>{checkscans[key].full_name}</Text>
                                         <Text note>{checkscans[key].poe_id + " - "+ checkscans[key].checkpoint}</Text>
                                       </Body>
                                       <Right style={{alignItems: 'center'}}>
                                         <Text note>{checkscans[key].scan_time}</Text>
                                         <Icon name={(checkscans[key].submitted == true)? "done-all": "checkmark"}  style={{color:(checkscans[key].submitted == true)? '#229954' : '#F39C12', fontSize: 24}}/>
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