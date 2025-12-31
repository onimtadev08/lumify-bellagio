import React, { useEffect, useRef, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { ColorSecond } from '../data/data';
import { ThemeContext } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface NewsFeedProps {
  isShow: boolean;
  onDismiss?: () => void;
  onReadMore?: () => void;
}

const NewsFeed: React.FC<NewsFeedProps> = ({
  isShow,
  onDismiss,
  onReadMore,
}) => {
  const { theme } = useContext(ThemeContext);
  const slideAnim = useRef(new Animated.Value(-400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isShow) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -400,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isShow]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -400,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const handleReadMore = () => {
    handleDismiss();
    setTimeout(() => {
      onReadMore?.();
    }, 300);
  };

  const styles = createStyles(theme);

  return (
    <Modal
      transparent={true}
      visible={isShow}
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar
        backgroundColor="transparent"
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        translucent
      />

      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleDismiss}
        />
      </Animated.View>

      {/* Notification Card */}
      <Animated.View
        style={[
          styles.notificationCard,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
          <Feather name="x" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleReadMore}
          style={styles.cardContent}
        >
          {/* Image Section */}
          <View style={styles.imageSection}>
            <Image
              source={require('../assets/images/bellagio.jpg')}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <View style={styles.newsBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.newsBadgeText}>NEW</Text>
              </View>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.textSection}>
            <View style={styles.headerRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.mainTitle} numberOfLines={1}>
                  Bellagio Colombo
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  Since 1998
                </Text>
              </View>
              <View style={styles.iconButton}>
                <Feather name="chevron-right" size={20} color={ColorSecond} />
              </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              Sri Lanka's premier nightlife & gaming destination. Open 24/7 at
              R. A. De Mel Mawatha, Colombo 03.
            </Text>

            {/* Quick Info Tags */}
            <View style={styles.tagsContainer}>
              <View style={styles.tag}>
                <Feather name="clock" size={12} color={ColorSecond} />
                <Text style={styles.tagText}>24/7</Text>
              </View>
              <View style={styles.tag}>
                <Feather name="map-pin" size={12} color={ColorSecond} />
                <Text style={styles.tagText}>Colombo 03</Text>
              </View>
              <View style={styles.tag}>
                <Feather name="award" size={12} color={ColorSecond} />
                <Text style={styles.tagText}>Est. 1998</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Footer */}
        <View style={styles.actionFooter}>
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissBtnText}>Dismiss</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.readMoreBtn}
            onPress={handleReadMore}
            activeOpacity={0.7}
          >
            <Text style={styles.readMoreBtnText}>Learn More</Text>
            <Feather name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
    },
    backdropTouchable: {
      flex: 1,
    },
    notificationCard: {
      position: 'absolute',
      top: 0,
      left: 16,
      right: 16,
      marginTop: 50,
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      borderWidth: 1,
      borderColor: ColorSecond,
    },
    closeButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    cardContent: {
      flexDirection: 'column',
    },
    imageSection: {
      width: '100%',
      height: 160,
    },
    cardImage: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      padding: 12,
    },
    newsBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: ColorSecond,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      gap: 6,
    },
    pulseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#fff',
    },
    newsBadgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    textSection: {
      flex: 1,
      padding: 16,
      paddingRight: 44,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    titleContainer: {
      flex: 1,
    },
    mainTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 13,
      color: ColorSecond,
      fontWeight: '600',
    },
    iconButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.isDark
        ? 'rgba(182, 119, 29, 0.2)'
        : 'rgba(182, 119, 29, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    description: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
      marginBottom: 12,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.isDark
        ? 'rgba(182, 119, 29, 0.15)'
        : 'rgba(182, 119, 29, 0.08)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
      borderWidth: 1,
      borderColor: theme.isDark
        ? 'rgba(182, 119, 29, 0.3)'
        : 'rgba(182, 119, 29, 0.15)',
    },
    tagText: {
      fontSize: 11,
      color: ColorSecond,
      fontWeight: '600',
    },
    actionFooter: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: theme.isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.06)',
    },
    dismissBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: ColorSecond,
    },
    dismissBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    readMoreBtn: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: ColorSecond,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      elevation: 2,
      shadowColor: ColorSecond,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    readMoreBtnText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#fff',
    },
  });

export default React.memo(NewsFeed);
