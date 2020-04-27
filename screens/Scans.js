import React, { Component } from 'react';
import { View, RefreshControl,TouchableOpacity,ScrollView, Modal, FlatList} from 'react-native';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text , Card, CardItem, Icon} from 'native-base';
import moment from "moment";
import Realm from 'realm';
import styles from '../styles/styles';

class Scans extends Component {
    constructor(props) {
         super(props);
         this.state = {
//             db: null,
             scans: {},
         };
    }

     componentDidMount = () =>{
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

        this._unsubscribe = this.props.navigation.addListener('focus', () => {
          // do something
          console.log("SCans ALL HERE TAB CLICKED");
          Realm.open({
            schema: [ScanSchema]
          }).then(realm => {
            const data = realm.objects('Scan');
            console.log(data);
//            this.setState({ realm });
            this.setState({scans: data});
            console.log("TOTAL SCANS: "+ this.state.scans.length);
            this.setState({db: realm});
            realm.close();
          });
        });
     }

     componentWillUnmount = () => {
          // Close the realm if there is one open.
        this._unsubscribe();
//        const {realm} = this.state;
//        if (realm !== null && !realm.isClosed) {
//          realm.close();
//        }
     }

  render() {
     const checkscans = this.state.scans;
     console.log("ARRAY OBJECTS of Scans");
     console.log(Array.from(checkscans));
     const data = Array.from(checkscans);
     const { navigation } = this.props;
//     const { db } = this.state;
//     realm.close();
//     db.close();
    return (checkscans !== null) ? (
        <Container>
            <Content>
                <List>
                      {
                          Object.keys(data).map(function(key) {
                              return <ListItem
                                      key={key}
                                      avatar
                                      button={true}
                                      onLongPress={() => console.warn("event -> onLongPress")}
                                      onPress={() => navigation.navigate('Details',{screen: 'Details',params: { scan_id: data[key].poe_id, details: JSON.stringify(data[key]) },})}
                                      style={{marginLeft:0, paddingLeft:0, textColor: (data[key].submitted === true)? "#1E8449": "#5D6D7E"}}
                                  >
                                       <Body>
                                         <Text style={{textTransform: 'uppercase'}}>{data[key].full_name}</Text>
                                         <Text note>{checkscans[key].poe_id + " - "+ data[key].checkpoint}</Text>
                                       </Body>
                                       <Right style={{alignItems: 'center'}}>
                                         <Text note>{data[key].scan_time}</Text>
                                         <Icon name={(data[key].submitted == true)? "done-all": "checkmark"}  style={{color:(data[key].submitted == true)? '#229954' : '#F39C12', fontSize: 24}}/>
                                       </Right>
                                  </ListItem>
                              }
                          )
                      }
                  </List>
            </Content>

        </Container>
    ) : (

            <Text>No Records Found</Text>

    )
  }
}

export default Scans;