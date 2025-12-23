import React from 'react';
import { Modal, View } from 'react-native';
import LottieView from 'lottie-react-native';

interface MyProps {
  isShow: boolean;
}

const Loader: React.FC<MyProps> = ({ isShow }) => {
  return (
    <Modal transparent={true} visible={isShow} animationType="fade">
      <View
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <LottieView
          source={require('../assets/images/LottieGif/Dashboard.json')} // Your Lottie JSON file
          autoPlay
          loop
          style={{
            width: 200, // Fixed size instead of percentage for better performance
            height: 200,
          }}
          resizeMode="contain"
          speed={1.0} // Adjust animation speed if needed
        />
      </View>
    </Modal>
  );
};

export default React.memo(Loader);
