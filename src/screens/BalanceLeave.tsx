import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LeaveBalance } from '../api/api';
import Feather from '@react-native-vector-icons/feather';
import Loader from '../Components/Loader';
import { ColorSecond, MessageType } from '../data/data';
import MessageBox from '../Components/MessageBox';
import { ThemeContext, Theme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface LeaveData {
  leaveType: string;
  allow: number;
  taken: number;
  balance: number;
}

interface BalanceleaveProps {
  navigation?: any;
}

interface BalanceleaveState {
  selectedYear: number;
  leaveData: LeaveData[];
  loading: boolean;
  error: string | null;
  headerAnimation: Animated.Value;
  cardAnimations: Animated.Value[];
  showYearPicker: boolean;
  showMessage: boolean;
  messageType: MessageType;
  messageText: string;
}

class BalanceLeave extends React.Component<
  BalanceleaveProps,
  BalanceleaveState
> {
  static contextType = ThemeContext;
  context!: React.ContextType<typeof ThemeContext>;

  private scaleAnimations: Animated.Value[] = [];

  constructor(props: BalanceleaveProps) {
    super(props);
    const currentYear = new Date().getFullYear();
    this.state = {
      selectedYear: currentYear,
      leaveData: [],
      loading: false,
      error: null,
      headerAnimation: new Animated.Value(0),
      cardAnimations: [],
      showYearPicker: false,
      showMessage: false,
      messageType: 'info',
      messageText: '',
    };
  }

  componentDidMount() {
    this.animateHeader();
  }

  animateHeader = () => {
    Animated.spring(this.state.headerAnimation, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  animateCards = () => {
    const animations = this.state.cardAnimations.map((anim, index) =>
      Animated.spring(anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: index * 100,
        useNativeDriver: true,
      }),
    );
    Animated.stagger(80, animations).start();
  };

  handleBalanceLeave = async () => {
    this.setState({ loading: true, error: null });
    try {
      const result = await LeaveBalance(this.state.selectedYear);
      console.log('Leave Balance Result:', result);

      const cardAnimations = result.map(() => new Animated.Value(0));
      this.scaleAnimations = result.map(() => new Animated.Value(1));

      this.setState(
        {
          leaveData: result,
          loading: false,
          cardAnimations,
        },
        () => {
          this.animateCards();
        },
      );
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      this.setState({
        error: 'Failed to fetch leave balance. Please try again.',
        loading: false,
      });
      this.showMessageDialog(
        'error',
        'Failed to fetch leave balance. Please try again.',
      );
    }
  };

  showMessageDialog = (
    type: 'success' | 'error' | 'info' | 'confirmation',
    message: string,
  ) => {
    this.setState({
      showMessage: true,
      messageType: type,
      messageText: message,
    });
  };

  hideMessage = () => {
    this.setState({ showMessage: false });
  };

  handleMessagePress = () => {
    this.hideMessage();
  };

  handleYearChange = (increment: boolean) => {
    this.setState(prevState => ({
      selectedYear: prevState.selectedYear + (increment ? 1 : -1),
      leaveData: [],
    }));
  };

  handleCardPress = (index: number) => {
    Animated.sequence([
      Animated.timing(this.scaleAnimations[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(this.scaleAnimations[index], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  getLeaveIcon = (leaveType: string): string => {
    const type = leaveType.toLowerCase();
    if (type.includes('annual') || type.includes('anual')) return 'calendar';
    if (type.includes('casual')) return 'coffee';
    if (type.includes('privilege')) return 'star';
    if (type.includes('sick')) return 'heart';
    return 'file-text';
  };

  getLeaveColor = (index: number): string[] => {
    const colors = [
      ['#B6771D', '#D4933A'],
      ['#2563eb', '#3b82f6'],
      ['#dc2626', '#ef4444'],
      ['#16a34a', '#22c55e'],
    ];
    return colors[index % colors.length];
  };

  renderYearSelector = () => {
    const { theme } = this.context;
    const styles = createStyles(theme);

    const headerTranslateY = this.state.headerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-30, 0],
    });

    const headerOpacity = this.state.headerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        style={[
          styles.yearSelectorContainer,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <View style={styles.yearSelector}>
          <TouchableOpacity
            onPress={() => this.handleYearChange(false)}
            style={styles.yearButton}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color={ColorSecond} />
          </TouchableOpacity>

          <View style={styles.yearDisplay}>
            <Feather name="calendar" size={20} color={ColorSecond} />
            <Text style={styles.yearText}>{this.state.selectedYear}</Text>
          </View>

          <TouchableOpacity
            onPress={() => this.handleYearChange(true)}
            style={styles.yearButton}
            activeOpacity={0.7}
          >
            <Feather name="chevron-right" size={24} color={ColorSecond} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  renderLeaveCard = (item: LeaveData, index: number) => {
    const { theme } = this.context;
    const styles = createStyles(theme);

    const translateY =
      this.state.cardAnimations[index]?.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
      }) || 0;

    const opacity =
      this.state.cardAnimations[index]?.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }) || 1;

    const percentage = item.allow > 0 ? (item.balance / item.allow) * 100 : 0;

    return (
      <Animated.View
        key={index}
        style={[
          styles.leaveCardWrapper,
          {
            opacity,
            transform: [
              { translateY },
              { scale: this.scaleAnimations[index] || 1 },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => this.handleCardPress(index)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.leaveCard,
              { backgroundColor: this.getLeaveColor(index)[0] },
            ]}
          >
            <View style={styles.leaveCardHeader}>
              <View style={styles.leaveIconContainer}>
                <Feather
                  name={this.getLeaveIcon(item.leaveType)}
                  size={24}
                  color="#fff"
                />
              </View>
              <Text style={styles.leaveType}>{item.leaveType}</Text>
            </View>

            <View style={styles.leaveStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.allow}</Text>
                <Text style={styles.statLabel}>Allowed</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.taken}</Text>
                <Text style={styles.statLabel}>Taken</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.balance}</Text>
                <Text style={styles.statLabel}>Balance</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  render() {
    const { theme } = this.context;
    const styles = createStyles(theme);
    const { leaveData, loading, error } = this.state;

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
          <Text style={styles.headerTitle}>Leave Balance</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Year Selector */}
          {this.renderYearSelector()}

          {/* Check Balance Button */}
          <TouchableOpacity
            onPress={this.handleBalanceLeave}
            activeOpacity={0.8}
            disabled={loading}
          >
            <View style={styles.checkButton}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="search" size={20} color="#fff" />
                  <Text style={styles.checkButtonText}>
                    Check Leave Balance
                  </Text>
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

          {/* Leave Cards */}
          {leaveData.length > 0 && (
            <View style={styles.leaveCardsContainer}>
              <View style={styles.sectionHeader}>
                <Feather name="list" size={20} color={ColorSecond} />
                <Text style={styles.sectionTitle}>Leave Summary</Text>
              </View>
              {leaveData.map((item, index) =>
                this.renderLeaveCard(item, index),
              )}
            </View>
          )}

          {/* Empty State */}
          {!loading && leaveData.length === 0 && !error && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Feather name="inbox" size={48} color={theme.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No Leave Data</Text>
              <Text style={styles.emptyText}>
                Select a year and tap "Check Leave Balance" to view your leave
                details
              </Text>
            </View>
          )}
        </ScrollView>
        <Loader isShow={loading} />
        <MessageBox
          visible={this.state.showMessage}
          onPress={this.handleMessagePress}
          message={this.state.messageText}
          type={this.state.messageType}
        />
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
    yearSelectorContainer: {
      marginBottom: 20,
    },
    yearSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 16,
      padding: 16,
      elevation: 4,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      backgroundColor: theme.cardBackground,
    },
    yearButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(182, 119, 29, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(182, 119, 29, 0.3)',
    },
    yearDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    yearText: {
      fontSize: 24,
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
    leaveCardsContainer: {
      gap: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    leaveCardWrapper: {
      marginBottom: 0,
    },
    leaveCard: {
      borderRadius: 20,
      padding: 20,
      elevation: 6,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      paddingVertical: 16,
    },
    leaveCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    leaveIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    leaveType: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      flex: 1,
    },
    leaveStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '600',
    },
    statDivider: {
      width: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginHorizontal: 8,
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
  });

export default React.memo(BalanceLeave);
