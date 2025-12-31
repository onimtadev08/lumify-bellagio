// Components/OTP.tsx
import React, { Component, createRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
  Platform,
  Clipboard,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { ThemeContext } from '../contexts/ThemeContext';

interface OTPProps {
  visible: boolean;
  onVerify: (otp: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  otpLength?: number;
  verifyOtp?: string; // Expected OTP for verification (default: "9999")
}

interface OTPState {
  otp: string[];
  error: string;
  isVerifying: boolean;
  hiddenInputValue: string;
}

class OTP extends Component<OTPProps, OTPState> {
  static contextType = ThemeContext;
  context!: React.ContextType<typeof ThemeContext>;

  private fadeAnim = new Animated.Value(0);
  private scaleAnim = new Animated.Value(0.9);
  private shakeAnim = new Animated.Value(0);
  private inputRefs: React.RefObject<TextInput>[];
  private hiddenInputRef = createRef<TextInput>();

  constructor(props: OTPProps) {
    super(props);
    const length = props.otpLength || 4;
    this.state = {
      otp: Array(length).fill(''),
      error: '',
      isVerifying: false,
      hiddenInputValue: '',
    };
    this.inputRefs = Array(length)
      .fill(0)
      .map(() => createRef<TextInput>());
  }

  componentDidUpdate(prevProps: OTPProps) {
    if (this.props.visible && !prevProps.visible) {
      this.showModal();
      // Auto-focus hidden input for auto-fill support
      setTimeout(() => {
        this.hiddenInputRef.current?.focus();
      }, 300);
    } else if (!this.props.visible && prevProps.visible) {
      this.hideModal();
      this.resetOTP();
    }
  }

  showModal = () => {
    Animated.parallel([
      Animated.timing(this.fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(this.scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  hideModal = () => {
    Animated.parallel([
      Animated.timing(this.fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(this.scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(this.shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(this.shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(this.shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(this.shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle hidden input change (for auto-fill)
  handleHiddenInputChange = (text: string) => {
    // Only allow numbers
    const cleanText = text.replace(/[^0-9]/g, '');

    this.setState({ hiddenInputValue: cleanText });

    if (cleanText.length >= this.inputRefs.length) {
      // Split the text into individual digits
      const digits = cleanText.slice(0, this.inputRefs.length).split('');
      const newOtp = [...this.state.otp];

      digits.forEach((digit, index) => {
        if (index < this.inputRefs.length) {
          newOtp[index] = digit;
        }
      });

      this.setState({ otp: newOtp, error: '' }, () => {
        // Auto-verify when all digits are filled
        if (newOtp.every(digit => digit !== '')) {
          setTimeout(() => this.handleVerify(), 300);
        }
      });
    }
  };

  handleChangeText = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) {
      return;
    }

    const newOtp = [...this.state.otp];
    newOtp[index] = text;

    // Update hidden input to keep in sync
    const hiddenValue = newOtp.join('');
    this.setState(
      {
        otp: newOtp,
        error: '',
        hiddenInputValue: hiddenValue,
      },
      () => {
        // Auto-focus next input
        if (text && index < this.inputRefs.length - 1) {
          this.inputRefs[index + 1]?.current?.focus();
        }

        // Auto-verify when all digits are filled
        if (newOtp.every(digit => digit !== '')) {
          setTimeout(() => this.handleVerify(), 300);
        }
      },
    );
  };

  handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace') {
      if (!this.state.otp[index] && index > 0) {
        // Move to previous input if current is empty
        const newOtp = [...this.state.otp];
        newOtp[index - 1] = '';
        const hiddenValue = newOtp.join('');
        this.setState({ otp: newOtp, hiddenInputValue: hiddenValue });
        this.inputRefs[index - 1]?.current?.focus();
      }
    }
  };

  handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      const cleanText = clipboardContent.replace(/[^0-9]/g, '');

      if (cleanText.length >= this.inputRefs.length) {
        const digits = cleanText.slice(0, this.inputRefs.length).split('');
        const newOtp = [...this.state.otp];

        digits.forEach((digit, index) => {
          if (index < this.inputRefs.length) {
            newOtp[index] = digit;
          }
        });

        const hiddenValue = newOtp.join('');
        this.setState(
          {
            otp: newOtp,
            error: '',
            hiddenInputValue: hiddenValue,
          },
          () => {
            // Auto-verify when all digits are filled
            if (newOtp.every(digit => digit !== '')) {
              setTimeout(() => this.handleVerify(), 300);
            }
          },
        );
      }
    } catch (error) {
      console.log('Paste error:', error);
    }
  };

  handleVerify = () => {
    const enteredOtp = this.state.otp.join('');
    const expectedOtp = this.props.verifyOtp || '9999';

    if (enteredOtp.length !== this.inputRefs.length) {
      this.setState({ error: 'Please enter complete OTP' });
      this.shakeAnimation();
      return;
    }

    this.setState({ isVerifying: true });

    // Simulate verification delay
    setTimeout(() => {
      if (enteredOtp === expectedOtp) {
        Keyboard.dismiss();
        this.props.onVerify(enteredOtp);
        this.resetOTP();
      } else {
        this.setState({
          error: 'Invalid OTP. Please try again.',
          isVerifying: false,
        });
        this.shakeAnimation();
        // Clear OTP after error
        setTimeout(() => {
          this.resetOTP();
          this.hiddenInputRef.current?.focus();
        }, 1000);
      }
    }, 800);
  };

  resetOTP = () => {
    this.setState({
      otp: Array(this.props.otpLength || 4).fill(''),
      error: '',
      isVerifying: false,
      hiddenInputValue: '',
    });
  };

  handleResend = () => {
    this.resetOTP();
    this.setState({ error: '' });
    setTimeout(() => {
      this.hiddenInputRef.current?.focus();
    }, 100);
  };

  focusHiddenInput = () => {
    this.hiddenInputRef.current?.focus();
  };

  render() {
    if (!this.props.visible) return null;

    const { theme } = this.context;
    const { otp, error, isVerifying, hiddenInputValue } = this.state;
    const {
      title = 'OTP Verification',
      subtitle = 'Enter the 4-digit code to continue',
    } = this.props;

    return (
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: this.fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={this.props.onClose}
        />

        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.cardBackground,
              transform: [
                { scale: this.scaleAnim },
                { translateX: this.shakeAnim },
              ],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.background }]}
            onPress={this.props.onClose}
          >
            <Feather name="x" size={20} color={theme.text} />
          </TouchableOpacity>

          {/* Icon */}
          <View
            style={[styles.iconContainer, { backgroundColor: '#B6771D20' }]}
          >
            <Feather name="shield" size={32} color="#B6771D" />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>

          {/* Hidden input for auto-fill support */}
          <TextInput
            ref={this.hiddenInputRef}
            value={hiddenInputValue}
            onChangeText={this.handleHiddenInputChange}
            keyboardType="number-pad"
            maxLength={this.inputRefs.length}
            style={styles.hiddenInput}
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            editable={!isVerifying}
          />

          {/* OTP Input Display */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={this.focusHiddenInput}
            style={styles.otpContainer}
          >
            {otp.map((digit, index) => (
              <View
                key={index}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: error
                      ? '#FF4444'
                      : digit
                      ? '#B6771D'
                      : theme.inputBorder,
                  },
                  digit && styles.otpInputFilled,
                ]}
              >
                <Text style={[styles.otpText, { color: theme.text }]}>
                  {digit}
                </Text>
              </View>
            ))}
          </TouchableOpacity>

          {/* Paste Button */}
          <TouchableOpacity
            style={[styles.pasteButton, { backgroundColor: theme.background }]}
            onPress={this.handlePaste}
          >
            <Feather name="clipboard" size={16} color={theme.text} />
            <Text style={[styles.pasteText, { color: theme.text }]}>
              Paste Code
            </Text>
          </TouchableOpacity>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={16} color="#FF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (isVerifying || otp.some(d => !d)) && styles.verifyButtonDisabled,
            ]}
            onPress={this.handleVerify}
            disabled={isVerifying || otp.some(d => !d)}
          >
            {isVerifying ? (
              <View style={styles.verifyingContainer}>
                <Text style={styles.verifyButtonText}>Verifying...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.verifyButtonText}>Verify OTP</Text>
                <Feather
                  name="check-circle"
                  size={18}
                  color="#fff"
                  style={styles.verifyIcon}
                />
              </>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: theme.textSecondary }]}>
              Didn't receive code?{' '}
            </Text>
            <TouchableOpacity onPress={this.handleResend}>
              <Text style={styles.resendButton}>Resend</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    );
  }
}

export default OTP;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  otpInput: {
    width: 56,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInputFilled: {
    borderWidth: 2,
  },
  otpText: {
    fontSize: 24,
    fontWeight: '700',
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6,
  },
  pasteText: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 13,
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: '#B6771D',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginTop: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyIcon: {
    marginLeft: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B6771D',
  },
});
