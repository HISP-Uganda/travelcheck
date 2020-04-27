import React, { Component } from 'react';
import { Button, View, Text } from 'react-native';
import styles from '../styles/styles';

class Home extends Component {

  render() {
    const { navigation, route } = this.props;

    const { scan_id } = route.params.params;
    const { details } = route.params.params;
//    console.log();
    const scan_details = JSON.parse(details);
    console.log(scan_details.uuid);
    return (
      <View style={styles.scrollViewStyle}>
           <View style={{ flex: 1, alignItems: 'center', height: '100%', paddingTop: 0,textAlignVertical: 'top'}}>
               <Text style={styles.textTitle}>{scan_details.full_name}</Text>
               <Text numberOfLines={8} style={styles.descText}>{scan_details.point_of_entry}</Text>
            </View>
      </View>
    );
  }
}

export default Home;