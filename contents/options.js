import React, { Component } from 'react';
import { Container, Content, Footer, FooterTab, Button, Icon, Text } from 'native-base';
import About from './settings/about';
import NewPoint from './settings/checkpoint';
import Checkpoints from './settings/checkpoints';

export default class Options extends Component {
    constructor(props){
        super(props);
        this.state = {
          selectedTab: 'newpoint'
        };
    }
    renderSelectedTab () {
        switch (this.state.selectedTab) {
          case 'checkpoints':
            return (<Checkpoints />);
            break;
          case 'newpoint':
            return (<NewPoint />);
            break;
          case 'about':
            return (<About />);
            break;
          default:
        }
    }

    render() {
        return (
            <Container>
                <Content>
                    {this.renderSelectedTab()}
                </Content>
                <Footer >
                    <FooterTab style={{backgroundColor: '#D6E4FF', color: '#1939B7'}}>

                        <Button active={this.state.selectedTab==='checkpoints'} onPress={() => this.setState({selectedTab: 'checkpoints'})}>
                            <Text>Checkpoints</Text>
                            <Icon name='map' />
                        </Button>
                        <Button active={this.state.selectedTab==='newpoint'} onPress={() => this.setState({selectedTab: 'newpoint'})}>
                            <Text>New Point</Text>
                            <Icon name='ios-add' />
                        </Button>
                        <Button active={this.state.selectedTab==='about'} onPress={() => this.setState({selectedTab: 'about'})}>
                            <Text>About</Text>
                            <Icon name='information-circle' />
                        </Button>
                    </FooterTab>
                </Footer>
            </Container>
        );
    }
}