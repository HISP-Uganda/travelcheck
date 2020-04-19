import React, { Component } from 'react';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import {View, RefreshControl } from 'react-native';
import moment from "moment";
import Realm from 'realm';
import ScanModal from './scanmodal'

export default class Scans extends Component {
    constructor(props) {
         super(props);
         this.state = {
             realm: null,
             scans: {}
         };
     }

     ScanSchema = {
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

  async componentDidMount() {
     const db = await Realm.open({
       schema: [this.ScanSchema]
     });

     const data = await db.objects('Scan');
     this.setState({scans: data})

   }

   componentWillUnmount() {
     // Close the realm if there is one open.
     const {realm} = this.state;
     if (realm !== null && !realm.isClosed) {
       realm.close();
     }
   }



  render() {
//    const scans = this.state.realm ? this.state.realm.objects('Scan') : false
    const checkscans = this.state.scans;
//    console.log(checkscans);

    return (
        <Container>
            <Content
//            refreshControl={
//                <RefreshControl
//                  refreshing={this.state.isRefreshing}
//                  onRefresh={this._onRefresh}
//                  title="Loading..."
//                />
//              }
            >
                <List>
                    {
                        Object.keys(checkscans).map(function(key) {
                            return <ListItem
                                        key={key}
                                        avatar
                                        button={true}
                                        style={{marginLeft:0, paddingLeft:0}}
                                    >
                                         <Body>
                                           <Text>{checkscans[key].full_name}</Text>
                                           <Text note>{checkscans[key].poe_id + " - "+ checkscans[key].checkpoint}</Text>
                                         </Body>
                                         <Right>
                                           <Text note>{checkscans[key].scan_time}</Text>
                                           <Text>Sent</Text>
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