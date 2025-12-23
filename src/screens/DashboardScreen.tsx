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

const { width } = Dimensions.get('window');

const ColorFirst = '#1a1a1a';
const ColorSecond = '#B6771D';

type Props = CompositeScreenProps<
  DrawerScreenProps<DrawerParamList, 'DashboardScreen'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface State {
  headerAnimation: Animated.Value;
  cardAnimations: Animated.Value[];
  imageModalVisible: boolean;
}

class DashboardScreen extends Component<Props, State> {
  private scaleAnimations: Animated.Value[] = [];
  private shineAnimations: Animated.Value[] = [];

  constructor(props: Props) {
    super(props);
    const cards = this.getCards();
    this.state = {
      headerAnimation: new Animated.Value(0),
      cardAnimations: cards.map(() => new Animated.Value(0)),
      imageModalVisible: false,
    };
    this.scaleAnimations = cards.map(() => new Animated.Value(1));
    this.shineAnimations = cards.map(() => new Animated.Value(0));
  }

  componentDidMount() {
    // Animate header
    Animated.spring(this.state.headerAnimation, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Staggered card animations
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
      // Start shine animations after cards appear
      this.startShineAnimations();
    });
  }

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

  handleAvatarPress = () => {
    this.setState({ imageModalVisible: true });
  };

  handleCloseModal = () => {
    this.setState({ imageModalVisible: false });
  };

  handleLogout = () => {
    this.props.navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
  };

  openDrawer = () => {
    this.props.navigation.openDrawer();
  };

  handleCardPress = (cardName: string, index: number) => {
    // Scale animation on press
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

  render() {
    const { emp_Name, photo } = this.props.route.params;
    const cards = this.getCards();

    const headerTranslateY = this.state.headerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, 0],
    });

    const headerOpacity = this.state.headerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={styles.container}>
        {/* Animated Header */}
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

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Dashboard Title with Lottie */}
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

          {/* Animated Cards - Grid Layout */}
          <View style={styles.cardsContainer}>
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
                          index % 2 === 0
                            ? ['#242424', '#2a2a2a']
                            : [ColorSecond, '#D4933A']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.card}
                      >
                        <View style={styles.cardIconContainer}>
                          <Feather
                            name={card.icon}
                            color={iconColor}
                            size={28}
                          />
                        </View>
                        <Text style={[styles.cardText, { color: '#fff' }]}>
                          {card.name}
                        </Text>
                      </LinearGradient>

                      {/* Shine Effect */}
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

        {/* Member Image View Modal */}
        <MemberImgView
          visible={this.state.imageModalVisible}
          photo={photo}
          name={emp_Name}
          onClose={this.handleCloseModal}
        />
      </View>
    );
  }
}

export default DashboardScreen;

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
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4ade80',
    borderWidth: 2,
    borderColor: '#242424',
  },
  welcomeText: {
    color: '#999',
    fontSize: 13,
    fontWeight: '500',
  },
  userName: {
    color: '#fff',
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
    color: '#fff',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
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
