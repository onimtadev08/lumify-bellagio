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
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Login } from '../api/api';
import Feather from '@react-native-vector-icons/feather';
import MessageBox from '../Components/MessageBox';
import Loader from '../Components/Loader';
import OTP from '../Components/OTP';
import { ColorSecond, MessageType } from '../data/data';
import { ThemeContext } from '../contexts/ThemeContext';
import { Color } from 'react-native/types_generated/Libraries/Animated/AnimatedExports';

type Props = NativeStackScreenProps<RootStackParamList, 'LoginScreen'>;

interface State {
  username: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
  biometricsEnabled: boolean;
  biometricsAvailable: boolean;
  biometricType: string;
  showPassword: boolean; // Added this
  // OTP state
  showOTP: boolean;
  pendingLoginData: any | null;
  // MessageBox state
  showMessage: boolean;
  messageText: string;
  messageType: MessageType;
  showYesNo: boolean;
  onYesCallback?: () => void;
  onNoCallback?: () => void;
  otp: string;
}

const rnBiometrics = new ReactNativeBiometrics();

class LoginScreen extends Component<Props, State> {
  static contextType = ThemeContext;
  context!: React.ContextType<typeof ThemeContext>;

  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      rememberMe: false,
      loading: false,
      biometricsEnabled: false,
      biometricsAvailable: false,
      biometricType: 'Biometric',
      showPassword: false, // Added this
      showOTP: false,
      pendingLoginData: null,
      showMessage: false,
      messageText: '',
      messageType: 'info',
      showYesNo: false,
      otp: '',
    };
  }

  async componentDidMount() {
    await this.checkBiometrics();

    try {
      const rememberedUsername = await AsyncStorage.getItem(
        'rememberedUsername',
      );
      const rememberedPassword = await AsyncStorage.getItem(
        'rememberedPassword',
      );
      const biometricsEnabled = await AsyncStorage.getItem('biometricsEnabled');

      this.setState({
        username: rememberedUsername || '',
        password: rememberedPassword || '',
        rememberMe: !!(rememberedUsername && rememberedPassword),
        biometricsEnabled: biometricsEnabled === 'true',
      });

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

  showMessageBox = (
    message: string,
    type: MessageType,
    showYesNo: boolean = false,
    onYes?: () => void,
    onNo?: () => void,
  ) => {
    this.setState({
      showMessage: true,
      messageText: message,
      messageType: type,
      showYesNo,
      onYesCallback: onYes,
      onNoCallback: onNo,
    });
  };

  hideMessageBox = () => {
    this.setState({
      showMessage: false,
      messageText: '',
      showYesNo: false,
      onYesCallback: undefined,
      onNoCallback: undefined,
    });
  };

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
      this.showMessageBox('Unable to authenticate with biometrics', 'error');
    }
  };

  toggleBiometrics = async () => {
    const newValue = !this.state.biometricsEnabled;

    if (newValue && !this.state.rememberMe) {
      this.showMessageBox(
        'Please enable "Remember me" to use biometric login',
        'info',
      );
      return;
    }

    this.setState({ biometricsEnabled: newValue });
    await AsyncStorage.setItem('biometricsEnabled', newValue.toString());
  };

  togglePasswordVisibility = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };

  onLoginPress = async () => {
    const { username, password } = this.state;

    if (!username.trim()) {
      this.showMessageBox('Please enter your username', 'error');
      return;
    }
    if (!password.trim()) {
      this.showMessageBox('Please enter your password', 'error');
      return;
    }

    this.setState({ loading: true });

    try {
      const result = await Login(username, password);
      console.log('Login response:', result);

      if (result.status === 'LoginSuccess') {
        // Skip OTP for test account
        if (username === '648' && password === '86106') {
          this.setState({ loading: false, pendingLoginData: result });
          await this.handleOTPVerify('9999'); // Auto-verify
        } else {
          // Store pending login data and show OTP
          this.setState({
            loading: false,
            showOTP: true,
            pendingLoginData: result,
            otp: result.otp || '9999',
          });
        }
      } else {
        this.setState({ loading: false });
        this.showMessageBox('Invalid username or password', 'error');
      }
    } catch (error) {
      this.showMessageBox('Network error. Please try again.', 'error');
      console.error('Login error:', error);
      this.setState({ loading: false });
    }
  };

  handleOTPVerify = async (otp: string) => {
    const { pendingLoginData, username, password, rememberMe } = this.state;
    const { navigation } = this.props;

    if (!pendingLoginData) return;

    try {
      // Save credentials
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('password', password);
      await AsyncStorage.setItem('token', pendingLoginData.token);
      await AsyncStorage.setItem('refreshToken', pendingLoginData.refreshToken);
      await AsyncStorage.setItem('emp_Name', pendingLoginData.emp_Name);
      await AsyncStorage.setItem('photo', pendingLoginData.photo);

      if (rememberMe) {
        await AsyncStorage.setItem('rememberedUsername', username);
        await AsyncStorage.setItem('rememberedPassword', password);
      } else {
        await AsyncStorage.removeItem('rememberedUsername');
        await AsyncStorage.removeItem('rememberedPassword');
        await AsyncStorage.setItem('biometricsEnabled', 'false');
        this.setState({ biometricsEnabled: false });
      }

      // Close OTP modal and navigate
      this.setState({ showOTP: false, pendingLoginData: null });

      navigation.replace('DrawerNavigator', {
        emp_Name: pendingLoginData.emp_Name,
        photo: pendingLoginData.photo,
      });
    } catch (error) {
      console.error('Error saving data:', error);
      this.showMessageBox(
        'Failed to complete login. Please try again.',
        'error',
      );
    }
  };

  handleOTPClose = () => {
    this.setState({
      showOTP: false,
      pendingLoginData: null,
    });
  };

  render() {
    const {
      username,
      password,
      rememberMe,
      loading,
      biometricsEnabled,
      biometricsAvailable,
      biometricType,
      showPassword,
      showOTP,
      showMessage,
      messageText,
      messageType,
      showYesNo,
      onYesCallback,
      onNoCallback,
    } = this.state;

    const { theme, isDarkMode, toggleTheme } = this.context;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.wrapper}>
            {/* Theme Toggle */}
            <View style={styles.themeToggleContainer}>
              <TouchableOpacity
                onPress={toggleTheme}
                style={[
                  styles.themeToggle,
                  { backgroundColor: theme.cardBackground },
                ]}
              >
                <Feather
                  name={isDarkMode ? 'moon' : 'sun'}
                  size={24}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>
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
                  <Text style={[styles.title, { color: theme.text }]}>
                    Log in
                  </Text>
                  <Text
                    style={[styles.subtitle, { color: theme.textSecondary }]}
                  >
                    Welcome back! Please enter your details.
                  </Text>

                  {/* Username Input */}
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Username (Gaming Number)
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Feather
                        name="user"
                        size={20}
                        color={theme.placeholder}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="Username"
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
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.label, { color: theme.text }]}>
                        Password (EPF Number)
                      </Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <Feather
                        name="lock"
                        size={20}
                        color={theme.placeholder}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="Password"
                        placeholderTextColor={theme.placeholder}
                        style={[
                          styles.input,
                          styles.inputWithEye,
                          {
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.inputBorder,
                          },
                        ]}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={text => this.setState({ password: text })}
                        autoCapitalize="none"
                        editable={!loading}
                      />
                      <TouchableOpacity
                        onPress={this.togglePasswordVisibility}
                        style={styles.eyeButton}
                        disabled={loading}
                      >
                        <Feather
                          name={showPassword ? 'eye' : 'eye-off'}
                          size={20}
                          color={theme.placeholder}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Remember me checkbox */}
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => this.setState({ rememberMe: !rememberMe })}
                    disabled={loading}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: rememberMe
                            ? ColorSecond
                            : theme.inputBackground,
                          borderColor: rememberMe
                            ? ColorSecond
                            : theme.inputBorder,
                        },
                      ]}
                    >
                      {rememberMe && (
                        <Feather name="check" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: theme.text }]}>
                      Remember me
                    </Text>
                  </TouchableOpacity>

                  {/* Biometric Toggle */}
                  {biometricsAvailable && (
                    <View style={styles.biometricContainer}>
                      <View style={styles.biometricLeft}>
                        <Feather
                          name={
                            biometricType === 'Face ID' ? 'user-check' : 'eye'
                          }
                          size={20}
                          color={theme.text}
                          style={styles.biometricIcon}
                        />
                        <Text
                          style={[styles.biometricLabel, { color: theme.text }]}
                        >
                          Enable {biometricType} Login
                        </Text>
                      </View>
                      <Switch
                        value={biometricsEnabled}
                        onValueChange={this.toggleBiometrics}
                        trackColor={{
                          false: theme.switchTrackOff,
                          true: '#B6771D',
                        }}
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
                    {!loading && (
                      <Feather
                        name="log-in"
                        size={18}
                        color="#fff"
                        style={styles.buttonIcon}
                      />
                    )}
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
                      <Feather
                        name="shield"
                        size={18}
                        color={theme.text}
                        style={styles.biometricButtonIcon}
                      />
                      <Text
                        style={[
                          styles.biometricButtonText,
                          { color: theme.text },
                        ]}
                      >
                        Login with {biometricType}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>

        {/* Loader */}
        <Loader isShow={loading} />

        {/* OTP Modal */}
        <OTP
          visible={showOTP}
          onVerify={this.handleOTPVerify}
          onClose={this.handleOTPClose}
          title="OTP Verification"
          subtitle="Enter the 4-digit code to continue"
          otpLength={4}
          verifyOtp={this.state.otp}
        />

        {/* MessageBox */}
        <MessageBox
          visible={showMessage}
          message={messageText}
          type={messageType}
          showYesNo={showYesNo}
          onYes={() => {
            if (onYesCallback) onYesCallback();
            this.hideMessageBox();
          }}
          onNo={() => {
            if (onNoCallback) onNoCallback();
            this.hideMessageBox();
          }}
          onPress={() => this.hideMessageBox()}
        />
      </KeyboardAvoidingView>
    );
  }
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    paddingVertical: 20,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    flex: 1,
    padding: 14,
    paddingLeft: 44,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  inputWithEye: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 4,
    zIndex: 1,
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
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonIcon: {
    marginLeft: 8,
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
    marginRight: 8,
  },
  biometricButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
