import React, {Component} from 'react';
import {TouchableOpacity} from 'react-native';
import {
  Icon,
  Text,
  Container,
  Content,
  List,
  ListItem,
  Body,
  Right,
} from 'native-base';
import styles from '../styles/styles';
import moment from 'moment';

class Security extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dhis_settings: {},
    };
  }

  componentDidMount = () => {
    const SecuritySchema = {
      name: 'Security',
      properties: {
        instance: 'string',
        description: 'string',
        url: 'string',
        username: 'string',
        password: 'string',
        date_created: {type: 'date', default: moment().format('YYYY-MM-DD')},
        current: {type: 'bool', default: true},
      },
    };

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      Realm.open({
        schema: [SecuritySchema],
      }).then((realm) => {
        const data = realm.objects('Security').sorted('current', true);
        this.setState({dhis_settings: data});
        this.setState({db: realm});
        realm.close();
      });
    });
  };

  componentWillUnmount = () => {
    this._unsubscribe();
  };

  render() {
    const {navigation} = this.props;
    const instances = this.state.dhis_settings;
    const data = Array.from(instances);

    return (
      <Container>
        <Content>
          <List>
            {Object.keys(data).map(function (key) {
              const securityDetails = JSON.stringify(data[key]);
              return (
                <ListItem
                  key={key}
                  icon
                  button={true}
                  style={{paddingLeft: 0, marginTop: 5}}
                  onPress={() =>
                    navigation.navigate('SecurityDetails', {
                      screen: 'SecurityDetails',
                      params: {details: securityDetails},
                    })
                  }>
                  <Body>
                    <Text
                      style={{
                        textTransform: 'uppercase',
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}>
                      {data[key].instance}
                    </Text>
                    <Text note>{data[key].url}</Text>
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
            navigation.navigate('DHIS2Setting', {screen: 'DHIS2Setting'})
          }
          style={styles.touchableOpacityStyle}>
          <Icon name="add" />
        </TouchableOpacity>
      </Container>
    );
  }
}

export default Security;
