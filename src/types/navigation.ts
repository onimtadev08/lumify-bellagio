// types/navigation.ts
export type RootStackParamList = {
  SplashScreen: undefined;
  LoginScreen: undefined;
  DrawerNavigator: {
    emp_Name: string;
    photo: string;
  };
};

export type DrawerParamList = {
  DashboardScreen: {
    emp_Name: string;
    photo: string;
  };
  ProfileScreen: {
    emp_Name: string;
    photo: string;
  };
};
