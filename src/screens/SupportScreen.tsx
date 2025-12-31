import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { ThemeContext } from '../contexts/ThemeContext';
import { appVersion, ColorSecond } from '../data/data';
import MessageBox from '../Components/MessageBox';

interface SupportScreenProps {
  navigation?: any;
}

interface SupportScreenState {
  showMessage: boolean;
  messageType: 'success' | 'error' | 'info' | 'confirmation';
  messageText: string;
}

class SupportScreen extends React.Component<
  SupportScreenProps,
  SupportScreenState
> {
  static contextType = ThemeContext;
  context!: React.ContextType<typeof ThemeContext>;
  constructor(props: SupportScreenProps) {
    super(props);
    this.state = {
      showMessage: false,
      messageType: 'info',
      messageText: '',
    };
  }

  showMessageDialog = (
    type: 'success' | 'error' | 'info' | 'confirmation',
    message: string,
  ) => {
    this.setState({
      showMessage: true,
      messageType: type,
      messageText: message,
    });
  };

  hideMessage = () => {
    this.setState({ showMessage: false });
  };

  handleMessagePress = () => {
    this.hideMessage();
  };
  handleOpenWebsite = async () => {
    const url = 'https://www.onimtait.com';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        this.showMessageDialog('error', 'Cannot open website on this device');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      this.showMessageDialog('error', 'Cannot open website on this device');
    }
  };

  handleCall = async () => {
    const phoneNumber = 'tel:+94759888888';
    try {
      const supported = await Linking.canOpenURL(phoneNumber);
      if (supported) {
        await Linking.openURL(phoneNumber);
      } else {
        this.showMessageDialog('error', 'Cannot make calls on this device');
      }
    } catch (error) {
      console.error('Error making call:', error);
      this.showMessageDialog('error', 'Cannot make calls on this device');
    }
  };

  handleEmail = async () => {
    const email = 'mailto:help@onimtait.com';
    try {
      const supported = await Linking.canOpenURL(email);
      if (supported) {
        await Linking.openURL(email);
      } else {
        this.showMessageDialog(
          'error',
          'Cannot open email client on this device',
        );
      }
    } catch (error) {
      console.error('Error opening email:', error);
      this.showMessageDialog(
        'error',
        'Cannot open email client on this device',
      );
    }
  };

  render() {
    const { theme } = this.context;
    const { navigation } = this.props;

    return (
      <View style={[styles.wrapper, { backgroundColor: theme.background }]}>
        {/* Header with Back Button */}
        <View
          style={[styles.header, { backgroundColor: theme.cardBackground }]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={ColorSecond} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: ColorSecond }]}>
            Support
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <TouchableOpacity
              style={[
                styles.logoCard,
                {
                  backgroundColor: '#FFFFFF', // Always white background for logo visibility
                  shadowColor: theme.shadowColor,
                },
              ]}
              onPress={this.handleOpenWebsite}
              activeOpacity={0.8}
            >
              <Image
                source={require('../assets/images/onimta.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              {/* <View style={styles.tapHint}>
                <Feather name="external-link" size={16} color="#B6771D" />
                <Text style={styles.tapHintText}>Tap to visit website</Text>
              </View> */}
            </TouchableOpacity>

            {/* Support Title */}
            <Text style={[styles.title, { color: theme.text }]}>
              Need Help?
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              We're here to support you
            </Text>

            {/* Contact Cards */}
            <View style={styles.contactSection}>
              {/* Website */}
              <TouchableOpacity
                style={[
                  styles.contactCard,
                  {
                    backgroundColor: theme.cardBackground,
                    shadowColor: theme.shadowColor,
                  },
                ]}
                onPress={this.handleOpenWebsite}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: '#4A90FF20' },
                  ]}
                >
                  <Feather name="globe" size={24} color="#4A90FF" />
                </View>
                <View style={styles.contactInfo}>
                  <Text
                    style={[
                      styles.contactLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Website
                  </Text>
                  <Text style={[styles.contactValue, { color: theme.text }]}>
                    www.onimtait.com
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={theme.placeholder}
                />
              </TouchableOpacity>

              {/* Phone */}
              <TouchableOpacity
                style={[
                  styles.contactCard,
                  {
                    backgroundColor: theme.cardBackground,
                    shadowColor: theme.shadowColor,
                  },
                ]}
                onPress={this.handleCall}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: '#10B98120' },
                  ]}
                >
                  <Feather name="phone" size={24} color="#10B981" />
                </View>
                <View style={styles.contactInfo}>
                  <Text
                    style={[
                      styles.contactLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Phone
                  </Text>
                  <Text style={[styles.contactValue, { color: theme.text }]}>
                    +94 75 988 8888
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={theme.placeholder}
                />
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity
                style={[
                  styles.contactCard,
                  {
                    backgroundColor: theme.cardBackground,
                    shadowColor: theme.shadowColor,
                  },
                ]}
                onPress={this.handleEmail}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: '#F59E0B20' },
                  ]}
                >
                  <Feather name="mail" size={24} color="#F59E0B" />
                </View>
                <View style={styles.contactInfo}>
                  <Text
                    style={[
                      styles.contactLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Email
                  </Text>
                  <Text style={[styles.contactValue, { color: theme.text }]}>
                    help@onimtait.com
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={theme.placeholder}
                />
              </TouchableOpacity>
            </View>

            {/* App Version */}
            <View
              style={[
                styles.versionCard,
                {
                  backgroundColor: theme.cardBackground,
                  shadowColor: theme.shadowColor,
                },
              ]}
            >
              <Feather
                name="info"
                size={20}
                color={theme.textSecondary}
                style={styles.versionIcon}
              />
              <View>
                <Text
                  style={[styles.versionLabel, { color: theme.textSecondary }]}
                >
                  App Version
                </Text>
                <Text style={[styles.versionValue, { color: theme.text }]}>
                  {appVersion}
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Feather name="shield" size={16} color={theme.placeholder} />
              <Text style={[styles.footerText, { color: theme.placeholder }]}>
                Your data is secure and protected
              </Text>
            </View>
            <MessageBox
              visible={this.state.showMessage}
              onPress={this.handleMessagePress}
              message={this.state.messageText}
              type={this.state.messageType}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  logoCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logo: {
    width: 180,
    height: 120,
    marginBottom: 16,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tapHintText: {
    fontSize: 13,
    color: '#B6771D',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
  },
  contactSection: {
    gap: 12,
    marginBottom: 30,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  versionIcon: {
    marginRight: 12,
  },
  versionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  versionValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 13,
  },
});

export default React.memo(SupportScreen);
