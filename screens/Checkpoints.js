import React, {Component} from 'react';
import {
  Container,
  Content,
  List,
  ListItem,
  Body,
  Right,
  Text,
  Icon,
} from 'native-base';
import {TouchableOpacity} from 'react-native';
import moment from 'moment';
import styles from '../styles/styles';

export default class Checkpoints extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkpoints: {},
    };
  }

  componentDidMount = () => {
    const CheckpointSchema = {
      name: 'Checkpoint',
      properties: {
        name: 'string',
        scan_point: 'string',
        date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
        current: {type: 'bool', default: true},
      },
    };

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      Realm.open({
        schema: [CheckpointSchema],
      }).then((realm) => {
        const data = realm.objects('Checkpoint').sorted('current', true);
        this.setState({checkpoints: data});
        this.setState({db: realm});
        realm.close();
      });
    });
  };

  listIcon = () => {
    let icon = '';
    const scan_point = this.state.scan_point;
    switch (scan_point) {
      case 'arrival':
        icon = 'eye';
        break;
      case 'lab':
        icon = '';
        break;
      case 'clearance':
        icon = '';
        break;
      case 'checkpoint':
        icon = '';
        break;
      case 'exit':
        icon = 'exit';
        break;
      default:
        icon = icon;
    }
  };

  componentWillUnmount = () => {
    this._unsubscribe();
  };

  render() {
    const checkpointscans = this.state.checkpoints;
    const data = Array.from(checkpointscans);
    const {navigation} = this.props;

    return (
      <Container>
        <Content>
          <List>
            {Object.keys(data).map(function (key) {
              const checkpointDetails = JSON.stringify(data[key]);
              return (
                <ListItem
                  key={key}
                  icon
                  button={true}
                  style={{paddingLeft: 0, marginTop: 5}}
                  onPress={() =>
                    navigation.navigate('CheckpointDetails', {
                      screen: 'CheckpointDetails',
                      params: {details: checkpointDetails},
                    })
                  }>
                  <Body>
                    <Text
                      style={{
                        textTransform: 'uppercase',
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}>
                      {data[key].name + ' (' + data[key].scan_point + ')'}
                    </Text>
                    <Text note>
                      {moment(data[key].date_created).format(
                        'dddd MMM Do YYYY',
                      )}
                    </Text>
                  </Body>
                  <Right style={{alignItems: 'center'}}>
                    <Text note>{}</Text>
                    <Icon
                      name={
                        data[key].current == true
                          ? 'radio-button-on'
                          : 'radio-button-off'
                      }
                      style={{
                        color:
                          data[key].current == true ? '#ffd700' : '#AEB6BF',
                        fontSize: 24,
                      }}
                    />
                    ;
                  </Right>
                </ListItem>
              );
            })}
          </List>
        </Content>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('AddCheckpoint', {screen: 'AddCheckpoint'})
          }
          style={styles.touchableOpacityStyle}>
          <Icon name="add" />
        </TouchableOpacity>
      </Container>
    );
  }
}
