import React, { Component } from 'react';
import { View, Text,TouchableOpacity } from 'react-native';
import { Card, CardItem, Body,Left, Right, List, ListItem, Thumbnail, Button, Icon } from 'native-base';
import styles from '../styles/styles';
import moment from 'moment';

class ScanDetails extends Component {

  render() {
    const { navigation, route } = this.props;

    const { scan_id } = route.params.params;
    const { details } = route.params.params;
//    console.log();
    const scan_details = JSON.parse(details);
    console.log(scan_details);
    return (
      <View style={styles.scrollViewStyle}>
            <Card style={{height: '100%', backgroundColor: 'yellow', marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}>
                <CardItem header bordered style={{backgroundColor: '#ffd700', height: '10%', alignItems: 'center'}}>
                  <Text style={styles.detailedTextTitle}>{scan_details.full_name}</Text>
                </CardItem>
                <CardItem bordered style={{height: '90%'}} >
                    <View style={{flex: 1}}>
                    <Body>
                        <View>
                            <Text style={styles.textHeader}>POINT OF ENTRY DETAILS</Text>
                            <Text>Point of Entry</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{scan_details.point_of_entry}</Text>
                            <Text>Point of Entry ID</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{scan_details.poe_id}</Text>
                            <Text>Vehicle Number:</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{scan_details.vehicle}</Text>
                            <Text>Phone Number:</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{scan_details.phone_number}</Text>
                        </View>
                        <View>
                            <Text style={styles.textHeader}>CHECKPOINT DETAILS</Text>
                            <Text>Checkpoint Name:</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{scan_details.checkpoint}</Text>
                            <Text>Coordinate: </Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{"("+scan_details.latitude+","+scan_details.longitude+")"}</Text>
                        </View>
                        <View>
                            <Text style={styles.textHeader}>SCAN DETAILS</Text>
                            <Text>Scan Date:</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{moment(scan_details.scan_date).format("dddd MMM Do YYYY")+", "+scan_details.scan_time}</Text>
                        </View>

                        <View>
                            <Text style={styles.textHeader}>DATA SUBMISSION</Text>
                            <Text>Submitted to remote Server:</Text>
                            <Text note numberOfLines={1} style={styles.textDetail}>{(scan_details.submitted === true)? "Submitted": "Not Submitted"}</Text>
                            <View>
                                {
                                    (scan_details.submitted)? <TouchableOpacity
//                                        onPress={this.activeQR}
                                        style={styles.buttonTouchableDanger}>
                                            <Text style={styles.buttonTextStyle}>
                                                <Icon name="trash" style={{fontSize: 18, textAlignVertical: 'center', marginTop: 10}}/>  Delete this scan
                                            </Text>
                                        </TouchableOpacity>:<TouchableOpacity style={styles.buttonTouchableSuccess}>
                                           <Text style={styles.buttonSubmitTextStyle}>
                                           <Icon name="sync" style={{fontSize: 22, textAlignVertical: 'center', marginTop: 10, color: '#ffd700'}}/>  Submit TravelCheck</Text>
                                      </TouchableOpacity>
                                }
                            </View>

                        </View>


                    </Body>
                    </View>


                </CardItem>
              </Card>
      </View>
    );
  }
}

export default ScanDetails;