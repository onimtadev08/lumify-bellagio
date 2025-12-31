import { NewsItem } from './news';

// types/navigation.ts
export type RootStackParamList = {
  LoginScreen: undefined;
  DashboardScreen: {
    emp_Name: string;
    photo: string;
  };
  SalarySlip: undefined;
  BalanceLeave: undefined;
  AttendanceCard: undefined;
  DailyPaymentList: undefined;
  Settings: undefined;
  NewsList: undefined; // Add this
  NewsDetail: { newsItem: NewsItem }; // Add this
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
  SalarySlip: undefined;
  BalanceLeave: undefined;
  AttendanceCard: undefined;
  DailyPaymentList: undefined;
  Settings: undefined;
  NewsList: undefined; // Add this
  NewsDetail: { newsItem: NewsItem };
  SupportScreen: undefined;
};
