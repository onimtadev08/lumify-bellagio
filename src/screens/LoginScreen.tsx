// screens/LoginScreen.tsx
import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Login } from '../api/api';

type Props = NativeStackScreenProps<RootStackParamList, 'LoginScreen'>;

interface State {
  username: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
  isDarkMode: boolean;
  biometricsEnabled: boolean;
  biometricsAvailable: boolean;
  biometricType: string;
}

const rnBiometrics = new ReactNativeBiometrics();

class LoginScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      rememberMe: false,
      loading: false,
      isDarkMode: true,
      biometricsEnabled: false,
      biometricsAvailable: false,
      biometricType: 'Biometric',
    };
  }

  async componentDidMount() {
    // Check biometric availability
    await this.checkBiometrics();

    // Load saved preferences
    try {
      const rememberedUsername = await AsyncStorage.getItem(
        'rememberedUsername',
      );
      const rememberedPassword = await AsyncStorage.getItem(
        'rememberedPassword',
      );
      const savedTheme = await AsyncStorage.getItem('themeMode');
      const biometricsEnabled = await AsyncStorage.getItem('biometricsEnabled');

      this.setState({
        username: rememberedUsername || '',
        password: rememberedPassword || '',
        rememberMe: !!(rememberedUsername && rememberedPassword),
        isDarkMode: savedTheme !== 'light',
        biometricsEnabled: biometricsEnabled === 'true',
      });

      // Auto-trigger biometric login if enabled and credentials exist
      if (
        biometricsEnabled === 'true' &&
        rememberedUsername &&
        rememberedPassword
      ) {
        setTimeout(() => this.handleBiometricLogin(), 500);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }

  checkBiometrics = async () => {
    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();

      if (available) {
        let typeName = 'Biometric';
        if (biometryType === BiometryTypes.FaceID) {
          typeName = 'Face ID';
        } else if (biometryType === BiometryTypes.TouchID) {
          typeName = 'Touch ID';
        } else if (biometryType === BiometryTypes.Biometrics) {
          typeName = 'Biometric';
        }

        this.setState({
          biometricsAvailable: true,
          biometricType: typeName,
        });
        console.log('Biometric type available:', typeName);
      }
    } catch (error) {
      console.log('Biometrics not available:', error);
      this.setState({ biometricsAvailable: false });
    }
  };

  handleBiometricLogin = async () => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirm fingerprint',
        cancelButtonText: 'Cancel',
      });

      if (success) {
        // If authentication successful, proceed with login
        const username = await AsyncStorage.getItem('rememberedUsername');
        const password = await AsyncStorage.getItem('rememberedPassword');

        if (username && password) {
          this.setState({ username, password }, () => {
            this.onLoginPress();
          });
        }
      } else {
        console.log('Biometric authentication cancelled or failed');
      }
    } catch (error) {
      console.log('Biometric authentication error:', error);
      Alert.alert(
        'Authentication Error',
        'Unable to authenticate with biometrics',
      );
    }
  };

  toggleTheme = async () => {
    const newMode = !this.state.isDarkMode;
    this.setState({ isDarkMode: newMode });
    await AsyncStorage.setItem('themeMode', newMode ? 'dark' : 'light');
  };

  toggleBiometrics = async () => {
    const newValue = !this.state.biometricsEnabled;

    if (newValue && !this.state.rememberMe) {
      Alert.alert(
        'Remember Me Required',
        'Please enable "Remember me" to use biometric login',
        [{ text: 'OK' }],
      );
      return;
    }

    this.setState({ biometricsEnabled: newValue });
    await AsyncStorage.setItem('biometricsEnabled', newValue.toString());
  };

  onLoginPress = async () => {
    const { username, password, rememberMe } = this.state;
    const { navigation } = this.props;

    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    this.setState({ loading: true });

    try {
      const result = await Login(username, password);
      console.log('Login response:', result);

      if (result.status === 'LoginSuccess') {
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('password', password);
        // Save tokens and user data
        await AsyncStorage.setItem('token', result.token);
        await AsyncStorage.setItem('refreshToken', result.refreshToken);
        await AsyncStorage.setItem('emp_Name', result.emp_Name);
        await AsyncStorage.setItem('photo', result.photo);

        if (rememberMe) {
          await AsyncStorage.setItem('rememberedUsername', username);
          await AsyncStorage.setItem('rememberedPassword', password);
        } else {
          await AsyncStorage.removeItem('rememberedUsername');
          await AsyncStorage.removeItem('rememberedPassword');
          await AsyncStorage.setItem('biometricsEnabled', 'false');
          this.setState({ biometricsEnabled: false });
        }

        // Navigate to DrawerNavigator with user data
        navigation.replace('DrawerNavigator', {
          emp_Name: result.emp_Name,
          photo: result.photo,
        });
      } else {
        Alert.alert('Login Failed', 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      username,
      password,
      rememberMe,
      loading,
      isDarkMode,
      biometricsEnabled,
      biometricsAvailable,
      biometricType,
    } = this.state;
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* Theme Toggle */}
        <View style={styles.themeToggleContainer}>
          <TouchableOpacity
            onPress={this.toggleTheme}
            style={[
              styles.themeToggle,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Text style={{ fontSize: 20 }}>{isDarkMode ? '🌙' : '☀️'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Card Container */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBackground,
                shadowColor: theme.shadowColor,
              },
            ]}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/logo_bellagio.jpg')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Sign in Title */}
            <Text style={[styles.title, { color: theme.text }]}>Sign in</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Welcome back! Please enter your details.
            </Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                Username (Gaming Number)
              </Text>
              <TextInput
                placeholder="648"
                placeholderTextColor={theme.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.inputBorder,
                  },
                ]}
                value={username}
                onChangeText={text => this.setState({ username: text })}
                keyboardType="numeric"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Password (EPF Number)
                </Text>
                {/* <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity> */}
              </View>
              <TextInput
                placeholder="•••••"
                placeholderTextColor={theme.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.inputBorder,
                  },
                ]}
                secureTextEntry
                value={password}
                onChangeText={text => this.setState({ password: text })}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Remember me checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => this.setState({ rememberMe: !rememberMe })}
              disabled={loading}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, { color: theme.text }]}>
                Remember me
              </Text>
            </TouchableOpacity>

            {/* Biometric Toggle */}
            {biometricsAvailable && (
              <View style={styles.biometricContainer}>
                <View style={styles.biometricLeft}>
                  <Text style={styles.biometricIcon}>
                    {biometricType === 'Face ID' ? '👤' : '👁️'}
                  </Text>
                  <Text style={[styles.biometricLabel, { color: theme.text }]}>
                    Enable {biometricType} Login
                  </Text>
                </View>
                <Switch
                  value={biometricsEnabled}
                  onValueChange={this.toggleBiometrics}
                  trackColor={{ false: theme.switchTrackOff, true: '#B6771D' }}
                  thumbColor={biometricsEnabled ? '#fff' : '#f4f3f4'}
                  disabled={loading}
                />
              </View>
            )}

            {/* Sign in Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={this.onLoginPress}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Text>
            </TouchableOpacity>

            {/* Biometric Login Button */}
            {biometricsAvailable && biometricsEnabled && rememberMe && (
              <TouchableOpacity
                style={[
                  styles.biometricButton,
                  { borderColor: theme.inputBorder },
                ]}
                onPress={this.handleBiometricLogin}
                disabled={loading}
              >
                <Text style={styles.biometricButtonIcon}>
                  {biometricType === 'Face ID' ? '🔐' : '🔓'}
                </Text>
                <Text
                  style={[styles.biometricButtonText, { color: theme.text }]}
                >
                  Login with {biometricType}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const lightTheme = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1a1a1a',
  textSecondary: '#666666',
  inputBackground: '#F8F9FA',
  inputBorder: '#E0E0E0',
  placeholder: '#999999',
  shadowColor: '#000',
  switchTrackOff: '#D1D1D1',
};

const darkTheme = {
  background: '#1a1a1a',
  cardBackground: '#2a2a2a',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  inputBackground: '#3a3a3a',
  inputBorder: '#4a4a4a',
  placeholder: '#999999',
  shadowColor: '#000',
  switchTrackOff: '#3e3e3e',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggleContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    padding: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  logo: {
    width: '85%',
    height: '85%',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPassword: {
    color: '#4A90FF',
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A90FF',
    borderColor: '#4A90FF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  biometricContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  biometricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  biometricIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  biometricLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#B6771D',
    padding: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
  },
  biometricButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  biometricButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default LoginScreen;
