/* eslint-disable react/self-closing-comp */
/* eslint-disable react/no-unstable-nested-components */
// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { RootStackParamList, DrawerParamList } from '../types/navigation';

// Import your screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SalarySlip from '../screens/SalarySlip';
import BalanceLeave from '../screens/BalanceLeave';
import AttendanceCard from '../screens/AttendanceCard';
import DailyPaymentList from '../screens/DailyPaymentList';
import Settings from '../screens/Settings';

import CustomDrawerContent from '../Components/CustomDrawerContent';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { View } from 'react-native';
import NewsListScreen from '../screens/NewsListScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import SupportScreen from '../screens/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// Drawer Navigator Component
function DrawerNavigator({ route }: any) {
  const { emp_Name, photo } = route.params;

  return (
    <Drawer.Navigator
      drawerContent={props => (
        <CustomDrawerContent {...props} emp_Name={emp_Name} photo={photo} />
      )}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#2a2a2a',
          width: 280,
        },
        drawerActiveTintColor: '#4A90FF',
        drawerInactiveTintColor: '#999',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -10,
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: 10,
          marginVertical: 4,
        },
        drawerActiveBackgroundColor: 'rgba(74, 144, 255, 0.1)',
      }}
    >
      <Drawer.Screen
        name="DashboardScreen"
        component={DashboardScreen}
        initialParams={{ emp_Name, photo }}
        options={{
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
        }}
      />
      {/* <Drawer.Screen
        name="ProfileScreen"
        component={DashboardScreen}
        initialParams={{ emp_Name, photo }}
        options={{
          drawerLabel: '👤 Profile',
          title: 'Profile',
        }}
      /> */}
      {/* Hidden screens for profile submenu items */}
      <Drawer.Screen
        name="SalarySlip"
        component={SalarySlip}
        initialParams={{ emp_Name, photo }}
        options={{
          drawerItemStyle: { display: 'none' },

          headerLeft: () => {
            return (
              <View>
                <FontAwesome6
                  name="arrow-left"
                  size={24}
                  color="white"
                  iconStyle="solid"
                />
              </View>
            );
          },
        }}
      />
      <Drawer.Screen
        name="BalanceLeave"
        component={BalanceLeave}
        initialParams={{ emp_Name, photo }}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="AttendanceCard"
        component={AttendanceCard}
        initialParams={{ emp_Name, photo }}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="DailyPaymentList"
        component={DailyPaymentList}
        initialParams={{ emp_Name, photo }}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={Settings}
        initialParams={{ emp_Name, photo }}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="NewsList"
        component={NewsListScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen name="SupportScreen" component={SupportScreen} />
    </Drawer.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Export navigation helper functions
export const navigationRef = React.createRef<any>();

export function openDrawer() {
  navigationRef.current?.openDrawer();
}

export function goBack() {
  navigationRef.current?.goBack();
}

export function logout() {
  navigationRef.current?.reset({
    index: 0,
    routes: [{ name: 'LoginScreen' }],
  });
}
