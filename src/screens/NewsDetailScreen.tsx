import Feather from '@react-native-vector-icons/feather';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ColorSecond } from '../data/data';
import { Theme, ThemeContext } from '../contexts/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import React, { Component } from 'react';

class NewsDetailScreen extends Component<
  NativeStackScreenProps<RootStackParamList, 'NewsDetail'>
> {
  static contextType = ThemeContext;
  context!: React.ContextType<typeof ThemeContext>;

  private scrollY = new Animated.Value(0);

  handleBackPress = () => {
    // Navigate to NewsList screen specifically
    this.props.navigation.navigate('NewsList');
  };

  render() {
    const { theme } = this.context;
    const styles = createDetailStyles(theme);
    const { newsItem } = this.props.route.params;

    const imageScale = this.scrollY.interpolate({
      inputRange: [-100, 0],
      outputRange: [1.3, 1],
      extrapolate: 'clamp',
    });

    const imageOpacity = this.scrollY.interpolate({
      inputRange: [0, 200],
      outputRange: [1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.container}>
        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
        >
          <Animated.View
            style={[
              styles.imageContainer,
              {
                transform: [{ scale: imageScale }],
                opacity: imageOpacity,
              },
            ]}
          >
            <Image
              source={newsItem.image}
              style={styles.headerImage}
              resizeMode="cover"
            />
            <View style={styles.imageGradient} />
          </Animated.View>

          <View style={styles.contentContainer}>
            <View style={styles.metaRow}>
              <View style={styles.categoryBadge}>
                <Feather name="tag" size={14} color={ColorSecond} />
                <Text style={styles.categoryText}>{newsItem.category}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Feather
                  name="calendar"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={styles.dateText}>{newsItem.date}</Text>
              </View>
            </View>

            <Text style={styles.title}>{newsItem.title}</Text>

            <View style={styles.divider} />

            <Text style={styles.fullContent}>{newsItem.fullContent}</Text>

            <View style={styles.shareSection}>
              <Text style={styles.shareTitle}>Share this article</Text>
              <View style={styles.shareButtons}>
                <TouchableOpacity style={styles.shareButton}>
                  <Feather name="facebook" size={20} color={ColorSecond} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton}>
                  <Feather name="twitter" size={20} color={ColorSecond} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton}>
                  <Feather name="share-2" size={20} color={ColorSecond} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.ScrollView>

        <TouchableOpacity
          style={styles.backButton}
          onPress={this.handleBackPress}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }
}

const createDetailStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    imageContainer: {
      width: '100%',
      height: 300,
      position: 'relative',
    },
    headerImage: {
      width: '100%',
      height: '100%',
    },
    imageGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 100,
      backgroundColor: theme.isDark
        ? 'rgba(0, 0, 0, 0.6)'
        : 'rgba(255, 255, 255, 0.6)',
    },
    contentContainer: {
      padding: 24,
      backgroundColor: theme.background,
      marginTop: -30,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.isDark
        ? 'rgba(182, 119, 29, 0.2)'
        : 'rgba(182, 119, 29, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    categoryText: {
      fontSize: 13,
      fontWeight: '600',
      color: ColorSecond,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dateText: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.text,
      lineHeight: 34,
      marginBottom: 16,
    },
    divider: {
      height: 2,
      backgroundColor: ColorSecond,
      width: 60,
      borderRadius: 1,
      marginBottom: 20,
    },
    fullContent: {
      fontSize: 15,
      color: theme.text,
      lineHeight: 24,
      marginBottom: 32,
    },
    shareSection: {
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: theme.isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)',
    },
    shareTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    shareButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    shareButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.isDark
        ? 'rgba(182, 119, 29, 0.2)'
        : 'rgba(182, 119, 29, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.isDark
        ? 'rgba(182, 119, 29, 0.3)'
        : 'rgba(182, 119, 29, 0.2)',
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
    },
  });

export default React.memo(NewsDetailScreen);
