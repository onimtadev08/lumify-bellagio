import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { GetDailyPayments } from '../api/api';
import Feather from '@react-native-vector-icons/feather';
import { ThemeContext, Theme } from '../contexts/ThemeContext';
import { ThousandSeparator } from '../utilities/utilities';

const { width } = Dimensions.get('window');
const ColorSecond = '#B6771D';

interface DailyPayment {
  GamNo: number;
  WorkDate: string;
  AddDate: string;
  PayType: string;
  Amount: number;
  IsPaid: string;
}

interface Props {
  navigation: any;
}

interface State {
  selectedYear: number;
  selectedMonth: string;
  paymentData: DailyPayment[];
  loading: boolean;
  error: string | null;
  showMonthPicker: boolean;
  showYearPicker: boolean;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

class DailyPaymentList extends React.Component<Props, State> {
  static contextType = ThemeContext;
  context!: React.ContextType<typeof ThemeContext>;

  constructor(props: Props) {
    super(props);
    const currentDate = new Date();
    this.state = {
      selectedYear: currentDate.getFullYear(),
      selectedMonth: MONTHS[currentDate.getMonth()],
      paymentData: [],
      loading: false,
      error: null,
      showMonthPicker: false,
      showYearPicker: false,
    };
  }

  handleDailyPaymentList = async () => {
    this.setState({ loading: true, error: null });
    try {
      const result = await GetDailyPayments(
        this.state.selectedMonth,
        this.state.selectedYear,
      );
      console.log('Payment Result:', result);
      this.setState({
        paymentData: result,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      this.setState({
        error: 'Failed to fetch payment data. Please try again.',
        loading: false,
      });
    }
  };

  getPayTypeColor = (payType: string): string => {
    if (payType.includes('OT')) return '#8b5cf6';
    if (payType.includes('POYA')) return '#f59e0b';
    if (payType.includes('FRIDAY')) return '#3b82f6';
    if (payType.includes('SATURDAY')) return '#10b981';
    if (payType.includes('SUNDAY')) return '#ef4444';
    if (payType.includes('TAX')) return '#ec4899';
    return '#6b7280';
  };

  getPayTypeIcon = (payType: string): string => {
    if (payType.includes('OT')) return 'clock';
    if (payType.includes('POYA')) return 'sun';
    if (payType.includes('FRIDAY')) return 'calendar';
    if (payType.includes('SATURDAY')) return 'calendar';
    if (payType.includes('SUNDAY')) return 'calendar';
    if (payType.includes('TAX')) return 'file-text';
    if (payType.includes('MEAL')) return 'coffee';
    return 'dollar-sign';
  };

  getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '#16a34a';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  formatCurrency = (amount: number): string => {
    return `Rs. ${ThousandSeparator(amount.toFixed(2))}`;
  };
  calculateTotals = () => {
    const { paymentData } = this.state;
    const total = paymentData.reduce((sum, item) => sum + item.Amount, 0);
    const paid = paymentData
      .filter(item => item.IsPaid.toLowerCase() === 'paid')
      .reduce((sum, item) => sum + item.Amount, 0);
    const pending = paymentData
      .filter(item => item.IsPaid.toLowerCase() === 'pending')
      .reduce((sum, item) => sum + item.Amount, 0);
    return { total, paid, pending };
  };

  renderMonthPicker = () => {
    const { theme } = this.context;
    const styles = createStyles(theme);

    return (
      <Modal
        transparent={true}
        visible={this.state.showMonthPicker}
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => this.setState({ showMonthPicker: false })}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerContent}>
              <Text style={styles.pickerTitle}>Select Month</Text>
              <ScrollView style={styles.pickerScroll}>
                {MONTHS.map(month => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.pickerItem,
                      month === this.state.selectedMonth &&
                        styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      this.setState({
                        selectedMonth: month,
                        showMonthPicker: false,
                        paymentData: [],
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        month === this.state.selectedMonth &&
                          styles.pickerItemTextSelected,
                      ]}
                    >
                      {month}
                    </Text>
                    {month === this.state.selectedMonth && (
                      <Feather name="check" size={20} color={ColorSecond} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };
  getMonthDisplay = (month: string): string => {
    if (width < 375) {
      const monthIndex = MONTHS.indexOf(month);
      const abbreviated = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return abbreviated[monthIndex];
    }
    return month;
  };

  renderYearPicker = () => {
    const { theme } = this.context;
    const styles = createStyles(theme);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    return (
      <Modal
        transparent={true}
        visible={this.state.showYearPicker}
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => this.setState({ showYearPicker: false })}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerContent}>
              <Text style={styles.pickerTitle}>Select Year</Text>
              <ScrollView style={styles.pickerScroll}>
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.pickerItem,
                      year === this.state.selectedYear &&
                        styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      this.setState({
                        selectedYear: year,
                        showYearPicker: false,
                        paymentData: [],
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        year === this.state.selectedYear &&
                          styles.pickerItemTextSelected,
                      ]}
                    >
                      {year}
                    </Text>
                    {year === this.state.selectedYear && (
                      <Feather name="check" size={20} color={ColorSecond} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  renderSummary = () => {
    const { theme } = this.context;
    const styles = createStyles(theme);
    const { paymentData } = this.state;
    if (paymentData.length === 0) return null;

    const { total, paid, pending } = this.calculateTotals();

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Feather name="pie-chart" size={20} color={ColorSecond} />
            <Text style={styles.summaryTitle}>Payment Summary</Text>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.statBox}>
              <View
                style={[styles.statContent, { backgroundColor: ColorSecond }]}
              >
                <Text style={styles.statValue}>
                  {this.formatCurrency(total)}
                </Text>
                <Text style={styles.statLabel}>Total Amount</Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <View
                style={[styles.statContent, { backgroundColor: '#16a34a' }]}
              >
                <Text style={styles.statValue}>
                  {this.formatCurrency(paid)}
                </Text>
                <Text style={styles.statLabel}>Paid</Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <View
                style={[styles.statContent, { backgroundColor: '#f59e0b' }]}
              >
                <Text style={styles.statValue}>
                  {this.formatCurrency(pending)}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <View
                style={[styles.statContent, { backgroundColor: '#6b7280' }]}
              >
                <Text style={styles.statValue}>{paymentData.length}</Text>
                <Text style={styles.statLabel}>Total Records</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  renderPaymentCard = (item: DailyPayment, index: number) => {
    const { theme } = this.context;
    const styles = createStyles(theme);

    return (
      <View key={index} style={styles.paymentCard}>
        <View
          style={[
            styles.paymentCardLeft,
            { backgroundColor: this.getPayTypeColor(item.PayType) },
          ]}
        >
          <Feather
            name={this.getPayTypeIcon(item.PayType)}
            size={24}
            color="#fff"
          />
        </View>
        <View style={styles.paymentCardContent}>
          <View style={styles.paymentCardHeader}>
            <Text style={styles.paymentType} numberOfLines={1}>
              {item.PayType.replace(/_/g, ' ')}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: this.getStatusColor(item.IsPaid) },
              ]}
            >
              <Text style={styles.statusText}>{item.IsPaid}</Text>
            </View>
          </View>
          <View style={styles.paymentCardDetails}>
            <View style={styles.detailItem}>
              <Feather name="calendar" size={14} color={theme.textSecondary} />
              <Text style={styles.detailText}>
                Work: {this.formatDate(item.WorkDate)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Feather name="clock" size={14} color={theme.textSecondary} />
              <Text style={styles.detailText}>
                Added: {this.formatDate(item.AddDate)}
              </Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount:</Text>
            <Text style={styles.amountValue}>
              {this.formatCurrency(item.Amount)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  render() {
    const { theme } = this.context;
    const styles = createStyles(theme);
    const { paymentData, loading, error } = this.state;

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.props.navigation?.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={ColorSecond} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Payments</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Month & Year Selectors */}
          <View style={styles.selectorsRow}>
            <TouchableOpacity
              style={styles.selectorHalf}
              onPress={() => this.setState({ showMonthPicker: true })}
              activeOpacity={0.8}
            >
              <View style={styles.selector}>
                <Feather name="calendar" size={20} color={ColorSecond} />
                <View style={styles.selectorTextContainer}>
                  <Text style={styles.selectorLabel} numberOfLines={1}>
                    Month
                  </Text>
                  <Text
                    style={styles.selectorValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {this.getMonthDisplay(this.state.selectedMonth)}
                  </Text>
                </View>
                <Feather
                  name="chevron-down"
                  size={18}
                  color={theme.textSecondary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectorHalf}
              onPress={() => this.setState({ showYearPicker: true })}
              activeOpacity={0.8}
            >
              <View style={styles.selector}>
                <Feather name="calendar" size={20} color={ColorSecond} />
                <View style={styles.selectorTextContainer}>
                  <Text style={styles.selectorLabel} numberOfLines={1}>
                    Year
                  </Text>
                  <Text style={styles.selectorValue} numberOfLines={1}>
                    {this.state.selectedYear}
                  </Text>
                </View>
                <Feather
                  name="chevron-down"
                  size={18}
                  color={theme.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </View>
          {/* Get Payment List Button */}
          <TouchableOpacity
            onPress={this.handleDailyPaymentList}
            activeOpacity={0.8}
            disabled={loading}
          >
            <View style={styles.checkButton}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="search" size={20} color="#fff" />
                  <Text style={styles.checkButtonText}>Get Payment List</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={20} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Summary */}
          {this.renderSummary()}

          {/* Payment List */}
          {paymentData.length > 0 && (
            <View style={styles.listContainer}>
              <View style={styles.sectionHeader}>
                <Feather name="list" size={20} color={ColorSecond} />
                <Text style={styles.sectionTitle}>Payment Records</Text>
              </View>
              {paymentData.map((item, index) =>
                this.renderPaymentCard(item, index),
              )}
            </View>
          )}

          {/* Empty State */}
          {!loading && paymentData.length === 0 && !error && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Feather
                  name="dollar-sign"
                  size={48}
                  color={theme.textSecondary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Payment Data</Text>
              <Text style={styles.emptyText}>
                Select a month and year, then tap "Get Payment List" to view
                your payment records
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Modals */}
        {this.renderMonthPicker()}
        {this.renderYearPicker()}
      </View>
    );
  }
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
      backgroundColor: theme.headerBackground,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      elevation: 4,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(182, 119, 29, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(182, 119, 29, 0.3)',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    placeholder: {
      width: 44,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    selectorsRow: {
      flexDirection: 'row',
      gap: 10, // Reduced from 12
      marginBottom: 20,
    },
    selectorHalf: {
      flex: 1,
      minWidth: 0, // Allows proper shrinking
    },
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12, // Reduced from 16
      borderRadius: 16,
      gap: 8, // Reduced from 12
      elevation: 4,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      backgroundColor: theme.cardBackground,
      minHeight: 56, // Ensures consistent height
    },
    selectorTextContainer: {
      flex: 1,
      minWidth: 0, // Critical: allows flex child to shrink
      paddingHorizontal: 2, // Small padding for text breathing room
    },
    selectorLabel: {
      fontSize: 11, // Slightly smaller
      color: theme.textSecondary,
      marginBottom: 2,
    },
    selectorValue: {
      fontSize: 15, // Reduced from 16
      fontWeight: 'bold',
      color: theme.text,
    },
    checkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 16,
      borderRadius: 16,
      elevation: 4,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      marginBottom: 20,
      backgroundColor: ColorSecond,
    },
    checkButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.3)',
      marginBottom: 20,
    },
    errorText: {
      flex: 1,
      color: '#ef4444',
      fontSize: 14,
      fontWeight: '500',
    },
    summaryContainer: {
      marginBottom: 24,
    },
    summaryCard: {
      borderRadius: 20,
      padding: 20,
      elevation: 4,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      backgroundColor: theme.cardBackground,
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    summaryStats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'space-between',
    },
    statBox: {
      width: '48%',
      minWidth: 150,
    },
    statContent: {
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '600',
    },
    listContainer: {
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    paymentCard: {
      flexDirection: 'row',
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    paymentCardLeft: {
      width: 70,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    paymentCardContent: {
      flex: 1,
      padding: 16,
    },
    paymentCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    paymentType: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
      marginRight: 8,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#fff',
      textTransform: 'uppercase',
    },
    paymentCardDetails: {
      gap: 6,
      marginBottom: 12,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    detailText: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    amountContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.inputBorder,
    },
    amountLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    amountValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: ColorSecond,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyIconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: 'rgba(182, 119, 29, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pickerContainer: {
      width: '80%',
      maxHeight: '70%',
    },
    pickerContent: {
      borderRadius: 20,
      padding: 20,
      elevation: 10,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      backgroundColor: theme.cardBackground,
    },
    pickerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    pickerScroll: {
      maxHeight: 400,
    },
    pickerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: 'rgba(182, 119, 29, 0.05)',
    },
    pickerItemSelected: {
      backgroundColor: 'rgba(182, 119, 29, 0.2)',
      borderWidth: 1,
      borderColor: ColorSecond,
    },
    pickerItemText: {
      fontSize: 16,
      color: theme.text,
      fontWeight: '500',
    },
    pickerItemTextSelected: {
      color: ColorSecond,
      fontWeight: 'bold',
    },
  });

export default React.memo(DailyPaymentList);
