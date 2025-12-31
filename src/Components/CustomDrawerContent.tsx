/* eslint-disable react/no-unstable-nested-components */
// navigation/CustomDrawerContent.tsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { appVersion, ColorSecond, MessageType } from '../data/data';
import Feather from '@react-native-vector-icons/feather';
import MemberImgView from './MemberImgView';
import MessageBox from './MessageBox';
import DeviceInfo from 'react-native-device-info';
import { ThemeContext, Theme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CustomDrawerProps extends DrawerContentComponentProps {
  emp_Name: string;
  photo: string;
}

const CustomDrawerContent: React.FC<CustomDrawerProps> = props => {
  const { emp_Name, photo, navigation } = props;
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [rotateAnim] = useState(new Animated.Value(0));

  const handleCloseDrawer = () => {
    navigation.closeDrawer();
  };

  const handleLogoutPress = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);

    try {
      // Clear all AsyncStorage data except theme preference
      const themeMode = await AsyncStorage.getItem('themeMode');
      await AsyncStorage.clear();

      // Restore theme preference
      if (themeMode) {
        await AsyncStorage.setItem('themeMode', themeMode);
      }

      console.log('AsyncStorage cleared successfully');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }

    // Navigate to login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleProfileMenuNavigation = (screenName: string) => {
    navigation.navigate(screenName);
  };

  const handleAvatarPress = () => {
    setImageModalVisible(true);
  };

  const handleCloseModal = () => {
    setImageModalVisible(false);
  };

  const toggleProfileExpanded = () => {
    const toValue = isProfileExpanded ? 0 : 1;
    Animated.timing(rotateAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsProfileExpanded(!isProfileExpanded);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const profileMenuItems = [
    { label: 'Salary Slip', icon: 'dollar-sign', screen: 'SalarySlip' },
    { label: 'Balance Leave', icon: 'calendar', screen: 'BalanceLeave' },
    { label: 'Attendance Card', icon: 'clipboard', screen: 'AttendanceCard' },
    {
      label: 'Daily Payment List',
      icon: 'credit-card',
      screen: 'DailyPaymentList',
    },
  ];

  const dashboardMenuItems = [
    { label: 'Dashboard', icon: 'home', screen: 'DashboardScreen' },
  ];

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Close Button - Top Right */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleCloseDrawer}
        activeOpacity={0.7}
      >
        <View style={styles.closeIconContainer}>
          <Feather name="x" size={22} color={ColorSecond} />
        </View>
      </TouchableOpacity>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerContent}
        style={styles.drawerScrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${photo}` }}
                style={styles.profileImage}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{emp_Name}</Text>
        </View>

        {/* Dashboard Menu Items */}
        <View style={styles.menuSection}>
          {dashboardMenuItems.map((item, index) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemGradient}>
                <View style={styles.menuIconContainer}>
                  <Feather name={item.icon} size={20} color={ColorSecond} />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Profile Expandable Menu */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={toggleProfileExpanded}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemGradient}>
              <View style={styles.menuIconContainer}>
                <Feather name="user" size={20} color={ColorSecond} />
              </View>
              <Text style={styles.menuItemText}>Profile</Text>
              <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Feather name="chevron-down" size={20} color={ColorSecond} />
              </Animated.View>
            </View>
          </TouchableOpacity>

          {/* Submenu Items */}
          {isProfileExpanded && (
            <View style={styles.submenuContainer}>
              {profileMenuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.screen}
                  style={[
                    styles.submenuItem,
                    index === profileMenuItems.length - 1 &&
                      styles.lastSubmenuItem,
                  ]}
                  onPress={() => handleProfileMenuNavigation(item.screen)}
                  activeOpacity={0.7}
                >
                  <View style={styles.submenuIconContainer}>
                    <Feather
                      name={item.icon}
                      size={16}
                      color={theme.textSecondary}
                    />
                  </View>
                  <Text style={styles.submenuText}>{item.label}</Text>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Settings Menu Item */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate('Settings');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemGradient}>
              <View style={styles.menuIconContainer}>
                <Feather name="settings" size={20} color={ColorSecond} />
              </View>
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate('SupportScreen');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemGradient}>
              <View style={styles.menuIconContainer}>
                <Feather name="help-circle" size={20} color={ColorSecond} />
              </View>
              <Text style={styles.menuItemText}>Support</Text>
            </View>
          </TouchableOpacity>

          {/* Theme Toggle Menu Item */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemGradient}>
              <View style={styles.menuIconContainer}>
                <Feather
                  name={isDarkMode ? 'sun' : 'moon'}
                  size={20}
                  color={ColorSecond}
                />
              </View>
              <Text style={styles.menuItemText}>
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Logout Button - Fixed at bottom */}
      <View style={styles.logoutSection}>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogoutPress}
          activeOpacity={0.7}
        >
          <View style={styles.logoutGradient}>
            <View style={styles.logoutIconContainer}>
              <Feather name="log-out" size={20} color="#fff" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
        <>
          <Text style={styles.versionText}>Version: {appVersion}</Text>
        </>
      </View>

      {/* Member Image View Modal */}
      <MemberImgView
        visible={imageModalVisible}
        photo={photo}
        name={emp_Name}
        onClose={handleCloseModal}
      />

      {/* Logout Confirmation Dialog */}
      <MessageBox
        visible={showLogoutConfirm}
        message="Are you sure you want to logout?"
        type="confirmation"
        button1Text="Logout"
        button2Text="Cancel"
        onButton1Press={handleLogoutConfirm}
        onButton2Press={handleLogoutCancel}
      />
    </View>
  );
};

export default CustomDrawerContent;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    closeButton: {
      position: 'absolute',
      top: 80,
      right: 16,
      zIndex: 1000,
    },
    closeIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(182, 119, 29, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(182, 119, 29, 0.3)',
    },
    drawerContent: {
      flexGrow: 1,
    },
    drawerScrollView: {
      flex: 1,
    },
    profileSection: {
      padding: 24,
      paddingTop: 60,
      paddingBottom: 30,
      alignItems: 'center',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    profileImageContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    profileImage: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 3,
      borderColor: ColorSecond,
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#4ade80',
      borderWidth: 3,
      borderColor: theme.cardBackground,
    },
    profileName: {
      color: theme.text,
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    roleContainer: {
      backgroundColor: 'rgba(182, 119, 29, 0.2)',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(182, 119, 29, 0.3)',
    },
    roleText: {
      color: ColorSecond,
      fontSize: 13,
      fontWeight: '600',
    },
    menuSection: {
      paddingTop: 10,
      paddingHorizontal: 16,
      flex: 1,
    },
    menuItem: {
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
    },
    menuItemGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(182, 119, 29, 0.3)',
      backgroundColor: theme.cardBackground,
    },
    menuIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: 'rgba(182, 119, 29, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    menuItemText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '600',
      flex: 1,
    },
    submenuContainer: {
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      marginBottom: 12,
      marginLeft: 0,
      marginRight: 0,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },
    submenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.inputBorder,
    },
    lastSubmenuItem: {
      borderBottomWidth: 0,
    },
    submenuIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: 'rgba(182, 119, 29, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    submenuText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
    divider: {
      height: 1,
      backgroundColor: theme.inputBorder,
      marginBottom: 16,
    },
    logoutSection: {
      padding: 16,
      paddingBottom: 24,
      backgroundColor: theme.background,
    },
    logoutButton: {
      borderRadius: 12,
      overflow: 'hidden',
      justifyContent: 'flex-start',
    },
    logoutGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
    },
    logoutIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    logoutText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    versionText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontFamily: 'CintaBook',
      textAlign: 'center',
    },
  });
