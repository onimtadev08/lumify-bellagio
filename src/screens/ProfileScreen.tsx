// screens/ProfileScreen.tsx
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DrawerParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  DrawerScreenProps<DrawerParamList, 'ProfileScreen'>,
  NativeStackScreenProps<RootStackParamList>
>;

class ProfileScreen extends Component<Props> {
  goBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    const { emp_Name, photo } = this.props.route.params;

    return (
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={this.goBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>

          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          <View style={styles.profileCard}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${photo}` }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{emp_Name}</Text>
            <Text style={styles.profileEmail}>user@example.com</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{emp_Name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>user@example.com</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>+1 234 567 8900</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>January 2024</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <TouchableOpacity style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>🔔 Notifications</Text>
              <Text style={styles.preferenceValue}>On</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>🌙 Dark Mode</Text>
              <Text style={styles.preferenceValue}>Enabled</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>🌐 Language</Text>
              <Text style={styles.preferenceValue}>English</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2a2a2a',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#2a2a2a',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#4A90FF',
  },
  profileName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileEmail: {
    color: '#999',
    fontSize: 16,
  },
  section: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  infoLabel: {
    color: '#999',
    fontSize: 16,
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  preferenceLabel: {
    color: '#fff',
    fontSize: 16,
  },
  preferenceValue: {
    color: '#4A90FF',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#4A90FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
