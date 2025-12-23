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
  Modal,
} from 'react-native';
import { GetAttendanceCard } from '../api/api';
import Feather from '@react-native-vector-icons/feather';

const { width } = Dimensions.get('window');
const ColorFirst = '#1a1a1a';
const ColorSecond = '#B6771D';

interface AttendanceData {
  GamNo: number;
  EpfNo: string;
  EmpName: string;
  Designation: string;
  wdate: string;
  wDay: number;
  RosterCode: string;
  SecInTime: string;
  InTime: string;
  OutTime: string;
  LateMins: number | null;
  Status: string;
  WorkHrs: string | null;
  Leaveinform: string | null;
  OT: string | null;
  WorkMins: number | null;
  DayType: string;
}

interface AttendanceCardProps {
  navigation?: any;
}

interface AttendanceCardState {
  selectedYear: number;
  selectedMonth: string;
  attendanceData: AttendanceData[];
  loading: boolean;
  error: string | null;
  headerAnimation: Animated.Value;
  showMonthPicker: boolean;
  showYearPicker: boolean;
  selectedDayDetails: AttendanceData | null;
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

class AttendanceCard extends React.Component<
  AttendanceCardProps,
  AttendanceCardState
> {
  constructor(props: AttendanceCardProps) {
    super(props);
    const currentDate = new Date();
    this.state = {
      selectedYear: currentDate.getFullYear(),
      selectedMonth: MONTHS[currentDate.getMonth()],
      attendanceData: [],
      loading: false,
      error: null,
      headerAnimation: new Animated.Value(0),
      showMonthPicker: false,
      showYearPicker: false,
      selectedDayDetails: null,
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

  handleAttendance = async () => {
    this.setState({ loading: true, error: null });
    try {
      const result = await GetAttendanceCard(
        this.state.selectedMonth,
        this.state.selectedYear,
      );
      console.log('Attendance Result:', result);
      this.setState({
        attendanceData: result,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      this.setState({
        error: 'Failed to fetch attendance data. Please try again.',
        loading: false,
      });
    }
  };

  getStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'PRESENT':
        return '#16a34a';
      case 'ABSENT':
        return '#dc2626';
      case 'OFF':
        return '#6b7280';
      case 'LEAVE':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  getStatusIcon = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'PRESENT':
        return 'check-circle';
      case 'ABSENT':
        return 'x-circle';
      case 'OFF':
        return 'minus-circle';
      case 'LEAVE':
        return 'calendar';
      default:
        return 'help-circle';
    }
  };

  getDayTypeColor = (dayType: string): string => {
    switch (dayType.toUpperCase()) {
      case 'POYA':
      case 'HOLIDAY':
        return '#f59e0b';
      default:
        return '#fff';
    }
  };

  renderMonthPicker = () => {
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
            <View
              style={[styles.pickerContent, { backgroundColor: '#242424' }]}
            >
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
                        attendanceData: [],
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

  renderYearPicker = () => {
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
            <View
              style={[styles.pickerContent, { backgroundColor: '#242424' }]}
            >
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
                        attendanceData: [],
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

  renderDayDetailsModal = () => {
    const { selectedDayDetails } = this.state;
    if (!selectedDayDetails) return null;

    return (
      <Modal
        transparent={true}
        visible={!!selectedDayDetails}
        animationType="fade"
      >
        <View style={styles.detailsContainer}>
          <View
            style={[
              styles.detailsContent,
              {
                backgroundColor: this.getStatusColor(selectedDayDetails.Status),
              },
            ]}
          >
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsDay}>
                Day {selectedDayDetails.wDay}
              </Text>
              <TouchableOpacity
                onPress={() => this.setState({ selectedDayDetails: null })}
              >
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsBody}>
              <View style={styles.detailRow}>
                <Feather name="calendar" size={18} color="#fff" />
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedDayDetails.wdate).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Feather
                  name={this.getStatusIcon(selectedDayDetails.Status)}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>
                  {selectedDayDetails.Status || 'N/A'}
                </Text>
              </View>

              {selectedDayDetails.InTime && (
                <View style={styles.detailRow}>
                  <Feather name="log-in" size={18} color="#fff" />
                  <Text style={styles.detailLabel}>In Time:</Text>
                  <Text style={styles.detailValue}>
                    {selectedDayDetails.InTime}
                  </Text>
                </View>
              )}

              {selectedDayDetails.OutTime && (
                <View style={styles.detailRow}>
                  <Feather name="log-out" size={18} color="#fff" />
                  <Text style={styles.detailLabel}>Out Time:</Text>
                  <Text style={styles.detailValue}>
                    {selectedDayDetails.OutTime}
                  </Text>
                </View>
              )}

              {selectedDayDetails.WorkHrs && (
                <View style={styles.detailRow}>
                  <Feather name="clock" size={18} color="#fff" />
                  <Text style={styles.detailLabel}>Work Hours:</Text>
                  <Text style={styles.detailValue}>
                    {selectedDayDetails.WorkHrs}
                  </Text>
                </View>
              )}

              {selectedDayDetails.OT && (
                <View style={styles.detailRow}>
                  <Feather name="zap" size={18} color="#fff" />
                  <Text style={styles.detailLabel}>Overtime:</Text>
                  <Text style={styles.detailValue}>
                    {selectedDayDetails.OT}
                  </Text>
                </View>
              )}

              {selectedDayDetails.DayType && (
                <View style={styles.detailRow}>
                  <Feather name="info" size={18} color="#fff" />
                  <Text style={styles.detailLabel}>Day Type:</Text>
                  <Text style={styles.detailValue}>
                    {selectedDayDetails.DayType}
                  </Text>
                </View>
              )}

              {selectedDayDetails.LateMins !== null &&
                selectedDayDetails.LateMins > 0 && (
                  <View style={styles.detailRow}>
                    <Feather name="alert-circle" size={18} color="#fff" />
                    <Text style={styles.detailLabel}>Late:</Text>
                    <Text style={styles.detailValue}>
                      {selectedDayDetails.LateMins} mins
                    </Text>
                  </View>
                )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  renderCalendarDay = (item: AttendanceData) => {
    const hasData = item.Status && item.Status !== '';
    const color = hasData ? this.getStatusColor(item.Status) : '#2a2a2a';

    return (
      <TouchableOpacity
        key={item.wDay}
        style={styles.dayCard}
        onPress={() => hasData && this.setState({ selectedDayDetails: item })}
        activeOpacity={hasData ? 0.7 : 1}
        disabled={!hasData}
      >
        <View style={[styles.dayCardGradient, { backgroundColor: color }]}>
          <Text style={styles.dayNumber}>{item.wDay}</Text>
          {hasData && (
            <>
              <Feather
                name={this.getStatusIcon(item.Status)}
                size={16}
                color="#fff"
                style={styles.dayIcon}
              />
              {item.OT && (
                <View style={styles.otBadge}>
                  <Text style={styles.otBadgeText}>OT</Text>
                </View>
              )}
              {item.DayType && item.DayType !== 'NORMAL' && (
                <Text style={styles.dayTypeText}>{item.DayType}</Text>
              )}
            </>
          )}
          {!hasData && <Text style={styles.noDataText}>-</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  renderSummary = () => {
    const { attendanceData } = this.state;
    if (attendanceData.length === 0) return null;

    const present = attendanceData.filter(d => d.Status === 'PRESENT').length;
    const absent = attendanceData.filter(d => d.Status === 'ABSENT').length;
    const off = attendanceData.filter(d => d.Status === 'OFF').length;
    const totalWorkHours = attendanceData
      .filter(d => d.WorkMins)
      .reduce((sum, d) => sum + (d.WorkMins || 0), 0);
    const hours = Math.floor(totalWorkHours / 60);
    const mins = totalWorkHours % 60;

    return (
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#242424' }]}>
          <View style={styles.summaryHeader}>
            <Feather name="bar-chart-2" size={20} color={ColorSecond} />
            <Text style={styles.summaryTitle}>Monthly Summary</Text>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.statBox}>
              <View
                style={[styles.statGradient, { backgroundColor: '#16a34a' }]}
              >
                <Text style={styles.statValue}>{present}</Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>
            </View>

            <View style={styles.statBox}>
              <View
                style={[styles.statGradient, { backgroundColor: '#dc2626' }]}
              >
                <Text style={styles.statValue}>{absent}</Text>
                <Text style={styles.statLabel}>Absent</Text>
              </View>
            </View>

            <View style={styles.statBox}>
              <View
                style={[styles.statGradient, { backgroundColor: '#6b7280' }]}
              >
                <Text style={styles.statValue}>{off}</Text>
                <Text style={styles.statLabel}>Off Days</Text>
              </View>
            </View>

            <View style={styles.statBox}>
              <View
                style={[styles.statGradient, { backgroundColor: ColorSecond }]}
              >
                <Text style={styles.statValue}>
                  {hours}h {mins}m
                </Text>
                <Text style={styles.statLabel}>Total Work</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  render() {
    const { attendanceData, loading, error } = this.state;

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
          <Text style={styles.headerTitle}>Attendance Card</Text>
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
              <View style={[styles.selector, { backgroundColor: '#242424' }]}>
                <Feather name="calendar" size={20} color={ColorSecond} />
                <View style={styles.selectorTextContainer}>
                  <Text style={styles.selectorLabel}>Month</Text>
                  <Text style={styles.selectorValue}>
                    {this.state.selectedMonth}
                  </Text>
                </View>
                <Feather name="chevron-down" size={20} color="#999" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectorHalf}
              onPress={() => this.setState({ showYearPicker: true })}
              activeOpacity={0.8}
            >
              <View style={[styles.selector, { backgroundColor: '#242424' }]}>
                <Feather name="calendar" size={20} color={ColorSecond} />
                <View style={styles.selectorTextContainer}>
                  <Text style={styles.selectorLabel}>Year</Text>
                  <Text style={styles.selectorValue}>
                    {this.state.selectedYear}
                  </Text>
                </View>
                <Feather name="chevron-down" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Get Attendance Button */}
          <TouchableOpacity
            onPress={this.handleAttendance}
            activeOpacity={0.8}
            disabled={loading}
          >
            <View
              style={[styles.checkButton, { backgroundColor: ColorSecond }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="search" size={20} color="#fff" />
                  <Text style={styles.checkButtonText}>
                    Get Attendance Card
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

          {/* Summary */}
          {this.renderSummary()}

          {/* Calendar Grid */}
          {attendanceData.length > 0 && (
            <View style={styles.calendarContainer}>
              <View style={styles.sectionHeader}>
                <Feather name="grid" size={20} color={ColorSecond} />
                <Text style={styles.sectionTitle}>Daily Attendance</Text>
              </View>
              <View style={styles.calendarGrid}>
                {attendanceData.map(item => this.renderCalendarDay(item))}
              </View>
              <Text style={styles.calendarHint}>
                Tap on any day to view details
              </Text>
            </View>
          )}

          {/* Empty State */}
          {!loading && attendanceData.length === 0 && !error && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Feather name="calendar" size={48} color="#666" />
              </View>
              <Text style={styles.emptyTitle}>No Attendance Data</Text>
              <Text style={styles.emptyText}>
                Select a month and year, then tap "Get Attendance Card" to view
                your attendance details
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Modals */}
        {this.renderMonthPicker()}
        {this.renderYearPicker()}
        {this.renderDayDetailsModal()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorFirst,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#242424',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
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
    color: '#fff',
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
    gap: 12,
    marginBottom: 20,
  },
  selectorHalf: {
    flex: 1,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  selectorTextContainer: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    color: '#fff',
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
  statGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  calendarContainer: {
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
    color: '#fff',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  dayCard: {
    width: 80,
    aspectRatio: 1,
  },
  dayCardGradient: {
    flex: 1,
    borderRadius: 12,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  dayIcon: {
    marginTop: 4,
  },
  otBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  otBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  dayTypeText: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
  },
  calendarHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
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
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
    color: '#fff',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: ColorSecond,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailsContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  detailsDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  detailsBody: {
    gap: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    flex: 1,
  },
});

export default React.memo(AttendanceCard);
