import React, { Component } from 'react';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text ,Icon} from 'native-base';
import {View, RefreshControl } from 'react-native';
import moment from "moment";
import styles from '../styles/styles';

export default class Checkpoints extends Component {
    constructor(props) {
         super(props);
         this.state = {
             realm: null,
             scans: {}
         };
     }

     CheckpointSchema = {
      name: 'Checkpoint',
      properties:
          {
            name: 'string',
            date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
            current: {type: 'bool', default: true}
       }
     };

  async componentDidMount() {
     const ckdb = await Realm.open({
       schema: [this.CheckpointSchema]
     });

     const data = await ckdb.objects('Checkpoint');
     this.setState({scans: data.sorted('date_created', true)})

     ckdb.close();

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
    console.log(checkscans);
    console.log(Object.keys(checkscans));

    return (
        <Container>
            <Content
            >
                <List>
                    {
                        Object.keys(checkscans).map(function(key) {
                            console.log(key)
                            return <ListItem
                                        key={key}
                                        avatar
                                        button={true}
                                        style={{marginLeft:0, paddingLeft:0}}
                                    >
                                         <Body>
                                           <Text>{checkscans[key].name}</Text>
                                           <Text note>{checkscans[key].date_created.toString()}</Text>
                                         </Body>
                                         <Right style={{alignItems: 'center'}}>
                                           <Text note>{(checkscans[key].current == true)? "Active": "Inactive"}</Text>
                                           <Icon name={(checkscans[key].current == true)? "radio-button-on": "radio-button-off"} style={{color:(checkscans[key].current == true)? '#229954' : '#AEB6BF', fontSize: 24}}/>
                                         </Right>
                                    </ListItem>
                            }
                        )
                    }
                </List>
            </Content>
            <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('AddCheckpoint',{screen: 'AddCheckpoint'})}
                  style={styles.touchableOpacityStyle}>
                  <Icon name="add" />
                </TouchableOpacity>
          </View>
        </Container>
    );
  }
}