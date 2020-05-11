import React, { Component } from 'react';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text ,Icon, Button} from 'native-base';
import {View, RefreshControl,TouchableOpacity } from 'react-native';
import moment from "moment";
import styles from '../../styles/styles';

export default class Mappings extends Component {
    constructor(props) {
         super(props);
         this.state = {
             mappings: {}
         };
     }

     componentDidMount = () =>{
         const MappingSchema = {
             name: 'Mapping',
             properties:{
                   organisation: 'string',
                   program: 'string',
                   date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
                   current: {type: 'bool', default: true},
             }
         }

         this._unsubscribe = this.props.navigation.addListener('focus', () => {
           Realm.open({
             schema: [MappingSchema]
           }).then(realm => {
             const data = realm.objects('Mapping').sorted("current", true);
             this.setState({mappings: data});
             this.setState({db: realm});
             realm.close();
           });
         });
      }

      componentWillUnmount = () => {
          this._unsubscribe();
       }

  render() {
     const mappingsA = this.state.mappings;
     const data = Array.from(mappingsA);
     const { navigation } = this.props;

     console.log(data);

    return (
        <Container>
            <Content
            >
                <List>
                    {
                        Object.keys(data).map(function(key) {
                            const mappingDetails = JSON.stringify(data[key]);
                            return <ListItem
                                        key={key}
                                        icon
                                        button={true}
                                        style={{paddingLeft:0, marginTop: 5}}
                                        onPress={() => navigation.navigate('MappingDetails',{screen: 'MappingDetails',params: { details: mappingDetails }})}
                                    >
                                         <Body>
                                           <Text style={{textTransform: 'uppercase', fontSize: 12, fontWeight: 'bold'}}>{data[key].program+" ("+data[key].organisation+")"}</Text>
                                           <Text note>{moment(data[key].date_created).format("dddd MMM Do YYYY")}</Text>
                                         </Body>
                                         <Right style={{alignItems: 'center'}}>
                                           <Text note>{}</Text>
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
                  onPress={() => navigation.navigate('Metadata',{screen: 'Metadata'})}
                  style={styles.touchableOpacityStyle}>
                  <Icon name="add" />
                </TouchableOpacity>
        </Container>
    );
  }
}