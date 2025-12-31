import React, { Component } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckLogin, Login } from '../api/api';

type Props = NativeStackScreenProps<RootStackParamList, 'SplashScreen'>;

class SplashScreen extends Component<Props> {
  timer?: NodeJS.Timeout;

  componentDidMount() {
    this.checkLogin();
    // this.timer = setTimeout(() => {
    //   this.props.navigation.replace('LoginScreen');
    // }, 3000);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  checkLogin = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const password = await AsyncStorage.getItem('password');

      if (username && password) {
        try {
          const result = await CheckLogin(username, password);
          console.log('Login response:', result);

          if (result.status === 'LoginSuccess') {
            await AsyncStorage.setItem('username', username);
            await AsyncStorage.setItem('password', password);
            // Save tokens and user data

            await AsyncStorage.setItem('emp_Name', result.emp_Name);
            await AsyncStorage.setItem('photo', result.photo);
            this.props.navigation.replace('DrawerNavigator', {
              emp_Name: result.emp_Name,
              photo: result.photo,
            });
          }
        } catch (error) {
          console.error('Error during login:', error);
          this.props.navigation.replace('LoginScreen');
        }
      } else {
        this.props.navigation.replace('LoginScreen');
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      this.props.navigation.replace('LoginScreen');
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <Image
          source={require('../assets/images/logo_lumify.jpg')}
          style={styles.logo}
          resizeMode="cover"
        />
      </View>
    );
  }
}

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161718ff',
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 12,
  },
});
