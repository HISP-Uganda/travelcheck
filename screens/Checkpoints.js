import React, { Component } from 'react';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text ,Icon} from 'native-base';
import {View, RefreshControl,TouchableOpacity } from 'react-native';
import moment from "moment";
import styles from '../styles/styles';

export default class Checkpoints extends Component {
    constructor(props) {
         super(props);
         this.state = {
             checkpoints: {}
         };
     }

     componentDidMount = () =>{
         const CheckpointSchema = {
               name: 'Checkpoint',
               properties:
                   {
                     name: 'string',
                     date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
                     current: {type: 'bool', default: true}
                }
              };

         this._unsubscribe = this.props.navigation.addListener('focus', () => {
           Realm.open({
             schema: [CheckpointSchema]
           }).then(realm => {
             const data = realm.objects('Checkpoint').sorted("current", true);
             this.setState({checkpoints: data});
             this.setState({db: realm});
             realm.close();
           });
         });
      }

      componentWillUnmount = () => {
          this._unsubscribe();
       }

  render() {
     const checkpointscans = this.state.checkpoints;
     const data = Array.from(checkpointscans);
     const { navigation } = this.props;

////    const scans = this.state.realm ? this.state.realm.objects('Scan') : false
//    const checkscans = this.state.scans;
//    console.log(checkscans);
//    console.log(Object.keys(checkscans));
//    const { navigation } = this.props;

    return (
        <Container>
            <Content
            >
                <List>
                    {
                        Object.keys(data).map(function(key) {
                            console.log(key)
                            return <ListItem
                                        key={key}
                                        avatar
                                        button={true}
                                        style={{marginLeft:0, paddingLeft:0}}
                                    >
                                         <Body>
                                           <Text>{data[key].name}</Text>
                                           <Text note>{data[key].date_created.toString()}</Text>
                                         </Body>
                                         <Right style={{alignItems: 'center'}}>
                                           <Text note>{(data[key].current == true)? "Active": "Inactive"}</Text>
                                           <Icon name={(data[key].current == true)? "radio-button-on": "radio-button-off"} style={{color:(data[key].current == true)? '#ffd700' : '#AEB6BF', fontSize: 24}}/>
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
        </Container>
    );
  }
}