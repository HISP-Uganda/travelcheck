import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Switch} from 'react-native';
import {Card, CardItem, Body, Right, ListItem, Icon} from 'native-base';
import styles from '../styles/styles';

class CheckpointDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: null,
      checkpoint_details: {},
    };
  }

  componentDidMount = () => {
    const {route} = this.props;
    const {details} = route.params.params;
    console.log('DETAILS: ' + details);
    const checkpoint_details = JSON.parse(details);
    console.log(checkpoint_details);
    this.setState({current: checkpoint_details.current});
    this.setState({checkpoint_details: checkpoint_details});
  };

  toggleSwitch = (value) => {
    this.setState({current: value});
    const checkpoint = this.state.checkpoint_details;
    console.log(checkpoint);
  };

  render() {
    const {checkpoint_details} = this.state;

    return (
      <View style={styles.scrollViewStyle}>
        <Card
          style={{
            height: '100%',
            backgroundColor: 'yellow',
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0,
            marginBottom: 0,
          }}>
          <CardItem
            header
            bordered
            style={{
              backgroundColor: '#ffd700',
              height: '10%',
              alignItems: 'center',
            }}>
            <Text style={styles.detailedTextTitle}>
              {checkpoint_details.name}
            </Text>
          </CardItem>
          <CardItem bordered style={{height: '90%'}}>
            <View style={{flex: 1}}>
              <Body>
                <View>
                  <Text style={styles.textHeader}>CHECKPOINT DETAILS</Text>
                  <Text>Scan Point</Text>
                  <Text note numberOfLines={1} style={styles.textDetail}>
                    {checkpoint_details.scan_point}
                  </Text>
                  <Text>Status</Text>
                  <Text note numberOfLines={1} style={styles.textDetail}>
                    {checkpoint_details.current === true
                      ? 'Active'
                      : 'Inactive'}
                  </Text>
                </View>

                <View>
                  <Text style={styles.textHeader}>DATA SUBMISSION</Text>

                  <ListItem noindent>
                    <Body>
                      <Text style={{marginLeft: 0}}>
                        {checkpoint_details.current
                          ? 'Deactivate Checkpoint'
                          : 'Activate Checkpoint'}
                      </Text>
                    </Body>
                    <Right>
                      <Switch
                        onValueChange={this.toggleSwitch}
                        value={this.state.current}
                      />
                    </Right>
                  </ListItem>

                  <TouchableOpacity
                    //                                        onPress={this.activeQR}
                    style={styles.buttonTouchableDanger}>
                    <Text style={styles.buttonTextStyle}>
                      <Icon
                        name="trash"
                        style={{
                          fontSize: 18,
                          textAlignVertical: 'center',
                          marginTop: 10,
                        }}
                      />{' '}
                      Delete this scan
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonTouchableSuccess}>
                    <Text style={styles.buttonSubmitTextStyle}>
                      <Icon
                        name="sync"
                        style={{
                          fontSize: 22,
                          textAlignVertical: 'center',
                          marginTop: 10,
                          color: '#ffd700',
                        }}
                      />{' '}
                      Submit TravelCheck
                    </Text>
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

export default CheckpointDetails;
