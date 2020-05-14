import React, {Component} from 'react';
import {
  Content,
  Text,
  View,
  Form,
  Label,
  Input,
  Item,
  ListItem,
  Body,
  Right,
} from 'native-base';
import {TouchableOpacity, Switch} from 'react-native';
import styles from '../styles/styles';
import Realm from 'realm';
import moment from 'moment';
import RNPickerSelect from 'react-native-picker-select';

export default class NewPoint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkpoint: '',
      currentCheckpoint: true,
      scan_point: '',
    };
  }

  onValueChange(value) {
    this.setState({
      selected: value,
    });
  }

  CheckpointSchema = {
    name: 'Checkpoint',
    properties: {
      name: 'string',
      scan_point: 'string',
      date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
      current: {type: 'bool', default: true},
    },
  };

  saveCheckpoint = async () => {
    const {navigation} = this.props;

    const checkpoint = this.state.checkpoint;
    const current = this.state.currentCheckpoint;
    const scan_point = this.state.scan_point;
    const created = moment().format('YYYY-MM-DD');

    let realmck;
    let newCheckpoint = {};
    try {
      realmck = await Realm.open({schema: [this.CheckpointSchema]});

      const current_checkpoint = realmck
        .objects('Checkpoint')
        .filtered('current == true');

      if (current_checkpoint.length > 0) {
        realmck.write(() => {
          current_checkpoint[0].current = false;
        });
      }
      realmck.write(() => {
        newCheckpoint = realmck.create('Checkpoint', {
          name: `${checkpoint}`,
          scan_point: `${scan_point}`,
          date_created: `${created}`,
          current: current,
        });
      });
      realmck.close();
      newCheckpoint ? navigation.goBack() : null;
    } catch (e) {
      console.log(e.message);
    }
  };

  toggleSwitch = (value) => {
    this.setState({currentCheckpoint: value});
  };
  render() {
    return (
      <Content>
        <View style={{flex: 1}}>
          <Text style={styles.textTitle}>Add new Scan point here</Text>
          <Form>
            <Item stackedLabel>
              <Label>Checkpoint Name</Label>
              <Input
                placeholder="Checkpoint Name"
                placeholderTextColor="#E0E1ED"
                onChangeText={(text) => {
                  this.setState({checkpoint: text});
                }}
                value={this.state.text}
              />
            </Item>
            <Label style={{marginLeft: 16, marginBottom: 0}}>
              Specify scan point
            </Label>
            <RNPickerSelect
              onValueChange={(value) => this.setState({scan_point: value})}
              items={[
                {label: 'Returning Travelers', value: 'default'},
                {label: 'At Entry point', value: 'arrival'},
                {label: 'In the Laboratory', value: 'laboratory'},
                {label: 'At Clearance point', value: 'clearance'},
                {label: 'At Incountry Checkpoint', value: 'checkpoint'},
                {label: 'At Exit point', value: 'exit'},
              ]}
            />

            <ListItem noindent>
              <Body>
                <Text style={{marginLeft: 0}}>Current Checkpoint</Text>
              </Body>
              <Right>
                <Switch
                  onValueChange={this.toggleSwitch}
                  value={this.state.currentCheckpoint}
                />
              </Right>
            </ListItem>
          </Form>
        </View>
        <View style={{alignItems: 'center'}}>
          <TouchableOpacity
            onPress={this.saveCheckpoint}
            style={styles.buttonTouchable}>
            <Text style={styles.buttonTextStyle}>Save Checkpoint</Text>
          </TouchableOpacity>
        </View>
      </Content>
    );
  }
}
