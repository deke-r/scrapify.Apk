"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const About = () => {
  const router = useRouter()

  const features = [
    {
      icon: "flash",
      title: "Lightning Fast",
      description: "Quick and efficient service delivery",
    },
    {
      icon: "shield-checkmark",
      title: "Secure & Reliable",
      description: "99.9% uptime with enterprise security",
    },
    {
      icon: "settings",
      title: "Easy Integration",
      description: "Simple setup and comprehensive support",
    },
    {
      icon: "leaf",
      title: "Eco-Friendly",
      description: "Sustainable and environmentally responsible",
    },
  ]

  const stats = [
    { number: "10M+", label: "Items Processed" },
    { number: "50K+", label: "Happy Users" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ]

  const team = [
    {
      name: "John Doe",
      position: "CEO & Founder",
      description: "Passionate about sustainable technology",
    },
    {
      name: "Jane Smith",
      position: "CTO",
      description: "Leading technical innovation",
    },
    {
      name: "Mike Johnson",
      position: "Head of Operations",
      description: "Ensuring exceptional service delivery",
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#a8e6cf", "#ffffff"]} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          {/* <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>About Scrapify</Text>
          </View> */}

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Image source={require("../../assets/images/logo.png")} style={styles.heroImage} />
            <Text style={styles.heroTitle}>About Scrapify</Text>
            <Text style={styles.heroSubtitle}>
              Empowering businesses and individuals with intelligent waste management solutions
            </Text>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.missionText}>
              At Scrapify, we believe that waste should be transformed into valuable resources. Our mission is to
              democratize waste management by providing powerful, user-friendly tools that make recycling and scrap
              dealing simple, efficient, and profitable.
            </Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Choose Scrapify?</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: "#4CAF50" }]}>
                  <Ionicons name={feature.icon} size={24} color="white" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Impact</Text>
            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Team */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meet Our Team</Text>
            {team.map((member, index) => (
              <View key={index} style={styles.teamCard}>
                <View style={styles.teamAvatar}>
                  <Ionicons name="person" size={32} color="#4CAF50" />
                </View>
                <View style={styles.teamContent}>
                  <Text style={styles.teamName}>{member.name}</Text>
                  <Text style={styles.teamPosition}>{member.position}</Text>
                  <Text style={styles.teamDescription}>{member.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Contact CTA */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
            <Text style={styles.ctaSubtitle}>
              Join thousands of users who trust Scrapify for their waste management needs
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Contact Us</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default About

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a8e6cf",
    paddingBottom:-50
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  heroImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 15,
    textAlign: "center",
  },
  missionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    textAlign: "justify",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 16,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  teamCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  teamContent: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  teamPosition: {
    fontSize: 14,
    color: "#4CAF50",
    marginBottom: 5,
  },
  teamDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  ctaSection: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginVertical: 20,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
    textAlign: "center",
  },
  ctaSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
