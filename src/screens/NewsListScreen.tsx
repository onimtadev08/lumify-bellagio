import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Feather from '@react-native-vector-icons/feather';
import { ThemeContext, Theme } from '../contexts/ThemeContext';
import { ColorSecond, newsData } from '../data/data';
import { NewsItem } from '../types/news';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'NewsList'>;

interface State {
  headerAnimation: Animated.Value;
  cardAnimations: Animated.Value[];
}

class NewsListScreen extends Component<Props, State> {
  static contextType = ThemeContext;
  context!: React.ContextType<typeof ThemeContext>;

  private scaleAnimations: Animated.Value[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      headerAnimation: new Animated.Value(0),
      cardAnimations: newsData.map(() => new Animated.Value(0)),
    };
    this.scaleAnimations = newsData.map(() => new Animated.Value(1));
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

    Animated.stagger(80, animations).start();
  }

  handleCardPress = (newsItem: NewsItem, index: number) => {
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
    ]).start(() => {
      this.props.navigation.navigate('NewsDetail', { newsItem });
    });
  };

  renderNewsCard = (item: NewsItem, index: number) => {
    const { theme } = this.context;
    const styles = createListStyles(theme);

    const translateY = this.state.cardAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    const opacity = this.state.cardAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.cardWrapper,
          {
            opacity,
            transform: [{ translateY }, { scale: this.scaleAnimations[index] }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => this.handleCardPress(item, index)}
          activeOpacity={0.9}
        >
          <View style={styles.newsCard}>
            <Image
              source={item.image}
              style={styles.newsImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              {item.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>

            <View style={styles.newsContent}>
              <View style={styles.categoryRow}>
                <View style={styles.categoryBadge}>
                  <Feather name="tag" size={12} color={ColorSecond} />
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <Text style={styles.newsTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.newsDescription} numberOfLines={2}>
                {item.shortDescription}
              </Text>

              <View style={styles.readMoreRow}>
                <Text style={styles.readMoreText}>Read Full Article</Text>
                <Feather name="arrow-right" size={16} color={ColorSecond} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  render() {
    const { theme } = this.context;
    const styles = createListStyles(theme);

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
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => this.props.navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={ColorSecond} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>News & Updates</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.sectionHeader}>
            <Feather name="book" size={20} color={ColorSecond} />
            <Text style={styles.sectionTitle}>Latest News</Text>
          </View>

          {newsData.map((item, index) => this.renderNewsCard(item, index))}
        </ScrollView>
      </View>
    );
  }
}
const createListStyles = (theme: Theme) =>
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
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    cardWrapper: {
      marginBottom: 20,
    },
    newsCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: theme.isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)',
    },
    newsImage: {
      width: '100%',
      height: 200,
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 200,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      padding: 12,
    },
    newBadge: {
      backgroundColor: ColorSecond,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    newBadgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    newsContent: {
      padding: 16,
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.isDark
        ? 'rgba(182, 119, 29, 0.2)'
        : 'rgba(182, 119, 29, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '600',
      color: ColorSecond,
    },
    dateText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    newsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
      lineHeight: 26,
    },
    newsDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    readMoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    readMoreText: {
      fontSize: 14,
      fontWeight: '600',
      color: ColorSecond,
    },
  });

export default React.memo(NewsListScreen);
