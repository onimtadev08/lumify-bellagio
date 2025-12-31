import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  FlatList,
} from 'react-native';
import { ColorSecond, MessageType } from '../data/data';
import Feather from '@react-native-vector-icons/feather';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import Loader from '../Components/Loader';
import { CreateSlip } from '../api/api';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import RNPrint from 'react-native-print';
import MessageBox from '../Components/MessageBox';
import { ThemeContext, Theme } from '../contexts/ThemeContext';

interface SalarySlipProps {
  navigation?: any;
}

interface SalarySlipState {
  selectedYear: number;
  selectedMonth: number;
  showYearPicker: boolean;
  showMonthPicker: boolean;
  isLoading: boolean;
  slipContent: string | null;
  showSlip: boolean;
  resetZoomKey: number;
  isDownloading: boolean;
  showMessage: boolean;
  messageType: MessageType;
  messageText: string;
  showEmptyState: boolean; // New state for empty state
}

// Zoomable Slip Component
const ZoomableSlip = ({
  content,
  resetKey,
  theme,
}: {
  content: string;
  resetKey: number;
  theme: Theme;
}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Reset zoom when resetKey changes
  React.useEffect(() => {
    scale.value = withSpring(1);
    savedScale.value = 1;
  }, [resetKey]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 0.5) {
        scale.value = withSpring(0.5);
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      }
      savedScale.value = scale.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1);
      savedScale.value = 1;
    });

  const composed = Gesture.Simultaneous(pinchGesture, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const styles = StyleSheet.create({
    slipContainer: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(182, 119, 29, 0.3)',
    },
    slipText: {
      fontSize: 13,
      color: theme.text,
      fontFamily: 'Courier',
      lineHeight: 20,
    },
  });

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.slipContainer, animatedStyle]}>
        <Text style={styles.slipText}>{content}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

class SalarySlip extends Component<SalarySlipProps, SalarySlipState> {
  static contextType = ThemeContext;
  context!: React.ContextType<typeof ThemeContext>;

  private currentYear: number;
  private currentMonth: number;
  private years: number[];
  private months: string[];

  constructor(props: SalarySlipProps) {
    super(props);
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();

    this.years = Array.from({ length: 6 }, (_, i) => this.currentYear - i);
    this.months = [
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

    this.state = {
      selectedYear: this.currentYear,
      selectedMonth: this.currentMonth,
      showYearPicker: false,
      showMonthPicker: false,
      isLoading: false,
      slipContent: null,
      showSlip: false,
      resetZoomKey: 0,
      isDownloading: false,
      showMessage: false,
      messageType: 'info',
      messageText: '',
      showEmptyState: false, // Initialize new state
    };
  }

  // Helper function to check if result is empty
  isResultEmpty = (result: any): boolean => {
    if (Array.isArray(result)) {
      return result.length === 0;
    }
    if (typeof result === 'string') {
      return result.trim().length === 0;
    }
    return !result || result === null || result === undefined;
  };

  handleGoBack = () => {
    if (this.props.navigation) {
      this.props.navigation.goBack();
    }
  };

  handleBackToForm = () => {
    this.setState({
      showSlip: false,
      slipContent: null,
      showEmptyState: false, // Reset empty state
    });
  };

  handleGetSalarySlip = async () => {
    const { selectedMonth, selectedYear } = this.state;
    const monthNumber = (selectedMonth + 1).toString().padStart(2, '0');

    try {
      this.setState({ isLoading: true });
      const response: any = await CreateSlip(
        monthNumber,
        selectedYear.toString(),
      );
      console.log('API response:', response);

      // Normalize response shape — some responses come back as JSON string
      let payload: any = response;
      if (typeof response === 'string') {
        try {
          payload = JSON.parse(response);
        } catch (e) {
          console.warn('Failed to parse CreateSlip response string:', e);
          payload = { status: false, result: null };
        }
      }

      const result = payload?.result ?? null;
      const isEmptyResult = this.isResultEmpty(result);
      console.log('Is Result Empty:', isEmptyResult);

      if (isEmptyResult) {
        this.setState({
          isLoading: false,
          showSlip: true,
          slipContent: null,
          showEmptyState: true,
        });
      } else {
        this.setState({
          isLoading: false,
          slipContent: String(result),
          showSlip: true,
          showEmptyState: false,
        });
      }
    } catch (error) {
      this.setState({
        isLoading: false,
        showSlip: false,
        slipContent: null,
        showEmptyState: false,
      });
      console.error('Error:', error);
      this.showMessageDialog(
        'error',
        'Failed to fetch salary slip. Please try again.',
      );
    }
  };

  handleResetZoom = () => {
    this.setState(prevState => ({
      resetZoomKey: prevState.resetZoomKey + 1,
    }));
  };

  generateHTMLContent = () => {
    const { slipContent, selectedMonth, selectedYear } = this.state;
    const escapedContent =
      slipContent
        ?.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>') || '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              line-height: 1.6;
              margin: 20px;
              color: #000;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #333;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .header h2 {
              margin: 5px 0;
              font-size: 16px;
              color: #666;
            }
            .content {
              white-space: pre-wrap;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Salary Slip</h1>
            <h2>${this.months[selectedMonth]} ${selectedYear}</h2>
          </div>
          <div class="content">
            ${escapedContent}
          </div>
        </body>
      </html>
    `;
  };

  handleDownloadPDF = async () => {
    try {
      this.setState({ isDownloading: true });
      const { selectedMonth, selectedYear } = this.state;
      const htmlContent = this.generateHTMLContent();

      await RNPrint.print({
        html: htmlContent,
        fileName: `SalarySlip_${this.months[selectedMonth]}_${selectedYear}`,
      });

      this.setState({ isDownloading: false });
    } catch (error) {
      this.setState({ isDownloading: false });
      if (error === 'User cancelled') {
        return;
      }
      console.error('Error generating PDF:', error);
      this.showMessageDialog(
        'error',
        'Error generating PDF. Please try again.',
      );
    }
  };

  toggleYearPicker = () => {
    this.setState(prevState => ({
      showYearPicker: !prevState.showYearPicker,
      showMonthPicker: false,
    }));
  };

  toggleMonthPicker = () => {
    this.setState(prevState => ({
      showMonthPicker: !prevState.showMonthPicker,
      showYearPicker: false,
    }));
  };

  selectYear = (year: number) => {
    this.setState({
      selectedYear: year,
      showYearPicker: false,
    });
  };

  selectMonth = (monthIndex: number) => {
    this.setState({
      selectedMonth: monthIndex,
      showMonthPicker: false,
    });
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

  renderEmptyState = () => {
    const { theme } = this.context;
    const styles = createStyles(theme);
    const { selectedMonth, selectedYear } = this.state;

    return (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyIconContainer}>
          <Feather name="file-text" size={48} color={theme.textSecondary} />
        </View>
        <Text style={styles.emptyStateTitle}>No Salary Slip Found</Text>
        <Text style={styles.emptyStateText}>
          No salary slip is available for{' '}
          <Text style={styles.emptyStateHighlight}>
            {this.months[selectedMonth]} {selectedYear}
          </Text>
        </Text>
        <Text style={styles.emptyStateSubtext}>
          Please try selecting a different month or contact HR if you believe
          this is an error.
        </Text>
      </View>
    );
  };

  renderSlipView = () => {
    const { theme } = this.context;
    const styles = createStyles(theme);
    const {
      selectedYear,
      selectedMonth,
      slipContent,
      resetZoomKey,
      isDownloading,
      showEmptyState, // Use new state
    } = this.state;

    // Check if content is empty or showing empty state
    const hasContent =
      slipContent && slipContent.trim().length > 0 && !showEmptyState;

    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={
            theme === this.context.theme ? 'light-content' : 'dark-content'
          }
          backgroundColor={theme.background}
        />
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={this.handleBackToForm}
            activeOpacity={0.7}
          >
            <FontAwesome6
              name="arrow-left"
              size={24}
              color={theme.text}
              iconStyle="solid"
            />
          </TouchableOpacity>
          <View style={styles.headerIconContainer}>
            <Feather name="file-text" size={28} color={ColorSecond} />
          </View>
          <Text style={styles.headerTitle}>Salary Slip</Text>
          <Text style={styles.headerSubtitle}>
            {this.months[selectedMonth]} {selectedYear}
          </Text>
        </SafeAreaView>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {hasContent ? (
            <>
              {/* Zoom Info Banner */}
              <View style={styles.zoomInfoContainer}>
                <Feather name="zoom-in" size={16} color={ColorSecond} />
                <Text style={styles.zoomInfoText}>
                  Pinch to zoom • Double tap to reset
                </Text>
              </View>

              {/* Salary Slip Content with Pinch Zoom */}
              <View style={styles.slipWrapper}>
                <ZoomableSlip
                  content={slipContent}
                  resetKey={resetZoomKey}
                  theme={theme}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                {/* Download as PDF Button */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.downloadButton]}
                  onPress={this.handleDownloadPDF}
                  activeOpacity={0.8}
                  disabled={isDownloading}
                >
                  <Feather
                    name={isDownloading ? 'loader' : 'download'}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.downloadButtonText}>
                    {isDownloading ? 'Generating PDF...' : 'Download as PDF'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={this.handleResetZoom}
                  activeOpacity={0.8}
                >
                  <Feather name="maximize" size={20} color={ColorSecond} />
                  <Text style={styles.actionButtonText}>Reset Zoom</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={this.handleBackToForm}
                  activeOpacity={0.8}
                >
                  <Feather name="edit" size={20} color={ColorSecond} />
                  <Text style={styles.actionButtonText}>
                    Select Different Month
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Empty State */}
              {this.renderEmptyState()}

              {/* Back Button for Empty State */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={this.handleBackToForm}
                activeOpacity={0.8}
              >
                <Feather name="arrow-left" size={20} color={ColorSecond} />
                <Text style={styles.actionButtonText}>
                  Select Different Month
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        <Loader isShow={isDownloading} />
      </View>
    );
  };

  renderFormView = () => {
    const { theme } = this.context;
    const styles = createStyles(theme);
    const { selectedYear, selectedMonth, showYearPicker, showMonthPicker } =
      this.state;

    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={
            theme === this.context.theme ? 'light-content' : 'dark-content'
          }
          backgroundColor={theme.background}
        />
        {/* Header */}
        <SafeAreaView style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={this.handleGoBack}
            activeOpacity={0.7}
          >
            <FontAwesome6
              name="arrow-left"
              size={24}
              color={theme.text}
              iconStyle="solid"
            />
          </TouchableOpacity>
          <View style={styles.headerIconContainer}>
            <Feather name="dollar-sign" size={28} color={ColorSecond} />
          </View>
          <Text style={styles.headerTitle}>Salary Slip</Text>
          <Text style={styles.headerSubtitle}>
            Select month and year to view your salary slip
          </Text>
        </SafeAreaView>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Year Picker */}
          <View style={styles.pickerSection}>
            <Text style={styles.label}>Select Year</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={this.toggleYearPicker}
              activeOpacity={0.7}
            >
              <View style={styles.pickerGradient}>
                <Feather name="calendar" size={20} color={ColorSecond} />
                <Text style={styles.pickerText}>{selectedYear}</Text>
                <Feather
                  name={showYearPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {/* Year Options */}
            {showYearPicker && (
              <View style={styles.optionsContainer}>
                {this.years.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.optionItem,
                      selectedYear === year && styles.selectedOption,
                    ]}
                    onPress={() => this.selectYear(year)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedYear === year && styles.selectedOptionText,
                      ]}
                    >
                      {year}
                    </Text>
                    {selectedYear === year && (
                      <Feather name="check" size={18} color={ColorSecond} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Month Picker */}
          <View style={styles.pickerSection}>
            <Text style={styles.label}>Select Month</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={this.toggleMonthPicker}
              activeOpacity={0.7}
            >
              <View style={styles.pickerGradient}>
                <Feather name="calendar" size={20} color={ColorSecond} />
                <Text style={styles.pickerText}>
                  {this.months[selectedMonth]}
                </Text>
                <Feather
                  name={showMonthPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {/* Month Options */}
            {showMonthPicker && (
              <View style={styles.optionsContainer}>
                <FlatList
                  data={this.months}
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  style={styles.monthScrollView}
                  renderItem={({ item: month, index }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        selectedMonth === index && styles.selectedOption,
                      ]}
                      onPress={() => this.selectMonth(index)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedMonth === index && styles.selectedOptionText,
                        ]}
                      >
                        {month}
                      </Text>
                      {selectedMonth === index && (
                        <Feather name="check" size={18} color={ColorSecond} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {/* Selected Date Display */}
          <View style={styles.selectedDateContainer}>
            <Feather name="info" size={16} color={ColorSecond} />
            <Text style={styles.selectedDateText}>
              You're viewing salary slip for{' '}
              <Text style={styles.selectedDateHighlight}>
                {this.months[selectedMonth]} {selectedYear}
              </Text>
            </Text>
          </View>

          {/* Get Salary Slip Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={this.handleGetSalarySlip}
            activeOpacity={0.8}
          >
            <View style={styles.submitGradient}>
              <Feather name="download" size={20} color="#fff" />
              <Text style={styles.submitText}>Get Salary Slip</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        <Loader isShow={this.state.isLoading} />
        <MessageBox
          visible={this.state.showMessage}
          onPress={this.handleMessagePress}
          message={this.state.messageText}
          type={this.state.messageType}
        />
      </View>
    );
  };

  render() {
    const { showSlip } = this.state;
    if (showSlip) {
      return this.renderSlipView();
    }
    return this.renderFormView();
  }
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 24,
      paddingBottom: 30,
      backgroundColor: theme.headerBackground,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      alignItems: 'center',
    },
    backButton: {
      position: 'absolute',
      top: 90,
      left: 24,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(182, 119, 29, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    headerIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(182, 119, 29, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 2,
      borderColor: 'rgba(182, 119, 29, 0.3)',
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
    },
    pickerSection: {
      marginBottom: 20,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 10,
      marginLeft: 4,
    },
    pickerButton: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    pickerGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: 'rgba(182, 119, 29, 0.3)',
      borderRadius: 12,
      height: 80,
      justifyContent: 'space-between',
      backgroundColor: theme.cardBackground,
    },
    pickerText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 12,
    },
    optionsContainer: {
      marginTop: 10,
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      overflow: 'hidden',
    },
    monthScrollView: {
      maxHeight: 300,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.inputBorder,
    },
    selectedOption: {
      backgroundColor: 'rgba(182, 119, 29, 0.15)',
    },
    optionText: {
      fontSize: 15,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    selectedOptionText: {
      color: ColorSecond,
      fontWeight: '600',
    },
    selectedDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(182, 119, 29, 0.1)',
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: 'rgba(182, 119, 29, 0.2)',
    },
    selectedDateText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 10,
      flex: 1,
    },
    selectedDateHighlight: {
      color: ColorSecond,
      fontWeight: '600',
    },
    submitButton: {
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 10,
    },
    submitGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      height: 70,
      borderRadius: 12,
      backgroundColor: ColorSecond,
    },
    submitText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
      marginLeft: 10,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    zoomInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(182, 119, 29, 0.1)',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(182, 119, 29, 0.2)',
    },
    zoomInfoText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 8,
      flex: 1,
    },
    slipWrapper: {
      marginBottom: 20,
      minHeight: 400,
    },
    actionButtonsContainer: {
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cardBackground,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(182, 119, 29, 0.3)',
    },
    actionButtonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 10,
    },
    downloadButton: {
      backgroundColor: ColorSecond,
      borderColor: 'rgba(182, 119, 29, 0.5)',
    },
    downloadButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 10,
    },
    // Empty State Styles
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 32,
    },
    emptyIconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: 'rgba(182, 119, 29, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      borderWidth: 2,
      borderColor: 'rgba(182, 119, 29, 0.2)',
    },
    emptyStateTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 24,
    },
    emptyStateHighlight: {
      color: ColorSecond,
      fontWeight: '600',
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 20,
      opacity: 0.8,
    },
  });

export default React.memo(SalarySlip);
