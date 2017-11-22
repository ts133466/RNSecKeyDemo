/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import RNSecKey from 'RNSecKey';
import * as api from './src/api/api';

export default class RNSecKeyDemo extends Component {

  constructor(props) {
    super(props);
    this.generateKey = this.generateKey.bind(this);
    this.getSignature = this.getSignature.bind(this);
    this.getDeviceName = this.getDeviceName.bind(this);
    this.getDeviceVersion = this.getDeviceVersion.bind(this);
    this.checkEligibility = this.checkEligibility.bind(this);
    this.getDeviceId = this.getDeviceId.bind(this);
    this.removeDeviceId = this.removeDeviceId.bind(this);
    this.saveDeviceId = this.saveDeviceId.bind(this);
    this.removeDeviceId = this.removeDeviceId.bind(this);
    this.register = this.register.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.state = {
      deviceName: null,
      deviceVersion: null,
      isEligible: false,
      deviceId: null,
    }
    this.getDeviceName();
    this.getDeviceVersion();
    this.checkEligibility();
    this.getDeviceId();
    console.log(RNSecKey);
  }

  register() {
    const { isEligible } = this.state;
    if (!isEligible) {
      return alert(`Your device is not Eligible for Trusted Device`);
    }
    this.getRegistrationData().then((registrationData) => {
      console.log(registrationData);
      api.subscribeTrustedDevice(registrationData).then((response) => {
        console.log(response);
        if (response.data.status === 'SUCCESS') {
          const deviceId = response.data.message;
          this.setState({ deviceId: deviceId });
          this.saveDeviceId(deviceId);
        }

        alert(response.data.status);
      }).catch((e) => {
        console.log(e);
      });
    });
  }

  authenticate() {
    const data = {
      accountId: 'TANBOONKIAT',
      clientIp: '123.123.123.123',
      serverIp: '123.123.123.123',
      isMobile: true,
      userType: 'CLI',
      platform: 'FHK',
      countryCode: 'HK',
    }
    api.listSubscribedDevice(data).then((response) => {
      const { deviceId } = this.state;
      if (!deviceId) {
        alert('unauthorized');
        return;
      }
      console.log(response.data);
      let isRegistered = false;
      if(response.data instanceof Array){
        response.data.forEach((item) => {
          console.log(item);
          if(deviceId === item.deviceId){
            isRegistered = true;
          }
        });
      }

      if (isRegistered) {
        data.deviceId = deviceId;
        api.requestNonce(data).then((res) => {
          console.log(res);

          if (res.data.status === 'SUCCESS') {
            this.setState({ nonce: res.data.message });
            return this.authenticateFingerprint(res.data.message);
          }
          alert('Failed to request nonce');
        })
      } else {
        alert('Not Registered');
      }
    });
  }

  authenticateFingerprint(a) {
    const { nonce, deviceId } = this.state;
    console.log(nonce);
    RNSecKey.getSignature(nonce, (err, res) => {
      if (err) {
        return alert(err);
      }
      const signature = res;

      const data = {
        accountId: 'TANBOONKIAT',
        signedNonce: signature,
        deviceId,
        clientIp: '123.123.123.123',
        serverIp: '123.123.123.123',
        isMobile: true,
        platform: 'FHK',
        countryCode: 'HK',
        userType: 'CLI',
      };

      api.authenticateFingerprint(data).then((response) => {
        console.log(response);
        alert(`authenticate ${response.data.status.toLowerCase()}`);
      });
    })

  }

  alert(message){
    Alert.alert(
      'Trusted Device',
      message,
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
    );
  }

  getRegistrationData() {
    return new Promise((resolve, reject) => {
      let devicePublicKey;
      let deviceName;
      let deviceVersion;
      RNSecKey.getPublicKey((err, res) => {
        devicePublicKey = res;
        RNSecKey.getDeviceName((err, res) => {
          deviceName = res;
          RNSecKey.getDeviceVersion((err, res) => {
            deviceVersion = res;
            console.log(devicePublicKey, deviceName, deviceVersion);
            const data = {
              devicePublicKey,
              countryCode: 'HK',
              userType: 'CLI',
              platform: 'FHK',
              isMobile: true,
              accountId: 'TANBOONKIAT',
              clientIp: '123.123.123.123',
              serverIp: '123.123.123.123',
              deviceVersion,
              deviceType: 'ios',
              deviceName,
            };
            resolve(data);
          });
        });
      });
    });
  }

  renderRegisterButton() {
    return (
      <TouchableOpacity onPress={this.register}>
        <Text>Register Trusted Device</Text>
      </TouchableOpacity>
    );
  }

  renderAuthenticateButton() {
    return (
      <TouchableOpacity onPress={this.authenticate}>
        <Text>Authenticate with Trusted Device</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { deviceName, deviceVersion } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        {deviceName && deviceVersion && this.renderDeviceDetails()}
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <TouchableOpacity onPress={this.generateKey}>
          <Text>Generate</Text>
        </TouchableOpacity>
        {this.renderRegisterButton()}
        {this.renderAuthenticateButton()}
        <TouchableOpacity onPress={this.getPublicKey}>
          <Text>get public key</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.removeDeviceId}>
          <Text>REMOVE DEVICE ID</Text>
        </TouchableOpacity>
        {this.renderEligibleDetails()}
        {this.renderDeviceId()}
      </View>
    );
    // <TouchableOpacity onPress={this.saveDeviceId}>
    //   <Text>SAVE DEVICE ID</Text>
    // </TouchableOpacity>
  }

  renderDeviceId() {
    const { deviceId } = this.state;
    return (
      <Text>{deviceId != null ? deviceId : '-'}</Text>
      );
  }

  renderEligibleDetails() {
    let { isEligible } = this.state;
    return (
      <Text>
        {isEligible ? 'Your device is supported' : 'Your device is not supported'}
      </Text>
    )

  }

  renderDeviceDetails() {
    const { deviceName, deviceVersion } = this.state;
    console.log('renderDeviceDetails');
    return (
      <Text style={styles.welcome}>
        My Device is {deviceName} ({Platform.OS === 'ios' ? `iOS ${deviceVersion}` : `Android ${deviceVersion}`})
      </Text>
    );
  }

  checkEligibility() {
    RNSecKey.isEligibleForFingerprint((err, res) => {
      console.log(res);
      this.setState({
        isEligible: res
      });
    });
  }

  getSignature() {
    RNSecKey.getSignature("1234567890", (err, res) => {
      if(err){
        Alert.alert(
          'Signature',
          `${res} (${err})`,
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        );
        return;
      }
      this.setState({ signature: res });
      Alert.alert(
        'Signature',
        res,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      );
    });
  }

  generateKey() {
    RNSecKey.generateKey((err, res) => {
      if(err){
        console.log(err);
        return;
      }
      Alert.alert(
        'Success',
        'created',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      );
    });
  }

  getPublicKey() {
    RNSecKey.getPublicKey((err, res) => {
      if(err){
        Alert.alert(
          'Error',
          res,
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        );
        return;
      }
      Alert.alert(
        'Public Key',
        res,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      );
    });
  }

  getDeviceName() {
    RNSecKey.getDeviceName((err, res) => {
      console.log(res);
      this.setState({deviceName: res});
    });
  }

  getDeviceVersion() {
    RNSecKey.getDeviceVersion((err, res) => {
      console.log(res);
      this.setState({deviceVersion: res});
    });
  }

  getDeviceId() {
    RNSecKey.getDeviceId((err, res) => {
      console.log(res);
      this.setState({deviceId: res});
    });
  }

  saveDeviceId(deviceId){
    RNSecKey.saveDeviceId(deviceId, (err, res) => {
      console.log(err, res);
      if(!err){
        this.getDeviceId();
      }
    });
  }

  removeDeviceId() {
    RNSecKey.removeDeviceId((err, res) => {
      console.log(err, res);
      this.setState({deviceId: null});
    });
  }

  removeKeyPair() {
    RNSecKey.removeKeyPair((err, res) => {
      if(err){
        Alert.alert(
          'Error',
          res,
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        );
        return;
      }
      Alert.alert(
        'Remove key pair',
        'success',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      );
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

if (__DEV__) {
  global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
}

AppRegistry.registerComponent('RNSecKeyDemo', () => RNSecKeyDemo);
