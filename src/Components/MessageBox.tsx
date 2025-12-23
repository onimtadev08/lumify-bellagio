// MessageBox.tsx
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Keyboard,
  Animated,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Feather from '@react-native-vector-icons/feather';
import { ColorFirst, MessageType } from '../data/data';

const { height, width } = Dimensions.get('window');
const ColorSecond = '#B6771D';

interface MessageBoxProps {
  visible: boolean;
  message: string;
  type: MessageType;
  // For confirmation dialogs
  button1Text?: string;
  button2Text?: string;
  onButton1Press?: () => void;
  onButton2Press?: () => void;
  // For simple dialogs (success, error, info)
  onPress?: (type: MessageType) => void;
  // For info messages with Yes/No options
  showYesNo?: boolean;
  onYes?: () => void;
  onNo?: () => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  visible,
  message,
  type,
  button1Text,
  button2Text,
  onButton1Press,
  onButton2Press,
  onPress,
  showYesNo = false,
  onYes,
  onNo,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle',
          color: '#22c55e',
          gradient: ['#16a34a', '#22c55e'],
        };
      case 'error':
        return {
          icon: 'x-circle',
          color: '#ef4444',
          gradient: ['#dc2626', '#ef4444'],
        };
      case 'info':
        return {
          icon: 'info',
          color: '#3b82f6',
          gradient: ['#2563eb', '#3b82f6'],
        };
      case 'confirmation':
        return {
          icon: 'help-circle',
          color: ColorSecond,
          gradient: [ColorSecond, '#D4933A'],
        };
      default:
        return {
          icon: 'alert-circle',
          color: ColorSecond,
          gradient: [ColorSecond, '#D4933A'],
        };
    }
  };

  const iconConfig = getIconConfig();

  const renderButtons = () => {
    if (type === 'confirmation') {
      // Confirmation dialog with two buttons
      return (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button_secondary}
            onPress={onButton2Press}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText_secondary}>
              {button2Text || 'Cancel'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onButton1Press}
            activeOpacity={0.8}
            style={styles.buttonWrapper}
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>{button1Text || 'Yes'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    } else if (type === 'info' && showYesNo) {
      // Info dialog with Yes/No options
      return (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button_secondary}
            onPress={onNo}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText_secondary}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onYes}
            activeOpacity={0.8}
            style={styles.buttonWrapper}
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>Yes</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    } else {
      // Single button for success, error, or simple info
      return (
        <TouchableOpacity
          onPress={() => {
            if (onPress) {
              onPress(type);
            }
          }}
          activeOpacity={0.8}
          style={styles.singleButtonWrapper}
        >
          <View style={styles.singleButton}>
            <Text style={styles.buttonText}>Done</Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <Modal transparent={true} visible={visible} animationType="none">
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.boxWrapper,
            {
              transform: [
                { scale: scaleAnim },
                {
                  translateY: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.box}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={iconConfig.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.messageIconContainer}
              >
                <Feather name={iconConfig.icon} size={40} color="#fff" />
              </LinearGradient>
            </View>

            {/* Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{message}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>{renderButtons()}</View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  boxWrapper: {
    width: '85%',
    maxWidth: 400,
  },
  box: {
    borderRadius: 24,
    paddingTop: 30,
    paddingBottom: 24,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(182, 119, 29, 0.2)',
    backgroundColor: ColorFirst,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  messageIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  messageContainer: {
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  message: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,

    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: ColorSecond,
  },
  button_secondary: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(182, 119, 29, 0.4)',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonText_secondary: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  singleButtonWrapper: {
    width: '100%',
  },
  singleButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: ColorSecond,
  },
});

export default MessageBox;
