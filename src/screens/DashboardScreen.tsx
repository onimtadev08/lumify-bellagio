// ============================================
// DASHBOARD WITH AUTO-PLAYING NEWS CAROUSEL CARD
// ============================================

// screens/DashboardScreen.tsx
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DrawerParamList, RootStackParamList } from '../types/navigation';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from '@react-native-vector-icons/feather';
import MemberImgView from '../Components/MemberImgView';

import { ThemeContext, Theme } from '../contexts/ThemeContext';
import { newsData } from '../data/data';
import NewsFeed from '../Components/NewsFeed';

const { width } = Dimensions.get('window');
const ColorSecond = '#B6771D';

type Props = CompositeScreenProps<
  DrawerScreenProps<DrawerParamList, 'DashboardScreen'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface State {
  headerAnimation: Animated.Value;
  cardAnimations: Animated.Value[];
  imageModalVisible: boolean;
  showNewsFeed: boolean;
  newsBadgePulse: Animated.Value;
  currentNewsIndex: number;
  newsCardAnimation: Animated.Value;
}

class DashboardScreen extends Component<Props, State> {
  static contextType = ThemeContext;
  context!: React.ContextType<typeof ThemeContext>;

  private scaleAnimations: Animated.Value[] = [];
  private shineAnimations: Animated.Value[] = [];
  private newsAutoPlayTimer: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    const cards = this.getCards();
    this.state = {
      headerAnimation: new Animated.Value(0),
      cardAnimations: cards.map(() => new Animated.Value(0)),
      imageModalVisible: false,
      showNewsFeed: true,
      newsBadgePulse: new Animated.Value(1),
      currentNewsIndex: 0,
      newsCardAnimation: new Animated.Value(1),
    };
    this.scaleAnimations = cards.map(() => new Animated.Value(1));
    this.shineAnimations = cards.map(() => new Animated.Value(0));
  }

  componentDidMount() {
    Animated.spring(this.state.headerAnimation, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();

    const animations = this.state.cardAnimations.map((anim, index) =>
      Animated.spring(anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: index * 100,
        useNativeDriver: true,
      }),
    );

    Animated.stagger(50, animations).start(() => {
      this.startShineAnimations();
    });

    this.startNewsBadgePulse();
    this.startNewsAutoPlay();
  }

  componentWillUnmount() {
    if (this.newsAutoPlayTimer) {
      clearInterval(this.newsAutoPlayTimer);
    }
  }

  startNewsAutoPlay = () => {
    // Auto-play news every 4 seconds
    this.newsAutoPlayTimer = setInterval(() => {
      this.animateToNextNews();
    }, 4000);
  };

  animateToNextNews = () => {
    // Fade out
    Animated.timing(this.state.newsCardAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Update index
      this.setState(
        prevState => ({
          currentNewsIndex: (prevState.currentNewsIndex + 1) % newsData.length,
        }),
        () => {
          // Fade in
          Animated.timing(this.state.newsCardAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        },
      );
    });
  };

  startShineAnimations = () => {
    const shineSequences = this.shineAnimations.map((anim, index) =>
      Animated.sequence([
        Animated.delay(index * 300),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.delay(1500),
          ]),
        ),
      ]),
    );
    shineSequences.forEach(seq => seq.start());
  };

  startNewsBadgePulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.newsBadgePulse, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.newsBadgePulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  handleAvatarPress = () => {
    this.setState({ imageModalVisible: true });
  };

  handleCloseModal = () => {
    this.setState({ imageModalVisible: false });
  };

  handleNewsFeedDismiss = () => {
    this.setState({ showNewsFeed: false });
  };

  handleNewsFeedReadMore = () => {
    this.setState({ showNewsFeed: false });
    this.props.navigation.navigate('NewsList');
  };

  handleNewsButtonPress = () => {
    this.props.navigation.navigate('NewsList');
  };

  handleNewsCardPress = () => {
    this.props.navigation.navigate('NewsList');
  };

  openDrawer = () => {
    this.props.navigation.openDrawer();
  };

  handleCardPress = (cardName: string, index: number) => {
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

    console.log(`${cardName} pressed`);
    if (cardName === 'Salary Slip') {
      this.props.navigation.navigate('SalarySlip');
    } else if (cardName === 'Balance Leave') {
      this.props.navigation.navigate('BalanceLeave');
    } else if (cardName === 'Attendance Card') {
      this.props.navigation.navigate('AttendanceCard');
    } else if (cardName === 'Daily Payment\nList') {
      this.props.navigation.navigate('DailyPaymentList');
    } else if (cardName === 'Settings') {
      this.props.navigation.navigate('Settings');
    }
  };

  getCards = () => [
    {
      id: 1,
      name: 'Salary Slip',
      icon: 'dollar-sign',
    },
    {
      id: 2,
      name: 'Balance Leave',
      icon: 'calendar',
    },
    {
      id: 3,
      name: 'Attendance Card',
      icon: 'clipboard',
    },
    {
      id: 4,
      name: 'Daily Payment\nList',
      icon: 'credit-card',
    },
    {
      id: 5,
      name: 'Settings',
      icon: 'settings',
    },
  ];

  getNewNewsCount = () => {
    return newsData.filter(news => news.isNew).length;
  };

  extractKeyHighlight = (description: string | undefined): string => {
    // Handle undefined or empty description
    if (!description || description.trim() === '') {
      return 'No description available';
    }

    // Extract first sentence or first 80 characters as highlight
    const firstSentence = description.split('.')[0];
    if (firstSentence.length > 80) {
      return firstSentence.substring(0, 77) + '...';
    }
    return firstSentence + (description.includes('.') ? '.' : '');
  };

  renderNewsCard = () => {
    const { theme, isDarkMode } = this.context;
    const currentNews = newsData[this.state.currentNewsIndex];
    const styles = createStyles(theme, isDarkMode);

    if (!currentNews) return null;

    const highlight = this.extractKeyHighlight(currentNews.description);

    return (
      <Animated.View
        style={[
          styles.newsCardWrapper,
          {
            opacity: this.state.newsCardAnimation,
          },
        ]}
      >
        <TouchableOpacity
          onPress={this.handleNewsCardPress}
          activeOpacity={0.8}
        >
          <View style={styles.newsCardContainer}>
            <LinearGradient
              colors={['#1e293b', '#334155']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.newsCard}
            >
              {/* News Image */}
              <View style={styles.newsImageContainer}>
                <Image
                  source={currentNews.image}
                  style={styles.newsImage}
                  resizeMode="cover"
                />
                {/* <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.newsImageGradient}
                /> */}
                {currentNews.isNew && (
                  <View style={styles.newsBadgeOnCard}>
                    <Text style={styles.newsBadgeOnCardText}>NEW</Text>
                  </View>
                )}
              </View>

              {/* News Content */}
              <View style={styles.newsContent}>
                <View style={styles.newsHeader}>
                  <Feather name="zap" size={14} color="#fbbf24" />
                  <Text style={styles.newsTitle} numberOfLines={1}>
                    {currentNews.title}
                  </Text>
                </View>
                <Text style={styles.newsHighlight} numberOfLines={2}>
                  {highlight}
                </Text>

                {/* Progress Indicators */}
                <View style={styles.newsIndicators}>
                  {newsData.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.newsIndicator,
                        index === this.state.currentNewsIndex &&
                          styles.newsIndicatorActive,
                      ]}
                    />
                  ))}
                </View>

                <View style={styles.newsFooter}>
                  <Text style={styles.newsDate}>{currentNews.date}</Text>
                  <View style={styles.newsReadMore}>
                    <Text style={styles.newsReadMoreText}>More</Text>
                    <Feather name="arrow-right" size={12} color="#fbbf24" />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  render() {
    const { theme, isDarkMode } = this.context;
    const { emp_Name, photo } = this.props.route.params;
    const cards = this.getCards();
    const newNewsCount = this.getNewNewsCount();

    const headerTranslateY = this.state.headerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, 0],
    });

    const headerOpacity = this.state.headerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const styles = createStyles(theme, isDarkMode);

    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <TouchableOpacity onPress={this.openDrawer} style={styles.menuButton}>
            <View style={styles.menuIconContainer}>
              <FontAwesome6
                name="bars"
                size={22}
                color={ColorSecond}
                iconStyle="solid"
              />
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{emp_Name}</Text>
            </View>

            {/* News Button */}
            <TouchableOpacity
              onPress={this.handleNewsButtonPress}
              activeOpacity={0.8}
              style={styles.newsButton}
            >
              <View style={styles.newsIconContainer}>
                <Feather name="bell" size={20} color={ColorSecond} />
                {newNewsCount > 0 && (
                  <Animated.View
                    style={[
                      styles.newsBadge,
                      {
                        transform: [{ scale: this.state.newsBadgePulse }],
                      },
                    ]}
                  >
                    <Text style={styles.newsBadgeText}>{newNewsCount}</Text>
                  </Animated.View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={this.handleAvatarPress}
              activeOpacity={0.8}
              style={styles.avatarContainer}
            >
              <Image
                source={{ uri: `data:image/jpeg;base64,${photo}` }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.titleContainer}>
            <LottieView
              source={require('../assets/images/LottieGif/Dashboard.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
              resizeMode="contain"
              speed={1.0}
            />
            <Text style={styles.title}>
              <Text style={styles.titleDash}>Dash</Text>
              <Text style={styles.titleBoard}>Board</Text>
            </Text>
          </View>

          {/* Auto-Playing News Card */}
          <View style={styles.cardsContainer}>
            {newsData.length > 0 && this.renderNewsCard()}

            {cards.map((card, index) => {
              const translateY = this.state.cardAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              });

              const opacity = this.state.cardAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              });

              const shineTranslateX = this.shineAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [-width * 0.5, width * 0.5],
              });

              const iconColor = index % 2 === 0 ? ColorSecond : '#fff';
              const isWhiteCard = index % 2 === 0;

              return (
                <Animated.View
                  key={card.id}
                  style={[
                    styles.cardWrapper,
                    {
                      opacity,
                      transform: [
                        { translateY },
                        { scale: this.scaleAnimations[index] },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => this.handleCardPress(card.name, index)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardContainer}>
                      <LinearGradient
                        colors={
                          isWhiteCard
                            ? [theme.cardBackground, theme.inputBackground]
                            : [ColorSecond, '#D4933A']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.card,
                          isWhiteCard && !isDarkMode && styles.cardWithBorder,
                        ]}
                      >
                        <View style={styles.cardIconContainer}>
                          <Feather
                            name={card.icon}
                            color={iconColor}
                            size={28}
                          />
                        </View>
                        <Text
                          style={[
                            styles.cardText,
                            { color: isWhiteCard ? theme.text : '#fff' },
                          ]}
                        >
                          {card.name}
                        </Text>
                      </LinearGradient>

                      <Animated.View
                        style={[
                          styles.shineOverlay,
                          {
                            transform: [
                              { translateX: shineTranslateX },
                              { rotate: '25deg' },
                            ],
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={[
                            'transparent',
                            'rgba(255, 255, 255, 0.11)',
                            'rgba(255, 255, 255, 0.31)',
                            'rgba(255, 255, 255, 0.11)',
                            'transparent',
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.shineGradient}
                        />
                      </Animated.View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

        <MemberImgView
          visible={this.state.imageModalVisible}
          photo={photo}
          name={emp_Name}
          onClose={this.handleCloseModal}
        />

        <NewsFeed
          isShow={this.state.showNewsFeed}
          onDismiss={this.handleNewsFeedDismiss}
          onReadMore={this.handleNewsFeedReadMore}
        />
      </View>
    );
  }
}

export default DashboardScreen;

const createStyles = (theme: Theme, isDarkMode: boolean) =>
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
    menuButton: {
      padding: 4,
    },
    menuIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(182, 119, 29, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(182, 119, 29, 0.3)',
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    newsButton: {
      marginLeft: 8,
    },
    newsIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(182, 119, 29, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(182, 119, 29, 0.3)',
      position: 'relative',
    },
    newsBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: '#ef4444',
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: theme.headerBackground,
      elevation: 3,
      shadowColor: '#ef4444',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 3,
    },
    newsBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 2,
      borderColor: ColorSecond,
    },
    welcomeText: {
      color: theme.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
    userName: {
      color: theme.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 2,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 10,
    },
    lottieAnimation: {
      width: 60,
      height: 60,
      marginRight: 8,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    titleDash: {
      color: ColorSecond,
    },
    titleBoard: {
      color: theme.text,
    },
    // News Card Styles
    newsCardWrapper: {
      flex: 1,
      minWidth: '45%',
      maxWidth: '48%',
    },
    newsCardContainer: {
      borderRadius: 20,
      overflow: 'hidden',
    },
    newsCard: {
      borderRadius: 20,
      minHeight: 180,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      overflow: 'hidden',
    },
    newsImageContainer: {
      width: '100%',
      height: 90,
      position: 'relative',
    },
    newsImage: {
      width: '100%',
      height: '100%',
    },
    newsImageGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 40,
    },
    newsBadgeOnCard: {
      position: 'absolute',
      top: 6,
      right: 6,
      backgroundColor: '#ef4444',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      elevation: 3,
    },
    newsBadgeOnCardText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    newsContent: {
      padding: 10,
      flex: 1,
      justifyContent: 'space-between',
    },
    newsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 4,
    },
    newsTitle: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
      flex: 1,
    },
    newsHighlight: {
      color: '#cbd5e1',
      fontSize: 11,
      lineHeight: 15,
      marginBottom: 6,
    },
    newsIndicators: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
      marginBottom: 6,
    },
    newsIndicator: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    newsIndicatorActive: {
      backgroundColor: '#fbbf24',
      width: 16,
    },
    newsFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    newsDate: {
      color: '#94a3b8',
      fontSize: 10,
    },
    newsReadMore: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    newsReadMoreText: {
      color: '#fbbf24',
      fontSize: 11,
      fontWeight: '600',
    },
    cardsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      justifyContent: 'space-between',
    },
    cardWrapper: {
      flex: 1,
      minWidth: '45%',
      maxWidth: '48%',
    },
    cardContainer: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 20,
    },
    card: {
      borderRadius: 20,
      minHeight: 180,
      elevation: 6,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      justifyContent: 'center',
      width: '100%',
      alignItems: 'center',
    },
    cardWithBorder: {
      borderWidth: 1,
      borderColor: ColorSecond,
    },
    cardIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardText: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.3,
      marginBottom: 8,
      lineHeight: 20,
      textAlign: 'center',
    },
    shineOverlay: {
      position: 'absolute',
      top: -20,
      left: -20,
      right: -20,
      bottom: -70,
      zIndex: 10,
      pointerEvents: 'none',
      opacity: 0.5,
    },
    shineGradient: {
      flex: 1,
      width: width * 0.4,
    },
  });
