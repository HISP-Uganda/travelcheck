import React, { Component } from 'react';
import { Container, Content, Footer, FooterTab, Button, Icon, Text } from 'native-base';
import About from './settings/about';
import Checkpoints from './settings/checkpoint';
import Security from './settings/security';

export default class Options extends Component {
    constructor(props){
        super(props);
        this.state = {
          selectedTab: 'about'
        };
    }
    renderSelectedTab () {
        switch (this.state.selectedTab) {
          case 'security':
            return (<Security />);
            break;
          case 'checkpoints':
            return (<Checkpoints />);
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
                        <Button active={this.state.selectedTab==='security'} onPress={() => this.setState({selectedTab: 'security'})}>
                           <Text>Security</Text>
                            <Icon name='lock' />
                        </Button>
                        <Button active={this.state.selectedTab==='checkpoints'} onPress={() => this.setState({selectedTab: 'checkpoints'})}>
                            <Text>Checkpoints</Text>
                            <Icon name='ios-compass' />
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