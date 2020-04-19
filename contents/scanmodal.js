import React, { Component,useState } from 'react';
import {Modal, View, Text,TouchableHighlight } from 'react-native';
export default class ScanModal extends Component {
  render() {
    const [modalVisible, setModalVisible] = useState(false);
    return (
        <View>
            <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => {
                      Alert.alert("Modal has been closed.");
                    }}
            >
                <View>
                    <View >
                        <Text>Item Detail</Text>
                        <TouchableHighlight
                            onPress={() => { this.props.onDismiss() }}>
                            <Text>Close</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        </View>
    );
  }
}