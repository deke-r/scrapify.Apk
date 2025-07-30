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
      description: "Quick and efficient service delivery with real-time processing",
      color: "#FF6B35"
    },
    {
      icon: "shield-checkmark",
      title: "Secure & Reliable",
      description: "99.9% uptime with enterprise-grade security protocols",
      color: "#4CAF50"
    },
    {
      icon: "settings",
      title: "Easy Integration",
      description: "Simple setup and comprehensive technical support",
      color: "#2196F3"
    },
    {
      icon: "leaf",
      title: "Eco-Friendly",
      description: "Sustainable and environmentally responsible solutions",
      color: "#8BC34A"
    },
  ]

  const stats = [
    { number: "10M+", label: "Items Processed", icon: "analytics" },
    { number: "50K+", label: "Happy Users", icon: "people" },
    { number: "99.9%", label: "Uptime", icon: "checkmark-circle" },
    { number: "24/7", label: "Support", icon: "headset" },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "GreenTech Solutions",
      rating: 5,
      text: "Scrapify has revolutionized our waste management process. The platform is intuitive and has helped us increase our recycling efficiency by 40%.",
      avatar: "person"
    },
    {
      name: "Michael Chen",
      company: "EcoCorp Industries",
      rating: 5,
      text: "Outstanding service and support! The real-time tracking feature has made our operations much more transparent and efficient.",
      avatar: "person"
    },
    {
      name: "Emily Rodriguez",
      company: "Sustainable Living Co.",
      rating: 5,
      text: "As a small business, Scrapify has made waste management affordable and easy. The customer support team is incredibly helpful.",
      avatar: "person"
    },
  ]

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={16}
        color={index < rating ? "#FFD700" : "#E2E8F0"}
        style={{ marginRight: 2 }}
      />
    ))
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={["#f8fafc", "#e8f5e8", "#ffffff"]} 
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Image source={require("../../assets/images/logo.png")} style={styles.heroImage} />
            </View>
            <Text style={styles.heroTitle}>About Scrapify</Text>
            <Text style={styles.heroSubtitle}>
              Empowering businesses and individuals with intelligent waste management solutions
            </Text>
            <View style={styles.heroDivider} />
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="compass" size={28} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Our Mission</Text>
            </View>
            <View style={styles.missionCard}>
              <Text style={styles.missionText}>
                At Scrapify, we believe that waste should be transformed into valuable resources. Our mission is to
                democratize waste management by providing powerful, user-friendly tools that make recycling and scrap
                dealing simple, efficient, and profitable for everyone.
              </Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={28} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Why Choose Scrapify?</Text>
            </View>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                    <Ionicons name={feature.icon} size={32} color="white" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up" size={28} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Our Impact</Text>
            </View>
            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name={stat.icon} size={24} color="#4CAF50" />
                  </View>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Testimonials */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubbles" size={28} color="#2E7D32" />
              <Text style={styles.sectionTitle}>What Our Clients Say</Text>
            </View>
            {testimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <View style={styles.testimonialAvatar}>
                    <Ionicons name={testimonial.avatar} size={32} color="#4CAF50" />
                  </View>
                  <View style={styles.testimonialInfo}>
                    <Text style={styles.testimonialName}>{testimonial.name}</Text>
                    <Text style={styles.testimonialCompany}>{testimonial.company}</Text>
                    <View style={styles.starsContainer}>
                      {renderStars(testimonial.rating)}
                    </View>
                  </View>
                </View>
                <Text style={styles.testimonialText}>{testimonial.text}</Text>
              </View>
            ))}
          </View>

          {/* Contact CTA */}
          <View style={styles.ctaSection}>
            <View style={styles.ctaContent}>
              <Ionicons name="rocket" size={36} color="#2E7D32" style={styles.ctaIcon} />
              <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
              <Text style={styles.ctaSubtitle}>
                Join thousands of users who trust Scrapify for their waste management needs
              </Text>
              <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Contact Us</Text>
                <Ionicons name="arrow-forward" size={18} color="white" style={styles.ctaButtonIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default About

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  heroImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  heroTitle: {
    fontSize: 36,
    fontFamily: "Poppins-Bold",
    color: "#1a202c",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 18,
    fontFamily: "Poppins-Regular",
    color: "#4a5568",
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 300,
  },
  heroDivider: {
    width: 80,
    height: 6,
    backgroundColor: "#4CAF50",
    borderRadius: 3,
    marginTop: 24,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: "#1a202c",
    marginLeft: 12,
    letterSpacing: -0.5,
  },
  missionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  missionText: {
    fontSize: 18,
    fontFamily: "Poppins-Regular",
    color: "#4a5568",
    lineHeight: 28,
    textAlign: "center",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  featureContent: {
    alignItems: "center",
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#1a202c",
    marginBottom: 10,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#718096",
    lineHeight: 20,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: "#4CAF50",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#718096",
    textAlign: "center",
  },
  testimonialCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  testimonialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  testimonialAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#1a202c",
    marginBottom: 4,
  },
  testimonialCompany: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#4CAF50",
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
  },
  testimonialText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#4a5568",
    lineHeight: 24,
  },
  ctaSection: {
    backgroundColor: "rgba(76, 175, 80, 0.08)",
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 36,
    alignItems: "center",
    marginVertical: 28,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.2)",
  },
  ctaContent: {
    alignItems: "center",
  },
  ctaIcon: {
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 30,
    fontFamily: "Poppins-Bold",
    color: "#1a202c",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  ctaSubtitle: {
    fontSize: 18,
    fontFamily: "Poppins-Regular",
    color: "#718096",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 26,
    maxWidth: 300,
  },
  ctaButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginRight: 10,
  },
  ctaButtonIcon: {
    marginLeft: 4,
  },
})
