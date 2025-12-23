import React, { Component } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Text,
  StatusBar,
  Dimensions,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';

const { width } = Dimensions.get('window');
const ColorSecond = '#B6771D';

interface Props {
  visible: boolean;
  photo: string;
  name: string;
  onClose: () => void;
}

interface State {
  modalScale: Animated.Value;
  modalOpacity: Animated.Value;
}

class MemberImgView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      modalScale: new Animated.Value(0),
      modalOpacity: new Animated.Value(0),
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.visible && !prevProps.visible) {
      this.animateIn();
    } else if (!this.props.visible && prevProps.visible) {
      this.animateOut();
    }
  }

  animateIn = () => {
    Animated.parallel([
      Animated.spring(this.state.modalScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.modalOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  animateOut = () => {
    Animated.parallel([
      Animated.timing(this.state.modalScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  render() {
    const { visible, photo, name, onClose } = this.props;

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Animated.View
          style={[styles.modalContainer, { opacity: this.state.modalOpacity }]}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={onClose}
          >
            <StatusBar
              backgroundColor="rgba(0, 0, 0, 0.95)"
              barStyle="light-content"
            />

            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ scale: this.state.modalScale }],
                },
              ]}
            >
              <Image
                source={{ uri: `data:image/jpeg;base64,${photo}` }}
                style={styles.expandedImage}
                resizeMode="contain"
              />

              <View style={styles.modalHeader}>
                <Text style={styles.modalName}>{name}</Text>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <View style={styles.closeButtonContainer}>
                  <Feather name="x" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    );
  }
}

export default MemberImgView;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    height: width * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: ColorSecond,
  },
  modalHeader: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  modalName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -60,
    right: 10,
  },
  closeButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(182, 119, 29, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
