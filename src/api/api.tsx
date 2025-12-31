import AsyncStorage from '@react-native-async-storage/async-storage';
import { Domain } from '../data/data';

const endpoints = {
  loginUrl: '/api/BellagioPay/Login',
  salarySlip: '/api/BellagioPay/CreatePDF',
  refreshToken: '/api/BellagioPay/RefreshToken',
  leavebalanceUrl: '/api/BellagioPay/LeaveBalance',
  attendanceCardurl: '/api/BellagioPay/AttendanceCard',
  dailypaymentUrl: '/api/BellagioPay/DailyPaymentList',
  passwordResetUrl: '/api/BellagioPay/PasswordReset',
  deleteAccountUrl: '/api/BellagioPay/Deactivate',
};

const apiUrl = (key: keyof typeof endpoints, suffix = '') =>
  Domain + endpoints[key] + suffix;

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Helper to get Bearer token header
async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('token');
  console.log('Token:', token);
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + token,
  };
}

// Core refresh token function
async function refreshTokenInternal() {
  const refreshToken = await AsyncStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(apiUrl('refreshToken'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const result = await response.json();

  // Save new tokens
  console.log(result.token);

  await AsyncStorage.setItem('token', result.token);
  await AsyncStorage.setItem('refreshToken', result.refreshToken);

  return result;
}

// Wrapper to ensure only one refresh happens at a time
async function handleTokenRefresh() {
  if (isRefreshing && refreshPromise) {
    // Wait for ongoing refresh
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshTokenInternal().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

async function postRequest<T = any>(
  url: string,
  body: any,
  isRetry = false,
  expectText = false, // NEW: Flag to indicate if text response is expected
): Promise<T> {
  const headers = await getAuthHeaders();
  console.log(`POST Request to ${url} with body:`, body);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    redirect: 'follow',
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);

  // Handle 401 - Token expired
  if (response.status === 401 && !isRetry) {
    console.log('Token expired, attempting refresh...');
    try {
      await handleTokenRefresh();
      console.log('Token refreshed successfully, retrying request...');
      // Retry the request with new token
      return postRequest<T>(url, body, true, expectText);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens and redirect to login
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      throw new Error('Authentication failed. Please login again.');
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Server error: ${response.status}`);
  }

  // Check content type before parsing
  const contentType = response.headers.get('content-type');
  console.log('Content-Type:', contentType);

  // If expecting text or content-type is text/plain, return text
  if (expectText || (contentType && contentType.includes('text/plain'))) {
    const text = await response.text();
    console.log('Text response received, length:', text.length);
    return text as T;
  }

  // Otherwise try to parse as JSON
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  // Fallback: try to parse as text
  const text = await response.text();
  console.log('Fallback text response:', text.substring(0, 200));
  return text as T;
}

async function getRequest<T = any>(url: string, isRetry = false): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'GET',
    headers,
    redirect: 'follow',
  });

  console.log('Response status:', response.status);

  // Handle 401 - Token expired
  if (response.status === 401 && !isRetry) {
    console.log('Token expired, attempting refresh...');

    try {
      await handleTokenRefresh();
      console.log('Token refreshed successfully, retrying request...');

      // Retry the request with new token
      return getRequest<T>(url, true);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens and redirect to login
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      throw new Error('Authentication failed. Please login again.');
    }
  }

  if (!response.ok) {
    throw new Error('Server Connection error');
  }

  return response.json();
}

export async function Login(UserName: string, Password: string) {
  const url = Domain + '/api/BellagioPay/Login';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: UserName,
      password: Password,
    }),
    redirect: 'follow',
  });

  console.log('Login response:', response);

  if (!response.ok) {
    throw new Error('Server Connection error');
  }

  const result = await response.json();

  // Save tokens on successful login
  if (result.token) {
    await AsyncStorage.setItem('token', result.token);
  }
  if (result.refreshToken) {
    await AsyncStorage.setItem('refreshToken', result.refreshToken);
  }

  return result;
}
export async function CheckLogin(UserName: string, Password: string) {
  const url = Domain + '/api/BellagioPay/Login2';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: UserName,
      password: Password,
    }),
    redirect: 'follow',
  });

  console.log('Login response:', response);

  if (!response.ok) {
    throw new Error('Server Connection error');
  }

  const result = await response.json();

  // Save tokens on successful login
  if (result.token) {
    await AsyncStorage.setItem('token', result.token);
  }
  if (result.refreshToken) {
    await AsyncStorage.setItem('refreshToken', result.refreshToken);
  }

  return result;
}

export async function CreateSlip(month: string, year: string): Promise<string> {
  const empNo = await AsyncStorage.getItem('username');
  // Pass true for expectText since this endpoint returns text/plain
  return postRequest<string>(
    apiUrl('salarySlip'),
    {
      emp: empNo,
      pay_mo: month,
      pay_year: year,
    },
    false,
    true, // Expect text response
  );
}

export async function RefreshToken() {
  return handleTokenRefresh();
}
export async function LeaveBalance(payYear: number): Promise<string> {
  const empNo = await AsyncStorage.getItem('username');
  const nuempNo: number = empNo ? parseInt(empNo) : 0;
  // Pass true for expectText since this endpoint returns text/plain
  return postRequest<string>(apiUrl('leavebalanceUrl'), {
    gamNo: nuempNo,
    payYear: payYear,
  });
}
export async function GetAttendanceCard(
  Month: string,
  payYear: number,
): Promise<string> {
  const empNo = await AsyncStorage.getItem('username');
  const nuempNo: number = empNo ? parseInt(empNo) : 0;
  // Pass true for expectText since this endpoint returns text/plain
  return postRequest<string>(apiUrl('attendanceCardurl'), {
    gamNo: nuempNo,
    wMonth: Month,
    wYear: payYear,
  });
}
export async function GetDailyPayments(
  Month: string,
  payYear: number,
): Promise<string> {
  const empNo = await AsyncStorage.getItem('username');
  const nuempNo: number = empNo ? parseInt(empNo) : 0;
  // Pass true for expectText since this endpoint returns text/plain
  return postRequest<string>(apiUrl('dailypaymentUrl'), {
    gamNo: nuempNo,
    wMonth: Month,
    wYear: payYear,
  });
}

export async function PasswordReset(
  Month: string,
  oldPassword: string,
  newPassword: string,
): Promise<string> {
  const empNo = await AsyncStorage.getItem('username');

  // Pass true for expectText since this endpoint returns text/plain
  return postRequest<string>(apiUrl('passwordResetUrl'), {
    username: empNo,
    oldPassword: oldPassword,
    newPassword: newPassword,
  });
}

export async function DeleteAccount(): Promise<string> {
  const empNo = await AsyncStorage.getItem('username');
  const password = await AsyncStorage.getItem('password');

  // Pass true for expectText since this endpoint returns text/plain
  return postRequest<string>(apiUrl('deleteAccountUrl'), {
    username: empNo,
    password: password,
  });
}
