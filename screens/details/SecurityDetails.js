import React, { Component } from 'react';
import { View, Text,TouchableOpacity, Switch } from 'react-native';
import { Card, CardItem, Body,Left, Right, List, ListItem, Thumbnail, Button, Icon } from 'native-base';
import styles from '../../styles/styles';
import moment from 'moment';

class SecurityDetails extends Component {
    constructor(props) {
         super(props);
         this.state = {
             current: null,
             security_details: {}
         };
     }

     componentDidMount = ()=>{
        const { navigation, route } = this.props;
        const { checkpoint } = route.params.params;
        const { details } = route.params.params;
        console.log("DETAILS: "+details);
        const security_details = JSON.parse(details);
        console.log(security_details);
        console.log("After");
        this.setState({current: security_details.current});
        this.setState({security_details: security_details});
     }

     toggleSwitch = (value) => {
         this.setState({current: value})
         const security = this.state.security_details;
         console.log(security)
     }

  render() {
    const {current, security_details} = this.state;

    return (
      <View style={styles.scrollViewStyle}>
           <Card style={{height: '100%', backgroundColor: 'yellow', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}>
               <CardItem header bordered style={{backgroundColor: '#ffd700', height: '10%', alignItems: 'center'}}>
                 <Text style={styles.detailedTextTitle}>{security_details.instance}</Text>
               </CardItem>
               <CardItem bordered style={{height: '90%'}} >
                   <View style={{flex: 1}}>
                   <Body>
                       <View>
                           <Text style={styles.textHeader}>DHIS2 INSTANCE DETAILS</Text>
                           <Text>Description</Text>
                           <Text note numberOfLines={2} style={styles.securityTextDetail}>{security_details.description}</Text>
                           <Text>URL</Text>
                           <Text note numberOfLines={1} style={styles.securityTextDetail}>{security_details.url}</Text>
                           <Text>Username</Text>
                           <Text note numberOfLines={1} style={styles.securityTextDetail}>{security_details.username}</Text>
                           <Text>Status</Text>
                           <Text note numberOfLines={1} style={styles.securityTextDetail}>{(security_details.current === true)? "Active": "Inactive"}</Text>
                       </View>

                       <View>
                           <Text style={styles.textHeader}>DATA SUBMISSION</Text>

                           <ListItem noindent>
                                 <Body  >
                                   <Text style={{marginLeft: 0}}>{(security_details.current)? "Deactivate Checkpoint": "Activate Checkpoint"}</Text>
                                 </Body>
                                 <Right>
                                       <Switch
                                             onValueChange = {this.toggleSwitch}
                                             value = {this.state.current}/>
                                 </Right>
                               </ListItem>

                           <TouchableOpacity
                           //                                        onPress={this.activeQR}
                           style={styles.buttonTouchableDanger}>
                               <Text style={styles.buttonTextStyle}>
                                   <Icon name="trash" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 10}}/>  Delete this scan
                               </Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.buttonTouchableSuccess}>
                                  <Text style={styles.buttonSubmitTextStyle}>
                                  <Icon name="sync" style={{fontSize: 22, textAlignVertical: 'center', marginTop: 10, color: '#ffd700'}}/>  Submit TravelCheck</Text>
                             </TouchableOpacity>

                       </View>


                   </Body>
                   </View>


               </CardItem>
             </Card>
      </View>
    );
  }
}

export default SecurityDetails;