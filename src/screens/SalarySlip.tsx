import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { ColorFirst, ColorSecond, MessageType } from '../data/data';
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
}

// Zoomable Slip Component using new Gesture API
const ZoomableSlip = ({
  content,
  resetKey,
}: {
  content: string;
  resetKey: number;
}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Reset zoom when resetKey changes
  React.useEffect(() => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [resetKey]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      // Clamp scale between 0.5 and 3
      if (scale.value < 0.5) {
        scale.value = withSpring(0.5);
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      }
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate(e => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1);
      savedScale.value = 1;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.slipContainer, animatedStyle]}>
        <Text style={styles.slipText}>{content}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

class SalarySlip extends Component<SalarySlipProps, SalarySlipState> {
  private currentYear: number;
  private currentMonth: number;
  private years: number[];
  private months: string[];

  constructor(props: SalarySlipProps) {
    super(props);

    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();

    // Generate years (current year and past 5 years)
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
    };
  }

  handleGoBack = () => {
    if (this.props.navigation) {
      this.props.navigation.goBack();
    }
  };

  handleBackToForm = () => {
    this.setState({
      showSlip: false,
      slipContent: null,
    });
  };

  handleGetSalarySlip = async () => {
    const { selectedMonth, selectedYear } = this.state;

    // Convert month index to zero-padded string (0 -> "01", 10 -> "11")
    const monthNumber = (selectedMonth + 1).toString().padStart(2, '0');

    try {
      this.setState({ isLoading: true });
      const result = await CreateSlip(monthNumber, selectedYear.toString());

      if (result && result.trim().length > 0) {
        this.setState({
          isLoading: false,
          slipContent: result,
          showSlip: true,
        });
      } else {
        this.setState({ isLoading: false });
        Alert.alert('No Data', 'No salary slip found for the selected month.');
      }
    } catch (error) {
      this.setState({ isLoading: false });
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'Unable to fetch salary slip. Please try again later.',
      );
    }
  };

  handleResetZoom = () => {
    // Increment the key to trigger reset
    this.setState(prevState => ({
      resetZoomKey: prevState.resetZoomKey + 1,
    }));
  };

  // Convert slip content to HTML for PDF generation
  generateHTMLContent = () => {
    const { slipContent, selectedMonth, selectedYear } = this.state;

    // Escape HTML special characters and convert newlines to <br>
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

  // Download salary slip as PDF
  handleDownloadPDF = async () => {
    try {
      this.setState({ isDownloading: true });

      const { selectedMonth, selectedYear } = this.state;

      // Generate HTML content
      const htmlContent = this.generateHTMLContent();

      // Print to PDF using react-native-print
      await RNPrint.print({
        html: htmlContent,
        fileName: `SalarySlip_${this.months[selectedMonth]}_${selectedYear}`,
      });

      this.setState({ isDownloading: false });
    } catch (error) {
      this.setState({ isDownloading: false });

      // If user cancelled, don't show error
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
  renderSlipView = () => {
    const {
      selectedYear,
      selectedMonth,
      slipContent,
      resetZoomKey,
      isDownloading,
    } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={ColorFirst} />

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
              color="white"
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
          {/* Zoom Info Banner */}
          <View style={styles.zoomInfoContainer}>
            <Feather name="zoom-in" size={16} color={ColorSecond} />
            <Text style={styles.zoomInfoText}>
              Pinch to zoom • Pan to move • Double tap to reset
            </Text>
          </View>

          {/* Salary Slip Content with Pinch Zoom */}
          <View style={styles.slipWrapper}>
            {slipContent && (
              <ZoomableSlip content={slipContent} resetKey={resetZoomKey} />
            )}
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
        </ScrollView>

        {/* Show loader while downloading */}
        <Loader isShow={isDownloading} />
      </View>
    );
  };

  renderFormView = () => {
    const { selectedYear, selectedMonth, showYearPicker, showMonthPicker } =
      this.state;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={ColorFirst} />

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
              color="white"
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
              <LinearGradient
                colors={['#2a2a2a', '#1f1f1f']}
                style={styles.pickerGradient}
              >
                <Feather name="calendar" size={20} color={ColorSecond} />
                <Text style={styles.pickerText}>{selectedYear}</Text>
                <Feather
                  name={showYearPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#999"
                />
              </LinearGradient>
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
              <LinearGradient
                colors={['#2a2a2a', '#1f1f1f']}
                style={styles.pickerGradient}
              >
                <Feather name="calendar" size={20} color={ColorSecond} />
                <Text style={styles.pickerText}>
                  {this.months[selectedMonth]}
                </Text>
                <Feather
                  name={showMonthPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#999"
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Month Options */}
            {showMonthPicker && (
              <View style={styles.optionsContainer}>
                <ScrollView
                  style={styles.monthScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {this.months.map((month, index) => (
                    <TouchableOpacity
                      key={month}
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
                  ))}
                </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorFirst,
  },
  header: {
    padding: 24,
    paddingBottom: 30,
    backgroundColor: '#242424',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
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
    color: '#fff',
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
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  optionsContainer: {
    marginTop: 10,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
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
    borderBottomColor: '#2a2a2a',
  },
  selectedOption: {
    backgroundColor: 'rgba(182, 119, 29, 0.15)',
  },
  optionText: {
    fontSize: 15,
    color: '#999',
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
    color: '#999',
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
    backgroundColor: 'rgba(173, 130, 20, 1)',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  // Salary Slip View Styles
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
    color: '#999',
    marginLeft: 8,
    flex: 1,
  },
  slipWrapper: {
    marginBottom: 20,
    minHeight: 400,
  },
  slipContainer: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(182, 119, 29, 0.3)',
  },
  slipText: {
    fontSize: 13,
    color: '#fff',
    fontFamily: 'Courier',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(182, 119, 29, 0.3)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  downloadButton: {
    backgroundColor: 'rgba(173, 130, 20, 1)',
    borderColor: 'rgba(182, 119, 29, 0.5)',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
});

export default React.memo(SalarySlip);
