import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { PasswordReset } from '../api/api';
import Feather from '@react-native-vector-icons/feather';

import { MessageType } from '../data/data';
import Loader from '../Components/Loader';
import MessageBox from '../Components/MessageBox';

const ColorFirst = '#1a1a1a';
const ColorSecond = '#B6771D';

interface Props {
  navigation: any;
}

interface State {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  error: string | null;
  showOldPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  showMessageBox: boolean;
  messageBoxType: MessageType;
  messageBoxText: string;
}

class SettingsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      loading: false,
      error: null,
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      showMessageBox: false,
      messageBoxType: 'success',
      messageBoxText: '',
    };
  }

  showMessage = (type: MessageType, message: string) => {
    this.setState({
      showMessageBox: true,
      messageBoxType: type,
      messageBoxText: message,
    });
  };

  hideMessageBox = () => {
    this.setState({ showMessageBox: false });
  };

  validatePasswords = (): boolean => {
    const { oldPassword, newPassword, confirmPassword } = this.state;

    if (!oldPassword.trim()) {
      this.setState({ error: 'Please enter your old password' });
      return false;
    }

    if (!newPassword.trim()) {
      this.setState({ error: 'Please enter a new password' });
      return false;
    }

    if (newPassword.length < 6) {
      this.setState({ error: 'New password must be at least 6 characters' });
      return false;
    }

    if (newPassword !== confirmPassword) {
      this.setState({ error: 'New passwords do not match' });
      return false;
    }

    if (oldPassword === newPassword) {
      this.setState({
        error: 'New password must be different from old password',
      });
      return false;
    }

    return true;
  };

  handlePasswordReset = async () => {
    this.setState({ error: null });

    if (!this.validatePasswords()) {
      return;
    }

    this.setState({ loading: true });

    try {
      const result = await PasswordReset(
        '', // Month parameter - appears unused in API
        this.state.oldPassword,
        this.state.newPassword,
      );

      console.log('Password Reset Result:', result);

      this.setState({ loading: false });

      // Show success message
      this.showMessage('success', 'Your password has been reset successfully');
    } catch (error) {
      console.error('Password reset error:', error);
      this.setState({ loading: false });

      // Show error message
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to reset password. Please try again.';
      this.showMessage('error', errorMessage);
    }
  };

  handleMessageBoxClose = (type: MessageType) => {
    this.hideMessageBox();

    // Clear form on success
    if (type === 'success') {
      this.setState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  renderPasswordInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    showPassword: boolean,
    toggleShow: () => void,
    iconName: string = 'lock',
  ) => {
    return (
      <View style={styles.inputContainer}>
        <View style={styles.inputHeader}>
          <Feather name={iconName} size={16} color={ColorSecond} />
          <Text style={styles.inputLabel}>{label}</Text>
        </View>
        <View style={[styles.inputWrapper, { backgroundColor: '#242424' }]}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!showPassword}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={toggleShow}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  renderPasswordStrength = () => {
    const { newPassword } = this.state;
    if (!newPassword) return null;

    let strength = 0;
    let strengthText = '';
    let strengthColor = '#ef4444';

    if (newPassword.length >= 6) strength++;
    if (newPassword.length >= 10) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;

    if (strength <= 2) {
      strengthText = 'Weak';
      strengthColor = '#ef4444';
    } else if (strength <= 3) {
      strengthText = 'Medium';
      strengthColor = '#f59e0b';
    } else {
      strengthText = 'Strong';
      strengthColor = '#10b981';
    }

    return (
      <View style={styles.strengthContainer}>
        <Text style={styles.strengthLabel}>Password Strength:</Text>
        <View style={styles.strengthBar}>
          <View
            style={[
              styles.strengthFill,
              {
                width: `${(strength / 5) * 100}%`,
                backgroundColor: strengthColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.strengthText, { color: strengthColor }]}>
          {strengthText}
        </Text>
      </View>
    );
  };

  render() {
    const { loading, error } = this.state;

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.props.navigation?.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={ColorSecond} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Password Reset Section */}
          <View style={[styles.section, { backgroundColor: '#242424' }]}>
            <View style={styles.sectionHeader}>
              <Feather name="shield" size={24} color={ColorSecond} />
              <Text style={styles.sectionTitle}>Password Reset</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Change your password to keep your account secure
            </Text>

            {/* Old Password Input */}
            {this.renderPasswordInput(
              'Old Password',
              this.state.oldPassword,
              text => this.setState({ oldPassword: text, error: null }),
              this.state.showOldPassword,
              () =>
                this.setState({ showOldPassword: !this.state.showOldPassword }),
              'lock',
            )}

            {/* New Password Input */}
            {this.renderPasswordInput(
              'New Password',
              this.state.newPassword,
              text => this.setState({ newPassword: text, error: null }),
              this.state.showNewPassword,
              () =>
                this.setState({ showNewPassword: !this.state.showNewPassword }),
              'key',
            )}

            {/* Password Strength Indicator */}
            {this.renderPasswordStrength()}

            {/* Confirm Password Input */}
            {this.renderPasswordInput(
              'Confirm Password',
              this.state.confirmPassword,
              text => this.setState({ confirmPassword: text, error: null }),
              this.state.showConfirmPassword,
              () =>
                this.setState({
                  showConfirmPassword: !this.state.showConfirmPassword,
                }),
              'check-circle',
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Reset Password Button */}
            <TouchableOpacity
              onPress={this.handlePasswordReset}
              activeOpacity={0.8}
              disabled={loading}
            >
              <View
                style={[
                  styles.resetButton,
                  { backgroundColor: ColorSecond },
                  loading && styles.resetButtonDisabled,
                ]}
              >
                <Feather name="refresh-cw" size={20} color="#fff" />
                <Text style={styles.resetButtonText}>Reset Password</Text>
              </View>
            </TouchableOpacity>

            {/* Password Tips */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Feather name="check" size={14} color="#10b981" />
                <Text style={styles.tipText}>Use at least 6 characters</Text>
              </View>
              <View style={styles.tipItem}>
                <Feather name="check" size={14} color="#10b981" />
                <Text style={styles.tipText}>
                  Mix uppercase and lowercase letters
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Feather name="check" size={14} color="#10b981" />
                <Text style={styles.tipText}>
                  Include numbers and special characters
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Loader */}
        <Loader isShow={loading} />

        {/* Message Box */}
        <MessageBox
          visible={this.state.showMessageBox}
          message={this.state.messageBoxText}
          type={this.state.messageBoxType}
          onPress={this.handleMessageBoxClose}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorFirst,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#242424',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(182, 119, 29, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(182, 119, 29, 0.3)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#fff',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  strengthLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  strengthBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 20,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  tipsContainer: {
    backgroundColor: 'rgba(182, 119, 29, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    fontSize: 13,
    color: '#ccc',
    flex: 1,
  },
});

export default SettingsScreen;
