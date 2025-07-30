"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const Profile = () => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data.user);
      setUser(response.data.user);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      Alert.alert('Error', 'Failed to fetch profile info. Please login again.');
      router.replace('/(auth)/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access camera roll is required!");
      return;
    }

    // Pick image
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (pickerResult.cancelled) return;

  
    const localUri = pickerResult.assets ? pickerResult.assets[0].uri : pickerResult.uri;
    const filename = localUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename ?? '');
    const type = match ? `image/${match[1]}` : `image`;

    const formData = new FormData();
    formData.append('profilePic', { uri: localUri, name: filename, type });
    formData.append('userId', user._id); 

    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload-profile-pic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus('Upload successful!');
        await fetchProfile();
      } else {
        setUploadStatus(data.error || 'Upload failed.');
      }
    } catch (err) {
      setUploadStatus('Upload failed.');
    }
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      onPress: () => router.push('/edit-profile'),
    },
    {
      icon: "location-outline",
      title: "Edit Address",
      subtitle: "Update your address information",
      onPress: () => router.push('/edit-address'),
    },
    {
      icon: "list-outline",
      title: "My Orders",
      subtitle: "View your service history",
      onPress: () => Alert.alert("My Orders", "Order history feature coming soon!"),
    },
    {
      icon: "wallet-outline",
      title: "Earnings",
      subtitle: "Track your scrap sale earnings",
      onPress: () => Alert.alert("Earnings", "Earnings tracking feature coming soon!"),
    },
    {
      icon: "leaf-outline",
      title: "Environmental Impact",
      subtitle: "See your contribution to sustainability",
      onPress: () => Alert.alert("Environmental Impact", "Impact tracking feature coming soon!"),
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      subtitle: "Manage your notification preferences",
      onPress: () => Alert.alert("Notifications", "Notification settings coming soon!"),
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      onPress: () => Alert.alert("Help & Support", "Support feature coming soon!"),
    },
    {
      icon: "settings-outline",
      title: "Settings",
      subtitle: "App preferences and privacy",
      onPress: () => Alert.alert("Settings", "Settings feature coming soon!"),
    },
  ]

  const stats = [
    {
      icon: "bag-outline",
      value: user?.totalOrders,
      label: "Total Orders",
      color: "#4CAF50",
    },
    {
      icon: "cash-outline",
      value: user?.totalEarnings,
      label: "Total Earnings",
      color: "#2196F3",
    },
    {
      icon: "leaf-outline",
      value: user?.carbonSaved,
      label: "Carbon Saved",
      color: "#FF9800",
    },
  ]

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading address information...</Text>
        </View>
      </SafeAreaView>
    )
  }
  if (!user) return null

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#a8e6cf", "#ffffff"]} style={styles.gradient}>
        <ScrollView
          showsVerticalScrollIndicator={false} className=''
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          {/* <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={24} color="#2E7D32" />
            </TouchableOpacity>
          </View> */}

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              {user.profile_pic ? (
                <Image
                  source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${user.profile_pic}` }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="person" size={40} color="#4CAF50" />
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.memberBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.memberText}>Member since {user.memberSince}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  <Ionicons name={stat.icon} size={24} color="white" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* User Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>{user.phone}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>{user.address}</Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={24} color="#4CAF50" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() =>
              Alert.alert("Logout", "Are you sure you want to logout?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await AsyncStorage.removeItem('userToken'); 
                      router.replace('/(auth)/login');

                    } catch (error) {
                      console.error("Error logging out", error);
                    }
                  },
                },
              ])
            }
          >
            <Ionicons name="log-out-outline" size={24} color="#F44336" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a8e6cf",
    paddingBottom: -50
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  editButton: {
    padding: 5,
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#4CAF50",
    overflow: 'hidden',
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  memberText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 20,
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  infoSection: {
    marginHorizontal: 16,
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 15,
    flex: 1,
  },
  menuSection: {
    marginHorizontal: 16,
    marginTop: 25,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.3)",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F44336",
    marginLeft: 10,
  },
})
